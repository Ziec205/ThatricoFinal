import { Request, Response } from 'express';
import ProductModel from '../models/Product';

export class ProductController {
  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await ProductModel.getAll();
      res.json(products);
    } catch (e) {
      console.error('Get products failed', e);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  static async syncProducts(req: Request, res: Response) {
    try {
      const products = Array.isArray(req.body) ? req.body : [];
      const saved = await ProductModel.replaceAll(products);
      res.json(saved);
    } catch (e) {
      console.error('Sync products failed', e);
      res.status(500).json({ error: 'Failed to sync products' });
    }
  }
}

export default ProductController;
