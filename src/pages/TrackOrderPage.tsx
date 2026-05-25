import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Package, User, MapPin, Phone, Calendar, ShoppingBag, AlertCircle } from 'lucide-react';
import type { Order as AppOrder } from '../types';

type BackendOrderProduct = {
  name?: string;
  quantity?: number;
  price?: number;
};

type BackendOrder = {
  id: number;
  orderCode?: string;
  customerName: string;
  phone: string;
  address: string;
  products?: string;
  totalPrice?: number;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt?: string;
};

type TrackState = {
  phone?: string;
};

type CachedOrderSnapshot = BackendOrder & {
  products?: BackendOrderProduct[];
};

type LocalOrderSnapshot = AppOrder & {
  orderCode?: string;
};

const productToneClasses = [
  'bg-emerald-50 border-emerald-200 text-emerald-800',
  'bg-amber-50 border-amber-200 text-amber-800',
  'bg-sky-50 border-sky-200 text-sky-800',
  'bg-rose-50 border-rose-200 text-rose-800',
  'bg-violet-50 border-violet-200 text-violet-800',
  'bg-orange-50 border-orange-200 text-orange-800'
];

export default function TrackOrderPage() {
  const location = useLocation();
  const savedState = (location.state || {}) as TrackState;
  const [phone, setPhone] = useState(savedState.phone || localStorage.getItem('thatrico_last_order_phone') || '');
  const [order, setOrder] = useState<BackendOrder | null>(null);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const products = useMemo<BackendOrderProduct[]>(() => {
    if (!order?.products) return [];

    try {
      const parsed = JSON.parse(order.products);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [order]);

  const getStatusColor = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-stone-100 text-stone-600';
    }
  };

  const submitLookup = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSearching(true);
    setError('');
    setOrder(null);

    const normalizedPhone = phone.replace(/\D/g, '');

    if (!normalizedPhone) {
      setError('Vui lòng nhập số điện thoại đặt hàng.');
      setIsSearching(false);
      return;
    }

    const lookupOrder = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const payload = await response.json();

          if (Array.isArray(payload)) {
            const matchedOrder = [...payload]
              .reverse()
              .find((item: BackendOrder) => String(item.phone || '').replace(/\D/g, '') === normalizedPhone);

            if (matchedOrder) {
              return matchedOrder;
            }
          }
        }
      } catch {
        // Fall through to local cache lookup.
      }

      const localOrder = getLocalOrder(normalizedPhone);
      if (localOrder) {
        return localOrder;
      }

      const cachedOrder = getCachedOrder(normalizedPhone);
      if (cachedOrder) {
        return cachedOrder;
      }

      throw new Error('Không tìm thấy đơn hàng với số điện thoại này.');
    };

    const getLocalOrder = (searchPhone: string): BackendOrder | null => {
      try {
        const rawOrders = localStorage.getItem('thatrico_orders_v2');
        if (!rawOrders) return null;

        const orders = JSON.parse(rawOrders) as LocalOrderSnapshot[];
        const matchedOrder = orders.find((order) => String(order.phone || '').replace(/\D/g, '') === searchPhone);

        if (!matchedOrder) return null;

        return {
          id: Number(matchedOrder.id) || 0,
          orderCode: matchedOrder.orderCode,
          customerName: matchedOrder.customerName,
          phone: String(matchedOrder.phone || '').replace(/\D/g, ''),
          address: matchedOrder.address,
          products: JSON.stringify(matchedOrder.items || []),
          totalPrice: matchedOrder.total,
          status: matchedOrder.status,
          createdAt: matchedOrder.createdAt
        };
      } catch {
        return null;
      }
    };

    const getCachedOrder = (searchPhone: string): BackendOrder | null => {
      try {
        const rawSnapshot = localStorage.getItem('thatrico_last_order_snapshot');
        if (!rawSnapshot) return null;

        const snapshot = JSON.parse(rawSnapshot) as CachedOrderSnapshot;
        const cachedPhone = String(snapshot.phone || '').replace(/\D/g, '');

        if (!cachedPhone || cachedPhone !== searchPhone) {
          return null;
        }

        return {
          ...snapshot,
          phone: cachedPhone,
          products: JSON.stringify(snapshot.products || [])
        };
      } catch {
        return null;
      }
    };

    try {
      const orderData = await lookupOrder();
      setOrder(orderData);
    } catch (err: any) {
      setError(err.message || 'Không kết nối được với hệ thống tra cứu. Vui lòng thử lại sau.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 md:py-20">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2.5rem] bg-white shadow-2xl shadow-stone-200/50 overflow-hidden"
        >
          <div className="bg-stone-900 px-8 py-10 text-white md:px-12 md:py-14">
            <div className="flex items-center gap-3 mb-4">
              <Package className="text-primary" size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Tra cứu đơn hàng</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Kiểm tra đơn hàng</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium text-stone-300">
              Nhập số điện thoại đặt hàng để xem lại thông tin đơn hàng. Đây là trang chỉ xem, không thể chỉnh sửa.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-10">
            <form onSubmit={submitLookup} className="grid gap-4 md:grid-cols-[1fr_auto]">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại"
                className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black uppercase tracking-widest text-white disabled:opacity-60"
              >
                <Search size={16} /> {isSearching ? 'Đang tìm...' : 'Tra cứu'}
              </button>
            </form>

            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-red-700">
                <AlertCircle size={18} />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            {order && (
              <div className="space-y-8">
                <section className="grid gap-4 rounded-3xl bg-stone-50 p-6 md:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Mã đơn hàng</p>
                    <p className="text-2xl font-black tracking-[0.3em] text-text-main">{order.orderCode || '-----'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Trạng thái</p>
                    <span className={`inline-flex rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status || 'pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Khách hàng</p>
                    <p className="text-sm font-black text-text-main">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Số điện thoại</p>
                    <p className="text-sm font-black text-text-main">{order.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Địa chỉ</p>
                    <p className="text-sm font-black text-text-main leading-relaxed">{order.address}</p>
                  </div>
                </section>

                <section>
                  <h3 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-stone-400">Sản phẩm đã mua</h3>
                  <div className="space-y-3">
                    {products.map((item, index) => {
                      const toneClass = productToneClasses[index % productToneClasses.length];
                      return (
                        <div key={`${item.name || 'product'}-${index}`} className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
                          <div className="flex items-center justify-between gap-4">
                            <p className="min-w-0 flex-1 truncate text-sm font-black uppercase tracking-widest">
                              {item.name} x{item.quantity}
                            </p>
                            <p className="shrink-0 text-sm font-black">{((item.price || 0) * (item.quantity || 1)).toLocaleString()}đ</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-[2rem] bg-stone-900 p-8 text-white">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Tổng tiền</p>
                  <p className="text-4xl font-black text-primary">{(order.totalPrice || 0).toLocaleString()}đ</p>
                  <p className="mt-4 text-xs font-bold text-stone-400">Trang này chỉ dùng để xem lại thông tin đơn hàng, không có chức năng chỉnh sửa.</p>
                </section>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}