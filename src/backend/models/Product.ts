import db from '../database';

export interface ProductRow {
  id: string;
  name: string;
  category?: string;
  categorySlug?: string;
  price: number;
  image?: string;
  thumbnails?: string;
  description?: string;
  specs?: string;
  benefits?: string;
  usage?: string;
  stockStatus?: string;
  rating?: number;
  reviewsCount?: number;
}

export class ProductModel {
  static async getAll() {
    const res = await db.query('SELECT * FROM products');
    return res.rows as ProductRow[];
  }

  static async replaceAll(products: ProductRow[]) {
    // For sqlite, wrap in transaction if supported
    try {
      if ((db as any).raw && (db as any).raw.exec) {
        const raw = (db as any).raw as any;
        raw.exec('BEGIN TRANSACTION');
        raw.exec('DELETE FROM products');

        const insert = raw.prepare(`INSERT INTO products (id, name, category, categorySlug, price, image, thumbnails, description, specs, benefits, usage, stockStatus, rating, reviewsCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        for (const p of products) {
          insert.run(
            p.id,
            p.name,
            p.category || null,
            p.categorySlug || null,
            Number(p.price || 0),
            p.image || null,
            p.thumbnails || null,
            p.description || null,
            p.specs || null,
            p.benefits || null,
            p.usage || null,
            p.stockStatus || null,
            Number(p.rating || 5),
            Number(p.reviewsCount || 0)
          );
        }

        raw.exec('COMMIT');
      } else {
        // Fallback: delete then insert via queries
        await db.query('DELETE FROM products');
        for (const p of products) {
          await db.query(`INSERT INTO products (id, name, category, categorySlug, price, image, thumbnails, description, specs, benefits, usage, stockStatus, rating, reviewsCount) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [
            p.id,
            p.name,
            p.category || null,
            p.categorySlug || null,
            Number(p.price || 0),
            p.image || null,
            p.thumbnails || null,
            p.description || null,
            p.specs || null,
            p.benefits || null,
            p.usage || null,
            p.stockStatus || null,
            Number(p.rating || 5),
            Number(p.reviewsCount || 0)
          ]);
        }
      }

      return await ProductModel.getAll();
    } catch (e) {
      try { (db as any).raw.exec('ROLLBACK'); } catch {}
      throw e;
    }
  }
}

export default ProductModel;
