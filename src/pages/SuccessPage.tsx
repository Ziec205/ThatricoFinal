import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function SuccessPage() {
  return (
    <div id="success-page" className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-primary text-white shadow-2xl shadow-primary/20"
      >
        <CheckCircle size={64} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Đặt Hàng Thành Công!</h1>
        <p className="mb-10 max-w-md text-lg text-gray-500">
          Cảm ơn bạn đã tin tưởng Thatrico. Đội ngũ kỹ sư sẽ liên hệ với bạn trong vòng 30 phút để xác nhận đơn hàng.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to="/" className="rounded-full bg-primary px-10 py-4 font-bold text-white transition-all hover:bg-primary-container shadow-lg shadow-primary/20">
            Quay về trang chủ
          </Link>
          <Link to="/products" className="flex items-center justify-center gap-2 rounded-full border px-10 py-4 font-bold text-gray-700 hover:bg-gray-50">
            Tiếp tục mua sắm <ArrowRight size={20} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
