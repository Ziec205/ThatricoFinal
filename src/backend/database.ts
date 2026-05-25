import { Pool } from 'pg';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import path from 'path';

dotenv.config();

type QueryResult = { rows: any[]; lastInsertRowid?: number };

let client: {
  query: (text: string, params?: any[]) => Promise<QueryResult> | QueryResult;
  pool?: Pool;
  raw?: Database.Database;
};

if (process.env.DATABASE_URL) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  client = {
    query: (text: string, params?: any[]) => pool.query(text, params) as any,
    pool
  };
} else {
  // Fallback to sqlite for local development when DATABASE_URL is not provided
  const dbPath = path.resolve(process.cwd(), 'database.sqlite');
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      products TEXT NOT NULL,
      totalPrice REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Provide a minimal wrapper with `query` API used by models
  client = {
    query: (text: string, params?: any[]) => {
      const stmt = db.prepare(text.replace(/\$\d+/g, '?'));
      const normalizedText = text.trim().toLowerCase();

      if (normalizedText.startsWith('select')) {
        return { rows: stmt.all(...(params || [])) } as any;
      }

      const info = stmt.run(...(params || []));

      if (normalizedText.startsWith('delete') && normalizedText.includes('returning')) {
        return {
          rows: info.changes > 0 ? [{ id: params?.[0] }] : [],
          changes: info.changes,
          lastInsertRowid: info.lastInsertRowid
        } as any;
      }

      return { rows: [], changes: info.changes, lastInsertRowid: info.lastInsertRowid } as any;
    },
    raw: db
  };
}

export default client;
