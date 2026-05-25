import { Router } from 'express';
import { OrderController } from './controllers/OrderController';
import { FileUploadController } from './controllers/FileUploadController';
import { uploadMiddleware } from './middleware/uploadMiddleware';

const router = Router();

router.post('/orders', OrderController.createOrder);
router.get('/orders', OrderController.getAllOrders);
router.get('/orders/pending', OrderController.getPendingOrders);
router.get('/orders/:id', OrderController.getOrder);
router.get('/orders/phone/:phone', OrderController.lookupOrderByPhone);
router.post('/orders/export-invoice', OrderController.exportAndSendInvoice);
router.post('/orders/sync-sheets', OrderController.syncToSheets);
router.put('/orders/:id', OrderController.updateOrder);
router.delete('/orders/:id', OrderController.deleteOrder);

// File upload
router.post('/upload', uploadMiddleware.single('image'), FileUploadController.uploadImage);

export default router;
