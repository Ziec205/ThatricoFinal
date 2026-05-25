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
    return res.rows[0].id;
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
    const res = await db.query(`DELETE FROM orders WHERE id = $1 RETURNING id`, [id]);
    if (!res.rows[0]) {
      throw new Error(`Order with id ${id} not found`);
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
