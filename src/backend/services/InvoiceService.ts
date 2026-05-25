import QRCode from 'qrcode';
import nodemailer from 'nodemailer';
import { Order } from '../models/Order';

export class InvoiceService {
  static async generateQRCode(order: Order): Promise<string> {
    const invoiceData = `
MÃ ĐƠN HÀNG: ${order.id}
Tên Khách: ${order.customerName}
SĐT: ${order.phone}
Địa chỉ: ${order.address}
Sản phẩm: ${order.products}
Tổng tiền: ${order.totalPrice} VNĐ
Tình trạng: Đã xuất hóa đơn
    `.trim();

    return QRCode.toDataURL(invoiceData);
  }

  static async sendInvoiceEmail(toEmail: string, order: Order, qrCodeDataUrl: string) {
    // For demo purposes, we will use Ethereal Email (a fake SMTP service)
    // When deploying, you need to replace this with a real SMTP configuration (e.g. Gmail)
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    let info = await transporter.sendMail({
      from: '"Hệ thống Nông nghiệp" <noreply@nongnghiep.local>',
      to: toEmail,
      subject: `Hóa đơn đơn hàng #${order.id}`,
      html: `
        <h2>Xin chào ${order.customerName},</h2>
        <p>Đây là hóa đơn cho đơn hàng số <b>#${order.id}</b> của bạn.</p>
        <p>Bạn có thể quét mã QR bên dưới để xem thông tin đơn hàng:</p>
        <img src="${qrCodeDataUrl}" alt="QR Code Hóa đơn" />
      `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
  }
}
