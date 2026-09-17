import Constants from 'expo-constants';
import { File } from 'expo-file-system';

import { getToken, setToken } from '@/lib/auth-token';

/**
 * Base URL for the Wuzy backend.
 *
 * When running via the Expo dev server, hostUri is the machine that serves
 * the JS bundle (e.g. "192.168.1.10:8081"). We reuse its host with the
 * backend port so emulators and physical devices on the same network reach
 * the FastAPI server automatically. Release builds have no dev server, so
 * they take EXPO_PUBLIC_API_URL, inlined at bundle time.
 */
const devHost = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
// Paths are appended as `/path`, so a trailing slash on the base would 404 every route.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? `http://${devHost}:8000`).replace(/\/+$/, '');

const API_HEADERS = {
  'Content-Type': 'application/json',
};

/** Random id for this app run. New on every launch, so ephemeral posts viewed
 * this session stay in the feed until the app is closed and reopened. */
const SESSION_ID = `s-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

/** Attach the stored JWT as a bearer token so the server can verify the caller. */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  const headers: Record<string, string> = { 'X-Session-Id': SESSION_ID };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/** Surface the backend's `detail` so screens can show it, falling back to the status. */
async function throwHttpError(res: Response): Promise<never> {
  let detail: string | undefined;
  try {
    const body = await res.json();
    detail = typeof body?.detail === 'string' ? body.detail : body?.detail?.[0]?.msg;
  } catch {
    // No JSON body.
  }
  const error = new Error(detail ?? (res.status === 401 ? 'Unauthorized' : `Request failed: ${res.status}`));
  throw Object.assign(error, { status: res.status });
}

/** True when a request was rejected by the server for a missing, expired or forged token. */
export function isAuthError(e: unknown): boolean {
  return (e as { status?: number } | null)?.status === 401;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) await throwHttpError(res);
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: await authHeaders() });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...API_HEADERS, ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { ...API_HEADERS, ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

/** Fire-and-forget POST that returns 204 with no body (e.g. view recording, push token registration). */
export async function apiPostNoContent(path: string, body?: unknown): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...API_HEADERS, ...(await authHeaders()) },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) await throwHttpError(res);
}

/** Record that the current user viewed a post. Idempotent. */
export function recordView(postId: number): Promise<void> {
  return apiPostNoContent(`/feed/${postId}/view`);
}

/** Why a recommendation engine put this event where it did. The UI labels a
 * card with the dominant signal so a user can see their own interests and
 * tribe heat in action. */
export interface ApiRecommendationReason {
  /** Which streak label to render: "matched" when Interest wins, "trending"
   * when tribe heat does, "discover" for popularity/freshness with no match. */
  reason: 'interest' | 'trending' | 'discover';
  /** Blended 0..1 rank weight. Not shown on the card but useful for tests. */
  score: number;
}

/** One event from GET /events/recommended, with the engine's per-user ranking. */
export interface ApiRecommendedEvent {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  host_name: string | null;
  host_avatar_url: string | null;
  category: string;
  tags: string[];
  venue: string | null;
  location: string | null;
  price: string | null;
  start_time: string;
  created_at: string;
  score: number;
  reason: 'interest' | 'trending' | 'discover';
}

/** Personalized, ranked event feed for the current user. */
export function apiGetRecommendedEvents(): Promise<ApiRecommendedEvent[]> {
  return apiGet<ApiRecommendedEvent[]>('/events/recommended');
}

/** A single event, for the details and ticket screens. */
export function apiGetEvent(eventId: number): Promise<ApiRecommendedEvent> {
  return apiGet<ApiRecommendedEvent>(`/events/${eventId}`);
}

/** One category pill for the explore filter bar, ranked to the user's interests. */
export interface ApiEventCategory {
  id: string;
  label: string;
}

/** Category pills for the current user; the feed filters on the id. */
export function apiGetEventCategories(): Promise<ApiEventCategory[]> {
  return apiGet<ApiEventCategory[]>('/events/categories');
}

/** Record a view or a "going" RSVP. Idempotent; feeds the recommendation heat. */
export function apiEngageEvent(eventId: number, kind: 'view' | 'going'): Promise<void> {
  return apiPostNoContent(`/events/${eventId}/engage`, { kind });
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  user: ApiUser;
}

/** Login, then persist the JWT to the secure store before returning the session. */
export async function apiLogin(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  const session = await handleResponse<AuthSession>(res);
  await setToken(session.access_token);
  return session;
}

/** Whose token is this? Used to restore a session on app start. */
export function apiMe(): Promise<ApiUser> {
  return apiGet<ApiUser>('/auth/me');
}

export async function uploadImage(kind: 'post' | 'avatar' | 'audio', uri: string) {
  const file = new File(uri);
  const form = new FormData();
  form.append('file', file as unknown as Blob);

  const res = await fetch(`${API_URL}/upload/${kind}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: form,
  });
  return handleResponse<{ url: string; kind: string }>(res);
}

/** Turns a backend-relative path (e.g. /uploads/post/x.png) into a full URL. */
export function assetUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  return `${API_URL}${path}`;
}

export interface ApiUser {
  id: number;
  email: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  hobbies: string[] | null;
  avatar_url: string | null;
  gender: string | null;
  /** YYYY-MM-DD */
  birthday: string | null;
  is_active: boolean;
  created_at: string;
  total_xp: number;
  badge_deck: number[] | null;
}

/** Register an account. The backend names the plaintext field hashed_password; log in afterwards for a token. */
export function apiSignup(payload: {
  email: string;
  username: string;
  password: string;
  display_name: string;
  gender: string;
  birthday: string | null;
  hobbies: string[];
}): Promise<ApiUser> {
  const { password, ...rest } = payload;
  return apiPost<ApiUser>('/users/', { ...rest, hashed_password: password });
}

/** True means free. Onboarding checks each handle on its own page. */
export function apiAvailability(query: { email?: string; username?: string }): Promise<{ email: boolean; username: boolean }> {
  return apiGet(`/users/availability?${new URLSearchParams(query).toString()}`);
}

export interface ApiPost {
  id: number;
  media_url: string;
  caption: string | null;
  location: string | null;
  save_to_profile: boolean;
  user_id: number;
  created_at: string;
  user: ApiUser | null;
  like_count: number;
  liked_by_me: boolean;
}

/** Toggle my like on a post. Returns the new state and count. */
export function likePost(postId: number): Promise<{ liked: boolean; like_count: number }> {
  return apiPost(`/posts/${postId}/like`, {});
}

export interface ApiConversation {
  id: number;
  other: ApiUser | null;
  preview: string | null;
  unread: number;
  last_message_at: string | null;
}

/** A Connection and the thread the current user can chat in, if one exists. */
export interface ApiPerson {
  conversation_id: number | null;
  user: ApiUser;
}

export interface ApiGroup {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
  members: ApiUser[];
}

export type QuestCategory = 'social' | 'events' | 'habits';

export interface ApiQuestTier {
  id: number;
  name: string;
  target_count: number;
  progress_unit: string;
  reward_xp: number;
  current_progress: number;
  claimed: boolean;
}

/** One quest line. active_tier_index is null once every tier is claimed. */
export interface ApiQuest {
  key: string;
  name: string;
  description: string;
  category: QuestCategory;
  sort_order: number;
  badge_id: number | null;
  tiers: ApiQuestTier[];
  active_tier_index: number | null;
  claimable: boolean;
  completed: boolean;
}

export interface ApiQuestXp {
  total_xp: number;
  rank: string;
  rank_index: number;
  next_rank: string | null;
  rank_threshold: number;
  next_threshold: number | null;
}

/** Everything the Awards tab shows, in one response. */
export interface ApiQuestDashboard {
  xp: ApiQuestXp;
  deck: number[];
  quests: ApiQuest[];
}

export interface ApiTicketEvent {
  id: number;
  title: string;
  image_url: string | null;
  start_time: string;
  venue: string | null;
  location: string | null;
}

export interface ApiTicketRead {
  id: number;
  user_id: number;
  ticket_type: string;
  purchased_at: string;
  event_id: number | null;
  gifted_by: number | null;
  event: ApiTicketEvent | null;
}

export interface ApiAwardRead {
  id: number;
  user_id: number;
  award_type: string;
  tier: number | null;
  reward_xp: number;
  badge_id: number | null;
  awarded_at: string;
}

export function apiGetQuestDashboard(): Promise<ApiQuestDashboard> {
  return apiGet<ApiQuestDashboard>('/quests/');
}

/** Claim the active tier of a quest. Returns the refreshed dashboard. */
export function apiClaimQuest(key: string): Promise<ApiQuestDashboard> {
  return apiPost<ApiQuestDashboard>(`/quests/${key}/claim`, {});
}

/** Count today toward the daily streak. The server dedupes by date. */
export function apiDailyLogin(): Promise<ApiQuestDashboard> {
  return apiPost<ApiQuestDashboard>('/quests/daily-login', {});
}

export function apiUpdateMe(
  patch: Partial<Pick<ApiUser, 'display_name' | 'bio' | 'hobbies' | 'avatar_url'>>,
): Promise<ApiUser> {
  return apiPatch<ApiUser>('/users/me', patch);
}

/** A referral request: the sender introduced two users to each other. */
export interface ApiReferralRequest {
  id: number;
  sender_id: number;
  first_user_id: number;
  second_user_id: number;
  /** Overall: 'pending' until both sides resolve, then 'accepted' or 'declined'. */
  status: string;
  first_status: string;
  second_status: string;
  /** True once the sender finished the resolved-state UI (the 1s outcome flash). */
  consumed: boolean;
  created_at: string;
  sender_name: string | null;
  first_name: string | null;
  second_name: string | null;
  sender_avatar_url: string | null;
}

/** Refer two users to each other. Idempotent per sender/pair while pending. */
export function createReferral(firstUserId: number, secondUserId: number): Promise<ApiReferralRequest> {
  return apiPost<ApiReferralRequest>('/referrals', { first_user_id: firstUserId, second_user_id: secondUserId });
}

export function getOutgoingReferrals(): Promise<ApiReferralRequest[]> {
  return apiGet<ApiReferralRequest[]>('/referrals/outgoing');
}

/** The Connections (mutual follows) of an arbitrary user. The refer screen uses this to hide people the referred user already knows. */
export function getUserConnections(userId: number): Promise<ApiUser[]> {
  return apiGet<ApiUser[]>(`/users/${userId}/connections`);
}

/** One row on the notifications page. `payload.text` is the full sentence and
 * `payload.url` the deep link; referral rows also carry `my_status`, `status`
 * and `other_name` so the card knows whether to show Accept/Decline. */
export interface ApiNotification {
  id: number;
  type: string;
  actor_id: number | null;
  entity_id: number | null;
  payload: {
    text: string;
    url: string;
    actor_name?: string;
    actor_avatar_url?: string | null;
    other_name?: string;
    my_status?: string;
    status?: string;
  };
  read_at: string | null;
  created_at: string;
}

export function getNotifications(): Promise<ApiNotification[]> {
  return apiGet<ApiNotification[]>('/notifications');
}

export function markNotificationsRead(): Promise<void> {
  return apiPostNoContent('/notifications/read');
}

/** Accept or decline a referral. Only the referred user can respond. */
export function respondReferral(id: number, accept: boolean): Promise<ApiReferralRequest> {
  return apiPost<ApiReferralRequest>(`/referrals/${id}/respond`, { accept });
}

/** Tell the sender a resolved referral has been seen, so its card returns to the Send Request pill. Idempotent. */
export function consumeReferral(id: number): Promise<ApiReferralRequest> {
  return apiPost<ApiReferralRequest>(`/referrals/${id}/consume`, {});
}

export function apiPurchaseTickets(quantity: number, eventId?: number): Promise<ApiTicketRead[]> {
  return apiPost<ApiTicketRead[]>('/tickets/purchase', { quantity, event_id: eventId ?? null });
}

/** Count a share of my ticket. Call it only after the share sheet confirms. */
export function apiShareTicket(ticketId: number): Promise<void> {
  return apiPostNoContent(`/tickets/${ticketId}/share`);
}

/** Gift one or more tickets to a connection. They get the tickets and a notification. */
export function apiGiftTicket(toUserId: number, eventId: number, quantity = 1): Promise<ApiTicketRead[]> {
  return apiPost<ApiTicketRead[]>('/tickets/gift', { to_user_id: toUserId, event_id: eventId, quantity });
}

export function apiGetTickets(): Promise<ApiTicketRead[]> {
  return apiGet<ApiTicketRead[]>('/tickets/');
}

export function apiGetAwards(): Promise<ApiAwardRead[]> {
  return apiGet<ApiAwardRead[]>('/awards/');
}

export function apiGetUserAwards(userId: number): Promise<ApiAwardRead[]> {
  return apiGet<ApiAwardRead[]>(`/awards/user/${userId}`);
}

/** Compact "ago" label: 5m, 2h, 1d, 12 Aug. Empty for missing timestamps. */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return 'now';
  if (diff < hour) return `${Math.floor(diff / minute)}m`;
  if (diff < day) return `${Math.floor(diff / hour)}h`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}