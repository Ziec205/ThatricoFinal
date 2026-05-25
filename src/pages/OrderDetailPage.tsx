import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  ChevronLeft
} from 'lucide-react';
import { Order } from '../types';
import { toast } from 'react-hot-toast';

type BackendOrderProduct = {
  name?: string;
  quantity?: number;
  price?: number;
};

type BackendOrder = {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  products?: string;
  totalPrice?: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: string;
  paymentMethod?: string;
  shippingMethod?: string;
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const parseProducts = (productsJson?: string) => {
    if (!productsJson) return [] as BackendOrderProduct[];

    try {
      const parsed = JSON.parse(productsJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const productToneClasses = [
    'bg-emerald-50 border-emerald-200 text-emerald-800',
    'bg-amber-50 border-amber-200 text-amber-800',
    'bg-sky-50 border-sky-200 text-sky-800',
    'bg-rose-50 border-rose-200 text-rose-800',
    'bg-violet-50 border-violet-200 text-violet-800',
    'bg-orange-50 border-orange-200 text-orange-800'
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) throw new Error('Order not found');
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error(error);
        toast.error('Không tìm thấy thông tin đơn hàng');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-stone-200 border-t-primary mb-4"></div>
          <p className="text-sm font-black uppercase tracking-widest text-stone-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="bg-white rounded-[2rem] shadow-xl p-10 text-center max-w-md w-full">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-black text-text-main mb-2">Lỗi!</h2>
          <p className="text-stone-500 mb-8 font-medium">Chúng tôi không thể tìm thấy đơn hàng này hoặc đường dẫn đã hết hạn.</p>
          <Link 
            to="/" 
            className="inline-block bg-primary text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:scale-105 transition-transform"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-600';
      case 'completed': return 'bg-green-100 text-green-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const orderProducts = parseProducts(order?.products);

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 md:py-20">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-stone-900 px-8 py-10 md:px-12 md:py-16 text-white">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Package className="text-primary" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Chi tiết đơn hàng staff</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">#{order.id}</h1>
                <p className="text-stone-400 font-medium text-sm flex items-center gap-2">
                  <Calendar size={14} /> {new Date(order.createdAt || '').toLocaleString('vi-VN')}
                </p>
              </div>
              <div className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {/* Customer Info */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                <User size={14} className="text-primary" /> Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-stone-50 rounded-3xl p-8 border border-stone-100">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Họ và tên</p>
                    <p className="text-sm font-black text-text-main">{order.customerName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                      <Phone size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Số điện thoại</p>
                      <p className="text-sm font-black text-text-main">{order.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm mt-1">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Địa chỉ giao hàng</p>
                    <p className="text-sm font-black text-text-main leading-relaxed">{order.address}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Products */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-6 flex items-center gap-2">
                <ShoppingBag size={14} className="text-primary" /> Danh sách sản phẩm
              </h3>
              <div className="space-y-3">
                {orderProducts.map((item, idx: number) => {
                  const toneClass = productToneClasses[idx % productToneClasses.length];
                  return (
                    <div key={idx} className={`flex items-center justify-between gap-4 rounded-2xl border p-5 transition-colors ${toneClass}`}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black truncate">{item.name} x{item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black">{((item.price || 0) * (item.quantity || 1)).toLocaleString()}đ</p>
                        <p className="text-[10px] font-bold uppercase opacity-70">Đơn giá: {(item.price || 0).toLocaleString()}đ</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Total */}
            <section className="bg-stone-900 rounded-[2rem] p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2">Tổng giá trị đơn hàng</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-primary">{(order.totalPrice || 0).toLocaleString()}</span>
                  <span className="text-xl font-black text-stone-400">VNĐ</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Thanh toán</p>
                  <p className="text-xs font-black text-white">{order.paymentMethod === 'bank' ? 'Chuyển khoản' : 'Tiền mặt'}</p>
                </div>
                <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Giao hàng</p>
                  <p className="text-xs font-black text-white">{order.shippingMethod === 'express' ? 'Hỏa tốc' : 'Tiêu chuẩn'}</p>
                </div>
              </div>
            </section>

            <div className="pt-8 border-t border-stone-100 text-center">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Thông tin chỉ xem • Vui lòng liên hệ quản lý để chỉnh sửa
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-12 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
          >
            <ChevronLeft size={16} /> Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
