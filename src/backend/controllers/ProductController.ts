import { Request, Response } from 'express';
import ProductModel from '../models/Product';
import fs from 'fs';
import path from 'path';

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

      // Determine images to delete: compare existing DB images vs incoming images
      try {
        const existing = await ProductModel.getAll();
        const existingImages = new Set<string>(existing.map((p: any) => p.image).filter(Boolean));
        const incomingImages = new Set<string>(products.map((p: any) => p.image).filter(Boolean));

        for (const img of existingImages) {
          if (!incomingImages.has(img) && typeof img === 'string' && img.startsWith('/images/')) {
            try {
              const filePath = path.join(process.cwd(), 'public', img.replace(/^\//, ''));
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch (delErr) {
              console.error('Failed to delete image', img, delErr);
            }
          }
        }
      } catch (e) {
        console.error('Error while cleaning up images during sync', e);
      }

      const saved = await ProductModel.replaceAll(products);
      res.json(saved);
    } catch (e) {
      console.error('Sync products failed', e);
      res.status(500).json({ error: 'Failed to sync products' });
    }
  }
}

export default ProductController;
