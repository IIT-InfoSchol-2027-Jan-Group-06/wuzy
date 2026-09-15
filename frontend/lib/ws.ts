import { API_URL } from '@/lib/api';
import { getToken } from '@/lib/auth-token';
import { getPendingMessages, markMessagesSent, saveMessage, type ThreadKind } from '@/lib/chat-db';

/** A live chat frame. DMs carry `conversation_id`+`to`; group messages carry
 * `group_id`. The server fills in `from_name` so group bubbles can be labeled.
 * `media_url` is an optional photo URL; the caption text rides in `text`.
 * Voice notes are `voice_note` frames with `audio_url` + `duration_ms` (no
 * text); the server routes them exactly like messages. */
export type ChatMessage = {
  type: 'message' | 'voice_note';
  from: number;
  from_name?: string | null;
  to?: number;
  conversation_id?: number;
  group_id?: number;
  text: string;
  media_url?: string | null;
  audio_url?: string | null;
  duration_ms?: number | null;
  created_at: string;
};

export type ChatThread = { kind: 'dm' | 'group'; id: number };

export type ChatListener = (m: ChatMessage) => void;

/** A live referral notice routed over the same socket. Not chat: no thread or
 * cache write, just an inbox refresh signal for the notifications screen. */
export type ReferralFrame = {
  type: 'referral';
  request_id: number;
  sender_id: number;
  first_user_id: number;
  second_user_id: number;
  sender_name: string | null;
  first_name: string | null;
  second_name: string | null;
  status: string;
  created_at: string;
};

/** A live referral response, routed to the sender so their refer screen can
 * reflect a recipient's accept/decline while it is open. */
export type ReferralResponseFrame = {
  type: 'referral_response';
  request_id: number;
  sender_id: number;
  first_user_id: number;
  second_user_id: number;
  first_name: string | null;
  second_name: string | null;
  first_status: string;
  second_status: string;
  status: string;
};

let socket: WebSocket | null = null;
let socketUserId: number | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;
let holds = 0;
const listeners = new Set<ChatListener>();

const referralListeners = new Set<(f: ReferralFrame) => void>();
const referralResponseListeners = new Set<(f: ReferralResponseFrame) => void>();

/** Subscribe to live referral frames. Returns an unsubscribe handle. */
export function subscribeReferrals(listener: (f: ReferralFrame) => void): () => void {
  referralListeners.add(listener);
  return () => {
    referralListeners.delete(listener);
  };
}

/** Subscribe to live referral response frames (accept/decline from the person referred). */
export function subscribeReferralResponses(listener: (f: ReferralResponseFrame) => void): () => void {
  referralResponseListeners.add(listener);
  return () => {
    referralResponseListeners.delete(listener);
  };
}

/**
 * One shared socket per logged-in user (WhatsApp-style): the app never opens a
 * socket per thread. It comes up while the user is in chats (list, a thread, or
 * notifications) and drops when they leave, tracked by a refcount. Inbound
 * frames for this user are saved to the local cache and forwarded to every
 * registered listener so the chat list and open threads update in real time.
 *
 * Outgoing messages are saved to the local cache first. If the socket is up
 * they are sent immediately; otherwise they are flagged `pending` and flushed
 * in order the next time a connection is established.
 */

/** Open the shared socket while the caller is on screen. Returns a release. */
export function acquireChat(userId: number) {
  holds += 1;
  if (!socket) {
    connectSocket(userId);
  }
  return () => {
    holds = Math.max(0, holds - 1);
    if (holds === 0) disconnectSocket();
  };
}

/** Subscribe to inbound frames. Returns a function that removes the listener. */
export function subscribeChat(listener: ChatListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function connectSocket(userId: number): Promise<void> {
  socketUserId = userId;

  const token = await getToken();
  const wsUrl = new URL(`/ws/${userId}`, API_URL);
  wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  wsUrl.searchParams.set('token', token ?? '');

  const ws = new WebSocket(wsUrl.toString());
  socket = ws;

  ws.onopen = () => {
    if (socket !== ws) return;
    reconnectDelay = 1000;
    flushPending(userId);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as ChatMessage | ReferralFrame | ReferralResponseFrame;
      if (data?.type === 'referral') {
        for (const listener of referralListeners) listener(data);
        return;
      }
      if (data?.type === 'referral_response') {
        for (const listener of referralResponseListeners) listener(data);
        return;
      }
      if (data?.type !== 'message') return;
      const kind: ThreadKind = data.group_id != null ? 'group' : 'dm';
      const threadId = kind === 'group' ? data.group_id : data.conversation_id;
      if (threadId == null) return;
      saveMessage(userId, kind, data, { isRead: false });
      for (const listener of listeners) listener(data);
    } catch {
      // Ignore malformed frames.
    }
  };

  ws.onclose = () => {
    if (socket !== ws) return;
    socket = null;
    if (socketUserId !== null) {
      reconnectDelay = Math.min(reconnectDelay * 2, 30_000);
      reconnectTimer = setTimeout(() => {
        if (socketUserId !== null && !socket) connectSocket(socketUserId);
      }, reconnectDelay);
    }
  };
}

function disconnectSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  socket?.close();
  socket = null;
  socketUserId = null;
}

/** Extra fields for a voice-note send: when `audioUrl` is set, the frame is a
 * `voice_note` carrying the audio URL and its duration in milliseconds. */
export type MessageExtras = {
  audioUrl: string;
  durationMs: number;
};

/** Build an outgoing frame, persist it locally, and send it if a socket is up.
 * Returns the message so the caller can render it optimistically. */
export function sendDm(
  from: number,
  to: number,
  conversationId: number,
  text: string,
  mediaUrl?: string,
  extras?: MessageExtras,
): ChatMessage {
  const message: ChatMessage = {
    type: extras ? 'voice_note' : 'message',
    from,
    to,
    conversation_id: conversationId,
    text,
    media_url: mediaUrl ?? null,
    audio_url: extras?.audioUrl ?? null,
    duration_ms: extras?.durationMs ?? null,
    created_at: new Date().toISOString(),
  };
  persistAndSend(from, 'dm', message);
  return message;
}

export function sendGroup(
  from: number,
  groupId: number,
  text: string,
  mediaUrl?: string,
  extras?: MessageExtras,
): ChatMessage {
  const message: ChatMessage = {
    type: extras ? 'voice_note' : 'message',
    from,
    group_id: groupId,
    text,
    media_url: mediaUrl ?? null,
    audio_url: extras?.audioUrl ?? null,
    duration_ms: extras?.durationMs ?? null,
    created_at: new Date().toISOString(),
  };
  persistAndSend(from, 'group', message);
  return message;
}

function persistAndSend(ownerId: number, kind: ThreadKind, message: ChatMessage): void {
  const isOpen = socket?.readyState === WebSocket.OPEN;
  saveMessage(ownerId, kind, message, { pending: !isOpen });
  if (isOpen && socket) {
    socket.send(JSON.stringify(message));
  }
}

/** Retry every cached pending message in order once the socket is up. */
async function flushPending(ownerId: number): Promise<void> {
  const pending = await getPendingMessages(ownerId);
  const sent: number[] = [];
  for (const m of pending) {
    if (!socket || socket.readyState !== WebSocket.OPEN) break;
    const frame: ChatMessage = {
      type: m.audio_url ? 'voice_note' : 'message',
      from: ownerId,
      text: m.text,
      media_url: m.media_url ?? null,
      audio_url: m.audio_url ?? null,
      duration_ms: m.duration_ms ?? null,
      created_at: m.created_at,
      ...(m.kind === 'dm'
        ? { to: m.to_id ?? undefined, conversation_id: m.thread_id }
        : { group_id: m.thread_id }),
    };
    socket.send(JSON.stringify(frame));
    if (m.id != null) sent.push(m.id);
  }
  if (sent.length > 0) await markMessagesSent(sent);
}