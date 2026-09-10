import type { ChatThread } from '@/lib/ws';

let lastActive: ChatThread | null = null;

/** Record which thread just had activity so the chat list can move it to the
 * top and highlight it when the user returns. */
export function markThreadActive(thread: ChatThread): void {
  lastActive = thread;
}

/** Read (and clear) the most recently active thread. Used by the chat list on
 * focus to highlight the thread the user just left. */
export function consumeThreadActive(): ChatThread | null {
  const current = lastActive;
  lastActive = null;
  return current;
}
