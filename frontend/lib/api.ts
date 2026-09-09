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
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${devHost}:8000`;

const API_HEADERS = {
  'Content-Type': 'application/json',
};

/** Attach the stored JWT as a bearer token so the server can verify the caller. */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response, path: string): Promise<T> {
  if (!res.ok) {
    throw new Error(`${res.status === 401 ? 'Unauthorized' : `Request failed`}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: await authHeaders() });
  return handleResponse<T>(res, path);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...API_HEADERS, ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res, path);
}

/** Fire-and-forget POST that returns 204 with no body (e.g. view recording, push token registration). */
export async function apiPostNoContent(path: string, body?: unknown): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...API_HEADERS, ...(await authHeaders()) },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
}

/** Record that the current user viewed a post. Idempotent. */
export function recordView(postId: number): Promise<void> {
  return apiPostNoContent(`/feed/${postId}/view`);
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
  const session = await handleResponse<AuthSession>(res, '/auth/login');
  await setToken(session.access_token);
  return session;
}

/** Whose token is this? Used to restore a session on app start. */
export function apiMe(): Promise<ApiUser> {
  return apiGet<ApiUser>('/auth/me');
}

export async function uploadImage(kind: 'post' | 'avatar', uri: string) {
  const file = new File(uri);
  const form = new FormData();
  form.append('file', file as unknown as Blob);

  const res = await fetch(`${API_URL}/upload/${kind}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
  return res.json() as Promise<{ url: string; kind: string }>;
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
  is_active: boolean;
  created_at: string;
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

export interface ApiBadge {
  id: number;
  name: string;
  image_url: string;
  is_unlocked: boolean;
}

export interface ApiTask {
  id: number;
  title: string;
  current_progress: number;
  target_progress: number;
  progress_unit: string;
  status: 'CLAIMABLE' | 'IN_PROGRESS' | 'CLAIMED' | string;
  action_type: string;
  badge_image_url: string;
}

export interface ApiAwardsDashboard {
  badges: ApiBadge[];
  tasks: ApiTask[];
  ready_count: number;
}

export interface ApiTaskClaim {
  id: number;
  status: string;
  badge_unlocked: boolean;
}

export function apiGetAwards(): Promise<ApiAwardsDashboard> {
  return apiGet<ApiAwardsDashboard>('/awards/');
}

export function apiClaimTask(taskId: number): Promise<ApiTaskClaim> {
  return apiPost<ApiTaskClaim>(`/awards/tasks/${taskId}/claim`, {});
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