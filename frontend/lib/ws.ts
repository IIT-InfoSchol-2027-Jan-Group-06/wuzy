import { API_URL } from '@/lib/api';
import { getToken } from '@/lib/auth-token';
import { getPendingMessages, markMessagesSent, saveMessage, type ThreadKind } from '@/lib/chat-db';

/** A live chat frame. DMs carry `conversation_id`+`to`; group messages carry
 * `group_id`. The server fills in `from_name` so group bubbles can be labeled. */
export type ChatMessage = {
  type: 'message';
  from: number;
  from_name?: string | null;
  to?: number;
  conversation_id?: number;
  group_id?: number;
  text: string;
  created_at: string;
};

export type ChatThread = { kind: 'dm' | 'group'; id: number };

export type ChatListener = (m: ChatMessage) => void;

let socket: WebSocket | null = null;
let socketUserId: number | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;
let holds = 0;
const listeners = new Set<ChatListener>();

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
      const data = JSON.parse(event.data) as ChatMessage;
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

/** Build an outgoing frame, persist it locally, and send it if a socket is up.
 * Returns the message so the caller can render it optimistically. */
export function sendDm(from: number, to: number, conversationId: number, text: string): ChatMessage {
  const message: ChatMessage = {
    type: 'message',
    from,
    to,
    conversation_id: conversationId,
    text,
    created_at: new Date().toISOString(),
  };
  persistAndSend(from, 'dm', message);
  return message;
}

export function sendGroup(from: number, groupId: number, text: string): ChatMessage {
  const message: ChatMessage = {
    type: 'message',
    from,
    group_id: groupId,
    text,
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
      type: 'message',
      from: ownerId,
      text: m.text,
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