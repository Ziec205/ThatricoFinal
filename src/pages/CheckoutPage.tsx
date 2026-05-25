import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAppContext } from '../AppContext';
import { CheckCircle2, ChevronRight, Truck, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { VIETNAM_PROVINCES } from '../constants';

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const { addOrder, user } = useAppContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    city: '',
    note: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: formData.customerName,
          phone: normalizePhone(formData.phone),
          address: `${formData.address}, ${formData.city}`,
          products: cart,
          totalPrice
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to create order');

      if (data.orderCode) {
        localStorage.setItem('thatrico_last_order_code', data.orderCode);
        localStorage.setItem('thatrico_last_order_phone', normalizePhone(formData.phone));
        addOrder({
          id: data.orderCode,
          customerName: formData.customerName,
          phone: normalizePhone(formData.phone),
          address: `${formData.address}, ${formData.city}`,
          items: cart,
          total: totalPrice,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        localStorage.setItem(
          'thatrico_last_order_snapshot',
          JSON.stringify({
            orderCode: data.orderCode,
            phone: normalizePhone(formData.phone),
            customerName: formData.customerName,
            address: `${formData.address}, ${formData.city}`,
            products: cart,
            totalPrice,
            status: 'pending'
          })
        );
      }

      clearCart();
      setIsSubmitting(false);
      navigate('/success', { state: { orderCode: data.orderCode, phone: normalizePhone(formData.phone) } });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      toast.error('Có lỗi xảy ra khi đặt hàng!');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div id="checkout-page" className="bg-gray-50 pb-20">
      <div className="bg-white py-12 border-b">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <nav className="mb-4 flex items-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest">
            <span>Giỏ hàng</span>
            <ChevronRight size={12} />
            <span className="text-gray-900">Thanh toán</span>
          </nav>
          <h1 className="text-3xl font-bold">Thanh Toán & Giao Hàng</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-12 grid max-w-7xl gap-12 px-4 md:grid-cols-[1fr_400px] md:px-6">
        <div className="space-y-10">
          {/* Shipping Info */}
          <section>
            <div className="mb-6 flex items-center gap-2">
              <Truck size={24} className="text-primary" />
              <h2 className="text-xl font-bold">Thông tin giao hàng</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Họ và tên *</label>
                <input required name="customerName" value={formData.customerName} onChange={handleChange} type="text" placeholder="Nguyễn Văn A" className="w-full rounded-xl border-gray-200 bg-white px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Số điện thoại *</label>
                <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="0901234567" className="w-full rounded-xl border-gray-200 bg-white px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-sm font-bold text-gray-700">Địa chỉ cụ thể *</label>
                <input required name="address" value={formData.address} onChange={handleChange} type="text" placeholder="Số nhà, tên đường, phường/xã..." className="w-full rounded-xl border-gray-200 bg-white px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tỉnh / Thành phố *</label>
                <select required name="city" value={formData.city} onChange={handleChange} className="w-full rounded-xl border-gray-200 bg-white px-4 py-3 focus:border-primary">
                  <option value="">Chọn tỉnh thành</option>
                  {VIETNAM_PROVINCES.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Ghi chú đơn hàng</label>
                <input name="note" value={formData.note} onChange={handleChange} type="text" placeholder="Lời nhắn cho shipper..." className="w-full rounded-xl border-gray-200 bg-white px-4 py-3 focus:border-primary" />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <div className="mb-6 flex items-center gap-2">
              <CreditCard size={24} className="text-primary" />
              <h2 className="text-xl font-bold">Phương thức thanh toán</h2>
            </div>
            <div className="space-y-4">
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-primary bg-primary/5 p-6">
                <input defaultChecked type="radio" name="payment" className="h-5 w-5 accent-primary" />
                <div className="flex-1">
                  <span className="block font-bold">Thanh toán khi nhận hàng (COD)</span>
                  <span className="text-sm text-gray-500">Nhận hàng rồi mới trả tiền.</span>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border bg-white p-6 opacity-60">
                <input disabled type="radio" name="payment" className="h-5 w-5 accent-primary" />
                <div className="flex-1">
                  <span className="block font-bold">Chuyển khoản ngân hàng (Đang bảo trì)</span>
                  <span className="text-sm text-gray-500">Chuyển khoản qua QR Code.</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <aside className="sticky top-28 h-fit">
          <div className="rounded-2xl bg-white p-8 shadow-md">
            <h3 className="mb-6 text-lg font-bold">Đơn hàng của bạn</h3>
            <div className="mb-6 max-h-64 space-y-4 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img src={item.image} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="truncate text-sm font-bold">{item.name}</h4>
                    <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
                    <p className="text-sm font-bold text-primary">{(item.price * item.quantity).toLocaleString()}đ</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 border-t pt-6">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Giảm giá</span>
                <span>0đ</span>
              </div>
              <div className="flex justify-between border-t pt-4 text-xl font-bold text-gray-900">
                <span>Tổng cộng</span>
                <span className="text-secondary">{totalPrice.toLocaleString()}đ</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 font-bold text-white transition-all hover:bg-primary-container disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Đang xử lý...</>
              ) : (
                <>Đặt Hàng Ngay</>
              )}
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
              <ShieldCheck size={14} /> BẢO MẬT THANH TOÁN 100%
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
