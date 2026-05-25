# Hệ thống quản lý bán hàng nông nghiệp (MVC2 + Express + React Vite)

Đây là dự án full-stack sử dụng mô hình MVC2 ở phía backend với Node.js, Express và SQLite. Giao diện được xây dựng bằng React.js, Vite và Tailwind CSS. 

## Tính năng

1. **Giao diện Khách hàng**: Chọn sản phẩm, thêm vào giỏ hàng và đặt hàng. Dữ liệu sẽ được gửi thẳng vào Database (SQLite).
2. **Giao diện Admin**: 
   - Quản lý danh sách sản phẩm.
   - Quản lý đơn hàng đang chờ xử lý từ Database.
   - **Xuất hóa đơn (Invoice)**: Bấm nút xuất hóa đơn, hệ thống sẽ lấy dữ liệu đơn hàng (tên, SĐT, danh sách sản phẩm...) tạo thành mã QR Code và gửi Email cho khách.

## Cài đặt và chạy trên Visual Studio Code

1. **Giải nén dự án** và mở thư mục bằng Visual Studio Code (VS Code).
2. Mở Terminal trong VS Code (phím tắt `Ctrl + ~`).
3. Chạy lệnh cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
4. Khởi động dự án ở chế độ phát triển (Dev mode):
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và truy cập vào **http://localhost:3000**

## Lưu ý về chức năng gửi Email và QR Code
- Hệ thống backend đã được thiết lập giả lập gửi Email thông qua Ethereal Email (sử dụng thư viện `nodemailer` và `qrcode`).
- Khi bạn xuất hóa đơn cho khách trong phần quản trị, Terminal (cửa sổ dòng lệnh trong VS Code) sẽ in ra một đường link **Preview URL** để bạn có thể xem lại email mẫu chứa mã QR.
- Để cấu hình gửi email thật (như Gmail), bạn cần thay thế thông tin SMTP trong tệp `/src/backend/services/InvoiceService.ts`.

## Cập nhật Hình ảnh & Logo

1. **Logo**: Đã được chuyển sang dạng Icon-based chuyên nghiệp để đảm bảo hiển thị tốt trên mọi thiết bị.
2. **Sản phẩm**: Đã được cập nhật các hình ảnh chất lượng cao (Unsplash) phù hợp với mô tả sản phẩm (Đạm Thatrico, Denta-Max).
3. **Lưu ý về Google Drive**: Do chính sách bảo mật của Google, hệ thống không thể tự động lấy file trực tiếp từ thư mục Drive cá nhân mà không có API Key. Bạn có thể thay thế các URL hình ảnh trong tệp `/src/data.ts` bằng các đường link trực tiếp (direct link) từ Google Drive của bạn.

## Sửa lỗi Hệ thống

- **Lỗi Fetch**: Đã thêm script bảo vệ `window.fetch` trong `index.html` để ngăn chặn các thư viện bên thứ 3 ghi đè lên hàm fetch hệ thống, giúp khắc phục lỗi "Cannot set property fetch which has only a getter".
- **Database**: Đã sửa đường dẫn kết nối database trong các mô hình (Models) để đảm bảo hệ thống tìm thấy tệp `.sqlite` chính xác.
