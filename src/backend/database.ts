import Database from 'better-sqlite3';
import path from 'path';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data';
import type { Product as AppProduct } from '../types';

type QueryResult = { rows: any[]; lastInsertRowid?: number; changes?: number; rowCount?: number };

type ProductDbRow = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number | string | null;
  image?: string | null;
  thumbnails?: string | null;
  description?: string | null;
  specs?: string | null;
  benefits?: string | null;
  usage?: string | null;
  isHot?: number | null;
  isNew?: number | null;
  stockStatus?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
};

let client: {
  query: (text: string, params?: any[]) => Promise<QueryResult> | QueryResult;
  raw?: Database.Database;
};

const parseList = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean) as T[];
  }
};

export const deserializeProductRow = (row: ProductDbRow): AppProduct => ({
  id: String(row.id),
  name: String(row.name || ''),
  category: String(row.category || ''),
  categorySlug: String(row.categorySlug || ''),
  price: Number(row.price || 0),
  originalPrice: row.originalPrice === null || row.originalPrice === undefined || row.originalPrice === ''
    ? undefined
    : Number(row.originalPrice),
  image: row.image ? String(row.image) : '',
  thumbnails: parseList<string>(row.thumbnails),
  description: row.description ? String(row.description) : '',
  specs: parseList<{ label: string; value: string }>(row.specs),
  benefits: parseList<string>(row.benefits),
  usage: parseList<string>(row.usage),
  isHot: Boolean(Number(row.isHot || 0)),
  isNew: Boolean(Number(row.isNew || 0)),
  stockStatus: row.stockStatus === 'out-of-stock' ? 'out-of-stock' : 'in-stock',
  rating: Number(row.rating || 5),
  reviewsCount: Number(row.reviewsCount || 0)
});

export const serializeProductRow = (product: AppProduct) => [
  product.id,
  product.name,
  product.category,
  product.categorySlug,
  Number(product.price || 0),
  product.originalPrice ?? null,
  product.image || null,
  JSON.stringify(product.thumbnails || []),
  product.description || null,
  JSON.stringify(product.specs || []),
  JSON.stringify(product.benefits || []),
  JSON.stringify(product.usage || []),
  product.isHot ? 1 : 0,
  product.isNew ? 1 : 0,
  product.stockStatus || 'in-stock',
  Number(product.rating || 5),
  Number(product.reviewsCount || 0)
];

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new Database(dbPath);

const ensureColumn = (tableName: string, columnName: string, alterSql: string) => {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === columnName)) {
    db.exec(alterSql);
  }
};

const orderSchemaReady = (async () => {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

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
      category TEXT NOT NULL,
      categorySlug TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      originalPrice REAL,
      image TEXT,
      thumbnails TEXT,
      description TEXT,
      specs TEXT,
      benefits TEXT,
      usage TEXT,
      isHot INTEGER NOT NULL DEFAULT 0,
      isNew INTEGER NOT NULL DEFAULT 0,
      stockStatus TEXT,
      rating REAL DEFAULT 5,
      reviewsCount INTEGER DEFAULT 0
    );
  `);

  ensureColumn('orders', 'orderCode', `ALTER TABLE orders ADD COLUMN orderCode TEXT`);
  ensureColumn('products', 'originalPrice', `ALTER TABLE products ADD COLUMN originalPrice REAL`);
  ensureColumn('products', 'isHot', `ALTER TABLE products ADD COLUMN isHot INTEGER NOT NULL DEFAULT 0`);
  ensureColumn('products', 'isNew', `ALTER TABLE products ADD COLUMN isNew INTEGER NOT NULL DEFAULT 0`);

  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS orders_order_code_unique ON orders(orderCode)`);

  const productCount = db.prepare(`SELECT COUNT(*) AS count FROM products`).get() as { count?: number };
  if (Number(productCount?.count || 0) === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        id, name, category, categorySlug, price, originalPrice, image, thumbnails, description,
        specs, benefits, usage, isHot, isNew, stockStatus, rating, reviewsCount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedProducts = db.transaction((products: AppProduct[]) => {
      for (const product of products) {
        insertProduct.run(...serializeProductRow(product));
      }
    });

    seedProducts(INITIAL_PRODUCTS as AppProduct[]);
  }

  client = {
    query: (text: string, params?: any[]) => {
      const stmt = db.prepare(text.replace(/\$\d+/g, '?'));
      const normalizedText = text.trim().toLowerCase();

      if (normalizedText.startsWith('select') || normalizedText.includes('returning')) {
        return { rows: stmt.all(...(params || [])) } as any;
      }

      const info = stmt.run(...(params || []));
      return { rows: [], changes: info.changes, lastInsertRowid: info.lastInsertRowid } as any;
    },
    raw: db
  };
})();

export const ensureDatabaseReady = async () => {
  await orderSchemaReady;
};

export default client;
