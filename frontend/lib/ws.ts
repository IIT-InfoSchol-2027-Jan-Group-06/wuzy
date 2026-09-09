import { API_URL } from '@/lib/api';
import { getToken } from '@/lib/auth-token';

export type ChatMessage = {
  type: 'message';
  from: number;
  to: number;
  conversation_id: number;
  text: string;
  created_at: string;
};

export type ChatSocket = {
  send: (to: number, text: string) => void;
  close: () => void;
};

/**
 * Open a live chat WebSocket for the given user and subscribe to incoming
 * messages (including any queued offline messages replayed on connect).
 */
export async function connectChat(
  userId: number,
  conversationId: number,
  onMessage: (m: ChatMessage) => void,
): Promise<ChatSocket> {
  const token = await getToken();
  const wsUrl = new URL(`/ws/${userId}`, API_URL);
  wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
  wsUrl.searchParams.set('token', token ?? '');

  const socket = new WebSocket(wsUrl.toString());

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data?.type === 'message' && data.conversation_id === conversationId) {
        onMessage(data);
      }
    } catch {
      // Ignore malformed frames.
    }
  };

  return {
    send(to, text) {
      const payload: ChatMessage = {
        type: 'message',
        from: userId,
        to,
        conversation_id: conversationId,
        text,
        created_at: new Date().toISOString(),
      };
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
      }
    },
    close() {
      socket.close();
    },
  };
}
