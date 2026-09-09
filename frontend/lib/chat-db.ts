import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import type { ChatMessage } from '@/lib/ws';

export type StoredMessage = Pick<ChatMessage, 'from' | 'to' | 'conversation_id' | 'text' | 'created_at'>;

let dbPromise: Promise<SQLiteDatabase> | null = null;

/**
 * Per-user local message store. The backend keeps no history, so each device
 * caches its own messages here and they survive app restarts. Rows are scoped
 * by owner_id so multiple accounts on one device do not bleed into each other.
 */
function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('wuzy-chat.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          owner_id INTEGER NOT NULL,
          conversation_id INTEGER NOT NULL,
          from_id INTEGER NOT NULL,
          to_id INTEGER NOT NULL,
          text TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_messages_owner_conv
          ON messages (owner_id, conversation_id, created_at, id);
      `);
      return db;
    })();
  }
  return dbPromise;
}

export async function saveMessage(ownerId: number, message: StoredMessage): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO messages (owner_id, conversation_id, from_id, to_id, text, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ownerId,
    message.conversation_id,
    message.from,
    message.to,
    message.text,
    message.created_at,
  );
}

/** Full thread oldest-first for one conversation, limited to the last 200. */
export async function getMessages(ownerId: number, conversationId: number): Promise<StoredMessage[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    conversation_id: number;
    from_id: number;
    to_id: number;
    text: string;
    created_at: string;
  }>(
    `SELECT conversation_id, from_id, to_id, text, created_at
     FROM messages
     WHERE owner_id = ? AND conversation_id = ?
     ORDER BY id DESC
     LIMIT 200`,
    ownerId,
    conversationId,
  );
  return rows
    .reverse()
    .map((r) => ({
      conversation_id: r.conversation_id,
      from: r.from_id,
      to: r.to_id,
      text: r.text,
      created_at: r.created_at,
    }));
}

/** Newest message id per conversation, used to build the chat list preview. */
export type ConversationSummaryRow = {
  conversation_id: number;
  text: string;
  created_at: string;
};

export async function getConversationSummaries(ownerId: number): Promise<ConversationSummaryRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ConversationSummaryRow>(
    `SELECT m.conversation_id, m.text, m.created_at
     FROM messages m
     JOIN (
       SELECT conversation_id, MAX(id) AS max_id
       FROM messages
       WHERE owner_id = ?
       GROUP BY conversation_id
     ) latest ON latest.conversation_id = m.conversation_id AND latest.max_id = m.id
     WHERE m.owner_id = ?
     ORDER BY m.created_at DESC;`,
    ownerId,
    ownerId,
  );
  return rows;
}
