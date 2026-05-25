import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, ClipboardCopy, Search } from 'lucide-react';
import { motion } from 'motion/react';

type SuccessLocationState = {
  orderCode?: string;
  phone?: string;
};

export default function SuccessPage() {
  const location = useLocation();
  const state = location.state as SuccessLocationState | null;
  const lastOrderCode = state?.orderCode || localStorage.getItem('thatrico_last_order_code') || '';
  const lastOrderPhone = state?.phone || localStorage.getItem('thatrico_last_order_phone') || '';

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
        <p className="mx-auto mb-10 max-w-2xl text-center text-lg text-gray-500">
          Cảm ơn bạn đã tin tưởng Thatrico. Nhân viên CSKH sẽ liên hệ với bạn trong vòng 30 phút để xác nhận đơn hàng.
        </p>
        {lastOrderCode && (
          <div className="mx-auto mb-8 flex max-w-md flex-col items-center rounded-2xl border border-primary/20 bg-primary/5 px-6 py-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Mã đơn hàng của bạn là</p>
            <p className="text-3xl font-black tracking-[0.35em] text-text-main">{lastOrderCode}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Dùng mã này để tra cứu trạng thái đơn hàng
            </p>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(lastOrderCode)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm hover:bg-stone-50"
              title="Copy mã đơn"
            >
              <ClipboardCopy size={16} /> Sao chép mã
            </button>
          </div>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to="/" className="rounded-full bg-primary px-10 py-4 font-bold text-white transition-all hover:bg-primary-container shadow-lg shadow-primary/20">
            Quay về trang chủ
          </Link>
          <Link to="/products" className="flex items-center justify-center gap-2 rounded-full border px-10 py-4 font-bold text-gray-700 hover:bg-gray-50">
            Tiếp tục mua sắm <ArrowRight size={20} />
          </Link>
          <Link
            to="/track-order"
            state={{ phone: lastOrderPhone }}
            className="flex items-center justify-center gap-2 rounded-full border border-primary bg-primary/5 px-10 py-4 font-bold text-primary hover:bg-primary/10"
          >
            <Search size={20} /> Tra cứu đơn hàng
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
