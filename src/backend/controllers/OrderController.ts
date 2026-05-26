import { Request, Response } from 'express';
import { OrderModel } from '../models/Order';
import { InvoiceService } from '../services/InvoiceService';
import { GoogleSheetsService } from '../services/GoogleSheetsService';

export class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const { customerName, phone, address, products, totalPrice } = req.body;
      const normalizedPhone = OrderModel.normalizePhone(phone);

        const order = await OrderModel.create({
        customerName, phone: normalizedPhone, address, 
        products: JSON.stringify(products), 
        totalPrice
      });

      res.json({ success: true, orderId: order.id, orderCode: order.orderCode });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  static async syncToSheets(req: Request, res: Response) {
    try {
      const { orderId, spreadsheetId } = req.body;
      const authHeader = req.headers.authorization;
      const accessToken = authHeader ? authHeader.split(' ')[1] : null;

      if (!accessToken) {
        return res.status(401).json({ error: 'Missing access token' });
      }

      if (!spreadsheetId) {
        return res.status(400).json({ error: 'Missing Spreadsheet ID' });
      }

        const order = await OrderModel.getById(orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      await GoogleSheetsService.appendOrder(accessToken, spreadsheetId, {
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        products: JSON.parse(order.products),
        totalPrice: order.totalPrice
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || 'Failed to sync to Sheets' });
    }
  }

  static async getAllOrders(req: Request, res: Response) {
    try {
      const orders = await OrderModel.getAllOrders();

      // Ensure every order has an orderCode. Backfill if missing so admin shows 5-digit codes.
      for (const o of orders) {
        if (!o.orderCode || String(o.orderCode).trim() === '') {
          try {
            const newCode = await OrderModel.createUniqueOrderCode();
            await OrderModel.updateOrder(Number(o.id), { orderCode: newCode });
            o.orderCode = newCode;
          } catch (e) {
            console.error('Failed to backfill orderCode for order', o.id, e);
          }
        }
      }

      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  static async getPendingOrders(req: Request, res: Response) {
    try {
      const orders = await OrderModel.getPendingOrders();

      for (const o of orders) {
        if (!o.orderCode || String(o.orderCode).trim() === '') {
          try {
            const newCode = await OrderModel.createUniqueOrderCode();
            await OrderModel.updateOrder(Number(o.id), { orderCode: newCode });
            o.orderCode = newCode;
          } catch (e) {
            console.error('Failed to backfill orderCode for order', o.id, e);
          }
        }
      }

      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pending orders' });
    }
  }

  static async exportAndSendInvoice(req: Request, res: Response) {
    try {
      const { orderId, email } = req.body;
        const order = await OrderModel.getById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      if (order.status !== 'pending') {
        return res.status(400).json({ error: 'Order is not pending' });
      }

      // Generate QR
      const qrDataUrl = await InvoiceService.generateQRCode(order);

      // Send Email
      const previewUrl = await InvoiceService.sendInvoiceEmail(email || 'customer@example.com', order, qrDataUrl);

      // Update order status to fulfilled/completed
      OrderModel.updateStatus(orderId, 'completed');

      res.json({ success: true, previewUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to export invoice' });
    }
  }

  static async updateOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { customerName, phone, address, status, totalPrice, products } = req.body;

        await OrderModel.updateOrder(Number(id), {
        customerName,
        phone,
        address,
        status,
        totalPrice,
        products: products ? JSON.stringify(products) : undefined
      });

      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  }

  static async deleteOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const orderId = Number(id);

      await OrderModel.deleteOrder(orderId);
      res.json({ success: true, message: `Đã xóa đơn hàng #${orderId}` });
    } catch (error: any) {
      console.error('Delete order error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Lỗi khi xóa đơn hàng' 
      });
    }
  }

  static async getOrder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      let order;

      // If id is a 5-digit code (orderCode), lookup by code. Otherwise treat as numeric id.
      if (typeof id === 'string' && /^\d{5}$/.test(id.trim())) {
        order = await OrderModel.getByCode(id.trim());
      } else {
        const numeric = Number(id);
        if (!Number.isNaN(numeric)) {
          order = await OrderModel.getById(numeric);
        }
      }

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

  static async lookupOrderByPhone(req: Request, res: Response) {
    try {
      const phone = OrderModel.normalizePhone(String(req.params.phone || ''));

      if (!phone) {
        return res.status(400).json({ error: 'Missing phone number' });
      }

      const order = await OrderModel.getLatestByPhone(phone);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to lookup order' });
    }
  }
}
