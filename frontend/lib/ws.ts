import { API_URL } from '@/lib/api';
import { getToken } from '@/lib/auth-token';

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

export type ChatSocket = {
  /** Send a 1:1 direct message to a recipient user id. */
  sendDm: (to: number, text: string) => void;
  /** Send a message into the open group thread. */
  sendGroup: (text: string) => void;
  close: () => void;
};

/**
 * Open a live chat WebSocket for the given user and subscribe to incoming
 * messages for one thread (including queued offline messages replayed on
 * connect). Returns an object to send DMs or group messages.
 */
export async function connectChat(
  userId: number,
  thread: ChatThread,
  onMessage: (m: ChatMessage) => void,
): Promise<ChatSocket> {
  const token = await getToken();
  const wsUrl = new URL(`/ws/${userId}`, API_URL);
  wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  wsUrl.searchParams.set('token', token ?? '');

  const socket = new WebSocket(wsUrl.toString());

  const matches = (data: ChatMessage) =>
    data?.type === 'message' &&
    (thread.kind === 'dm'
      ? data.group_id == null && data.conversation_id === thread.id
      : data.group_id === thread.id);

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (matches(data)) onMessage(data);
    } catch {
      // Ignore malformed frames.
    }
  };

  const base = (text: string) => ({
    type: 'message' as const,
    from: userId,
    text,
    created_at: new Date().toISOString(),
  });

  return {
    sendDm(to, text) {
      const payload: ChatMessage = {
        ...base(text),
        to,
        conversation_id: thread.id,
      };
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
    },
    sendGroup(text) {
      const payload: ChatMessage = {
        ...base(text),
        group_id: thread.id,
      };
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
    },
    close() {
      socket.close();
    },
  };
}
