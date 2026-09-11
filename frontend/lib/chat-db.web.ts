export type ThreadKind = 'dm' | 'group';

export type StoredMessage = {
  id?: number;
  kind: ThreadKind;
  thread_id: number;
  from: number;
  from_name?: string | null;
  to_id?: number | null;
  text: string;
  created_at: string;
  pending?: number;
  is_read?: number;
};

export type ThreadSummaryRow = {
  kind: ThreadKind;
  thread_id: number;
  text: string;
  created_at: string;
};

export async function saveMessage(): Promise<void> {}
export async function getMessages(): Promise<StoredMessage[]> { return []; }
export async function getThreadSummaries(): Promise<ThreadSummaryRow[]> { return []; }
export async function getThreadLastActivity(): Promise<string | null> { return null; }
export async function getUnreadCounts(): Promise<Map<string, number>> { return new Map(); }
export async function getUnreadNotifications(): Promise<StoredMessage[]> { return []; }
export async function getUnreadTotal(): Promise<number> { return 0; }
export async function markThreadRead(): Promise<void> {}
export async function getPendingMessages(): Promise<StoredMessage[]> { return []; }
export async function markMessagesSent(): Promise<void> {}
