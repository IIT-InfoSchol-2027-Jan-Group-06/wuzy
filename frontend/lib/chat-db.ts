import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { ChatMessage } from '@/lib/ws';

export type ThreadKind = 'dm' | 'group';

/** A locally-cached message, normalized to a single thread key (kind + id). */
export type StoredMessage = {
  kind: ThreadKind;
  thread_id: number;
  from: number;
  from_name?: string | null;
  text: string;
  created_at: string;
};

const DB_VERSION = 2;

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

      // Dev-only schema migration: rebuild if the table predates the group
      // columns. Local cache, so losing it on a version bump is fine.
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
            text TEXT NOT NULL,
            created_at TEXT NOT NULL
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
    text: message.text,
    created_at: message.created_at,
  };
}

export async function saveMessage(ownerId: number, kind: ThreadKind, message: ChatMessage): Promise<void> {
  const db = await getDb();
  const row = toStored(kind, message);
  await db.runAsync(
    `INSERT INTO messages (owner_id, kind, thread_id, from_id, from_name, text, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ownerId,
    kind,
    row.thread_id,
    row.from,
    row.from_name ?? null,
    row.text,
    row.created_at,
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
