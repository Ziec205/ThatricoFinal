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

const orderSchemaReady = (async () => {
  const orderTableName = 'orders';
  const orderCodeColumn = 'orderCode';

  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await pool.query(`ALTER TABLE ${orderTableName} ADD COLUMN IF NOT EXISTS ${orderCodeColumn} TEXT`);
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS orders_order_code_unique ON ${orderTableName} (${orderCodeColumn})`);

    client = {
      query: (text: string, params?: any[]) => pool.query(text, params) as any,
      pool
    };

    return;
  }

  const dbPath = path.resolve(process.cwd(), 'database.sqlite');
  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderCode TEXT,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      products TEXT NOT NULL,
      totalPrice REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      categorySlug TEXT,
      price REAL NOT NULL DEFAULT 0,
      image TEXT,
      thumbnails TEXT,
      description TEXT,
      specs TEXT,
      benefits TEXT,
      usage TEXT,
      stockStatus TEXT,
      rating REAL DEFAULT 5,
      reviewsCount INTEGER DEFAULT 0
    );
  `);

  const columns = db.prepare(`PRAGMA table_info(orders)`).all() as Array<{ name: string }>;
  const hasOrderCode = columns.some((column) => column.name === orderCodeColumn);

  if (!hasOrderCode) {
    db.exec(`ALTER TABLE orders ADD COLUMN orderCode TEXT`);
  }

  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS orders_order_code_unique ON orders(orderCode)`);

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
})();

export const ensureOrderSchemaReady = async () => {
  await orderSchemaReady;
};

export default client;
