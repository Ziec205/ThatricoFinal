import db from '../database';

export interface Order {
  id?: number;
  orderCode?: string;
  customerName: string;
  phone: string;
  address: string;
  products: string; // JSON string of products
  totalPrice: number;
  status?: string;
  createdAt?: string;
}

export class OrderModel {
  static normalizePhone(phone: string) {
    return String(phone || '')
      .trim()
      .replace(/\D/g, '');
  }

  static generateOrderCode() {
    return String(Math.floor(10000 + Math.random() * 90000));
  }

  static async getByCode(orderCode: string) {
    const res = await db.query(`SELECT * FROM orders WHERE orderCode = $1`, [orderCode]);
    return res.rows[0] as Order | undefined;
  }

  static async createUniqueOrderCode() {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const orderCode = OrderModel.generateOrderCode();
      const existing = await OrderModel.getByCode(orderCode);
      if (!existing) {
        return orderCode;
      }
    }

    throw new Error('Failed to generate unique order code');
  }

  static async create(order: Order) {
    const orderCode = await OrderModel.createUniqueOrderCode();
    const normalizedPhone = OrderModel.normalizePhone(order.phone);
    const res = await db.query(
      `INSERT INTO orders (orderCode, customerName, phone, address, products, totalPrice)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, orderCode`,
      [orderCode, order.customerName, normalizedPhone, order.address, order.products, order.totalPrice]
    );

    const firstRow = Array.isArray(res.rows) ? res.rows[0] : undefined;
    if (firstRow && firstRow.id !== undefined && firstRow.id !== null) {
      return { id: firstRow.id, orderCode: firstRow.ordercode || firstRow.orderCode || orderCode };
    }

    const lastInsertRowid = (res as any).lastInsertRowid;
    if (lastInsertRowid !== undefined && lastInsertRowid !== null) {
      return { id: lastInsertRowid, orderCode };
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

  static async getByCodeAndPhone(orderCode: string, phone: string) {
    const normalizedPhone = OrderModel.normalizePhone(phone);
    const res = await db.query(
      `SELECT * FROM orders WHERE orderCode = $1 AND phone = $2`,
      [orderCode, normalizedPhone]
    );
    return res.rows[0] as Order | undefined;
  }

  static async getLatestByPhone(phone: string) {
    const normalizedPhone = OrderModel.normalizePhone(phone);

    let res = await db.query(
      `SELECT * FROM orders WHERE phone = $1 ORDER BY id DESC LIMIT 1`,
      [normalizedPhone]
    );

    if (res.rows[0]) {
      return res.rows[0] as Order | undefined;
    }

    // Fallback for older records that may have been stored with formatting
    // characters such as spaces, dots, or a +84 prefix.
    const allOrders = await db.query(`SELECT * FROM orders ORDER BY id DESC`);
    const matchedOrder = (allOrders.rows as Order[]).find((order) => {
      const storedPhone = OrderModel.normalizePhone(order.phone);
      return storedPhone === normalizedPhone || storedPhone.endsWith(normalizedPhone) || normalizedPhone.endsWith(storedPhone);
    });

    if (matchedOrder) {
      return matchedOrder;
    }

    return res.rows[0] as Order | undefined;
  }

  static async deleteOrder(id: number) {
    const deleteResult = await db.query(`DELETE FROM orders WHERE id = $1 RETURNING id`, [id]);
    const affectedRows = (deleteResult as any).rowCount ?? (deleteResult as any).changes ?? deleteResult.rows?.length ?? 0;

    if (!affectedRows) {
      throw new Error(`Order with id ${id} not found`);
    }

    const countRes = await db.query(`SELECT COUNT(*) AS count FROM orders`);
    const remainingOrders = Number((countRes.rows[0] as any)?.count || 0);

    if (remainingOrders === 0) {
      try {
        await db.query(`DELETE FROM sqlite_sequence WHERE name = 'orders'`);
      } catch {
        // No-op when the SQLite sequence table is not available yet.
      }
    }

    return deleteResult;
  }
}
