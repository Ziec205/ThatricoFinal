import db from '../database';

export interface Order {
  id?: number;
  customerName: string;
  phone: string;
  address: string;
  products: string; // JSON string of products
  totalPrice: number;
  status?: string;
  createdAt?: string;
}

export class OrderModel {
  static async create(order: Order) {
    const res = await db.query(
      `INSERT INTO orders (customerName, phone, address, products, totalPrice)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [order.customerName, order.phone, order.address, order.products, order.totalPrice]
    );

    const firstRow = Array.isArray(res.rows) ? res.rows[0] : undefined;
    if (firstRow && firstRow.id !== undefined && firstRow.id !== null) {
      return firstRow.id;
    }

    const lastInsertRowid = (res as any).lastInsertRowid;
    if (lastInsertRowid !== undefined && lastInsertRowid !== null) {
      return lastInsertRowid;
    }

    throw new Error('Failed to create order');
  }

  static async getPendingOrders() {
    const res = await db.query(`SELECT * FROM orders WHERE status = 'pending'`);
    return res.rows as Order[];
  }

  static async updateStatus(id: number, status: string) {
    await db.query(`UPDATE orders SET status = $1 WHERE id = $2`, [status, id]);
  }

  static async getById(id: number) {
    const res = await db.query(`SELECT * FROM orders WHERE id = $1`, [id]);
    return res.rows[0] as Order | undefined;
  }

  static async updateOrder(id: number, order: Partial<Order>) {
    const fields = Object.keys(order).filter(key => key !== 'id' && (order as any)[key] !== undefined);
    if (fields.length === 0) return;

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const values = fields.map(f => (order as any)[f]);
    values.push(id);

    await db.query(`UPDATE orders SET ${setClause} WHERE id = $${values.length}`, values);
  }

  static async getAllOrders() {
    const res = await db.query(`SELECT * FROM orders ORDER BY id ASC`);
    return res.rows as Order[];
  }

  static async deleteOrder(id: number) {
    if (process.env.DATABASE_URL) {
      const res = await db.query(`DELETE FROM orders WHERE id = $1 RETURNING id`, [id]);
      const affectedRows = (res as any).rowCount ?? (res as any).changes ?? res.rows?.length ?? 0;

      if (!affectedRows) {
        throw new Error(`Order with id ${id} not found`);
      }
    } else {
      // Local SQLite should behave like an idempotent delete so the UI does not
      // show a false error when the row is already gone or the driver does not
      // expose RETURNING metadata the same way as PostgreSQL.
      await db.query(`DELETE FROM orders WHERE id = $1`, [id]);
    }

    const countRes = await db.query(`SELECT COUNT(*) AS count FROM orders`);
    const remainingOrders = Number((countRes.rows[0] as any)?.count || 0);

    if (remainingOrders === 0) {
      try {
        await db.query(`ALTER SEQUENCE orders_id_seq RESTART WITH 1`);
      } catch {
        try {
          await db.query(`DELETE FROM sqlite_sequence WHERE name = 'orders'`);
        } catch {
          // No-op: some databases do not expose a resettable sequence table.
        }
      }
    }

    return res;
  }
}
