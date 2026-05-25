import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

export class FileUploadController {
  static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Không có file được upload' });
      }

      const file = req.file;
      
      // Validate file type
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimes.includes(file.mimetype)) {
        // Delete uploaded file if invalid
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP, GIF)' });
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ error: 'File quá lớn (tối đa 5MB)' });
      }

      // Return the relative path for storing in database
      const imagePath = `/images/${file.filename}`;
      
      res.json({ 
        success: true, 
        path: imagePath,
        filename: file.filename,
        size: file.size
      });
    } catch (error) {
      console.error('Upload error:', error);
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Failed to delete uploaded file:', unlinkError);
        }
      }
      res.status(500).json({ error: 'Lỗi khi upload file' });
    }
  }
}
