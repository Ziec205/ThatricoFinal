import db, { deserializeProductRow, serializeProductRow } from '../database';
import type { Product } from '../../types';

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  image: string;
  thumbnails: { label: string; value: string }[] | string[];
  description: string;
  specs: { label: string; value: string }[];
  benefits: string[];
  usage: string[];
  isHot?: boolean;
  isNew?: boolean;
  stockStatus: 'in-stock' | 'out-of-stock';
  rating: number;
  reviewsCount: number;
}

export class ProductModel {
  static async getAll() {
    const res = await db.query('SELECT * FROM products');
    return (res.rows as any[]).map((row) => deserializeProductRow(row)) as Product[];
  }

  static async replaceAll(products: ProductRow[]) {
    try {
      if (db.raw && typeof (db.raw as any).transaction === 'function') {
        const raw = db.raw as any;
        const replaceAllInTransaction = raw.transaction((items: ProductRow[]) => {
          raw.prepare('DELETE FROM products').run();

          const insert = raw.prepare(`
            INSERT INTO products (
              id, name, category, categorySlug, price, originalPrice, image, thumbnails, description,
              specs, benefits, usage, isHot, isNew, stockStatus, rating, reviewsCount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const product of items) {
            insert.run(...serializeProductRow(product as Product));
          }
        });

        replaceAllInTransaction(products);
      } else {
        await db.query('DELETE FROM products');
        for (const p of products) {
          await db.query(
            `INSERT INTO products (
              id, name, category, categorySlug, price, originalPrice, image, thumbnails, description,
              specs, benefits, usage, isHot, isNew, stockStatus, rating, reviewsCount
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
            serializeProductRow(p as Product)
          );
        }
      }

      return await ProductModel.getAll();
    } catch (e) {
      throw e;
    }
  }
}

export default ProductModel;
