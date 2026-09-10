import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { ChatMessage } from '@/lib/ws';

export type ThreadKind = 'dm' | 'group';

/** A locally-cached message, normalized to a single thread key (kind + id).
 * `to_id` is the DM recipient, set on outgoing messages so a pending message
 * can be retried when the socket reconnects. `pending` marks messages saved
 * while offline that have not reached the server yet. `is_read` is 0 for
 * incoming messages the user has not opened yet. */
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

const DB_VERSION = 3;

let dbPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Per-user local message store. The backend keeps no history, so each device
 * caches its own messages here and they survive app restarts. Rows are scoped
 * by owner_id, and DMs vs groups share one table keyed by (kind, thread_id).
 */
function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('wuzy-chat.db');
      await db.execAsync(`PRAGMA journal_mode = WAL;`);

      // Dev-only schema migration: drop and rebuild on any version bump.
      // Local cache, so losing it is fine.
      const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      if ((versionRow?.user_version ?? 0) < DB_VERSION) {
        await db.execAsync(`
          DROP TABLE IF EXISTS messages;
          CREATE TABLE messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER NOT NULL,
            kind TEXT NOT NULL,
            thread_id INTEGER NOT NULL,
            from_id INTEGER NOT NULL,
            from_name TEXT,
            to_id INTEGER,
            text TEXT NOT NULL,
            created_at TEXT NOT NULL,
            pending INTEGER NOT NULL DEFAULT 0,
            is_read INTEGER NOT NULL DEFAULT 1
          );
          CREATE INDEX idx_messages_owner_thread
            ON messages (owner_id, kind, thread_id, created_at, id);
          PRAGMA user_version = ${DB_VERSION};
        `);
      }
      return db;
    })();
  }
  return dbPromise;
}

/** Normalize a wire frame into a stored row for the given thread kind. */
function toStored(kind: ThreadKind, message: ChatMessage) {
  return {
    thread_id: kind === 'dm' ? (message.conversation_id ?? 0) : (message.group_id ?? 0),
    from: message.from,
    from_name: message.from_name,
    to_id: kind === 'dm' ? (message.to ?? null) : null,
    text: message.text,
    created_at: message.created_at,
  };
}

export async function saveMessage(
  ownerId: number,
  kind: ThreadKind,
  message: ChatMessage,
  opts: { pending?: boolean; isRead?: boolean } = {},
): Promise<void> {
  const db = await getDb();
  const row = toStored(kind, message);
  await db.runAsync(
    `INSERT INTO messages (owner_id, kind, thread_id, from_id, from_name, to_id, text, created_at, pending, is_read)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ownerId,
    kind,
    row.thread_id,
    row.from,
    row.from_name ?? null,
    row.to_id,
    row.text,
    row.created_at,
    opts.pending ? 1 : 0,
    opts.isRead === false ? 0 : 1,
  );
}

/** Full thread oldest-first for one DM or group, limited to the last 200. */
export async function getMessages(
  ownerId: number,
  kind: ThreadKind,
  threadId: number,
): Promise<StoredMessage[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    kind: ThreadKind;
    thread_id: number;
    from_id: number;
    from_name: string | null;
    text: string;
    created_at: string;
  }>(
    `SELECT kind, thread_id, from_id, from_name, text, created_at
     FROM messages
     WHERE owner_id = ? AND kind = ? AND thread_id = ?
     ORDER BY id DESC
     LIMIT 200`,
    ownerId,
    kind,
    threadId,
  );
  return rows
    .reverse()
    .map((r) => ({
      kind: r.kind,
      thread_id: r.thread_id,
      from: r.from_id,
      from_name: r.from_name,
      text: r.text,
      created_at: r.created_at,
    }));
}

/** Latest message per thread, used to build the chat list (preview, order, highlight). */
export type ThreadSummaryRow = {
  kind: ThreadKind;
  thread_id: number;
  text: string;
  created_at: string;
};

export async function getThreadSummaries(ownerId: number): Promise<ThreadSummaryRow[]> {
  const db = await getDb();
  return db.getAllAsync<ThreadSummaryRow>(
    `SELECT m.kind, m.thread_id, m.text, m.created_at
     FROM messages m
     JOIN (
       SELECT kind, thread_id, MAX(id) AS max_id
       FROM messages
       WHERE owner_id = ?
       GROUP BY kind, thread_id
     ) latest ON latest.kind = m.kind AND latest.thread_id = m.thread_id AND latest.max_id = m.id
     WHERE m.owner_id = ?
     ORDER BY m.created_at DESC;`,
    ownerId,
    ownerId,
  );
}

/** Timestamp of the newest message in a thread, or null if the thread is empty. */
export async function getThreadLastActivity(
  ownerId: number,
  kind: ThreadKind,
  threadId: number,
): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ created_at: string }>(
    `SELECT created_at FROM messages
     WHERE owner_id = ? AND kind = ? AND thread_id = ?
     ORDER BY id DESC LIMIT 1`,
    ownerId,
    kind,
    threadId,
  );
  return row?.created_at ?? null;
}

/** Number of unread incoming messages, one row per thread. */
export async function getUnreadCounts(ownerId: number): Promise<Map<string, number>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ kind: ThreadKind; thread_id: number; n: number }>(
    `SELECT kind, thread_id, COUNT(*) AS n
     FROM messages
     WHERE owner_id = ? AND from_id != owner_id AND is_read = 0
     GROUP BY kind, thread_id`,
    ownerId,
  );
  return new Map(rows.map((r) => [`${r.kind}-${r.thread_id}`, r.n]));
}

/** Latest unread message per thread, used to build the "New message" notifications. */
export async function getUnreadNotifications(ownerId: number): Promise<StoredMessage[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    kind: ThreadKind;
    thread_id: number;
    from_id: number;
    from_name: string | null;
    text: string;
    created_at: string;
  }>(
    `SELECT m.kind, m.thread_id, m.from_id, m.from_name, m.text, m.created_at
     FROM messages m
     JOIN (
       SELECT kind, thread_id, MAX(id) AS max_id
       FROM messages
       WHERE owner_id = ? AND from_id != owner_id AND is_read = 0
       GROUP BY kind, thread_id
     ) latest ON latest.kind = m.kind AND latest.thread_id = m.thread_id AND latest.max_id = m.id
     ORDER BY m.created_at DESC;`,
    ownerId,
  );
  return rows.map((r) => ({
    kind: r.kind,
    thread_id: r.thread_id,
    from: r.from_id,
    from_name: r.from_name,
    text: r.text,
    created_at: r.created_at,
  }));
}

/** Total unread incoming messages across every thread (badge on the chat tab). */
export async function getUnreadTotal(ownerId: number): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n
     FROM messages
     WHERE owner_id = ? AND from_id != owner_id AND is_read = 0`,
    ownerId,
  );
  return row?.n ?? 0;
}

/** Mark every incoming message in a thread read (e.g. when the thread opens). */
export async function markThreadRead(ownerId: number, kind: ThreadKind, threadId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE messages SET is_read = 1
     WHERE owner_id = ? AND kind = ? AND thread_id = ? AND from_id != owner_id`,
    ownerId,
    kind,
    threadId,
  );
}

/** Outgoing messages saved while offline that have not reached the server yet. */
export async function getPendingMessages(ownerId: number): Promise<StoredMessage[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    id: number;
    kind: ThreadKind;
    thread_id: number;
    from_id: number;
    from_name: string | null;
    to_id: number | null;
    text: string;
    created_at: string;
    pending: number;
    is_read: number;
  }>(
    `SELECT id, kind, thread_id, from_id, from_name, to_id, text, created_at, pending, is_read
     FROM messages
     WHERE owner_id = ? AND pending = 1
     ORDER BY id ASC`,
    ownerId,
  );
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    thread_id: r.thread_id,
    from: r.from_id,
    from_name: r.from_name,
    to_id: r.to_id,
    text: r.text,
    created_at: r.created_at,
    pending: r.pending,
    is_read: r.is_read,
  }));
}

/** Mark pending messages as delivered to the server. */
export async function markMessagesSent(ids: number[]): Promise<void> {
  const db = await getDb();
  for (const id of ids) {
    await db.runAsync(`UPDATE messages SET pending = 0 WHERE id = ?`, id);
  }
}
