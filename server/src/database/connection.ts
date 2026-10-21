import Database from 'better-sqlite3';
import path from 'path';

const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../database.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DATABASE_PATH);

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Enable foreign keys
    db.pragma('foreign_keys = ON');
  }

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
