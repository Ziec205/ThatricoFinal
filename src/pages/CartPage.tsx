import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <ShoppingCart size={40} />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Giỏ hàng trống</h2>
        <p className="mb-8 text-gray-500">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Link to="/products" className="rounded-full bg-primary px-8 py-3 font-bold text-white hover:bg-primary-container">
          Tiếp tục mua hàng
        </Link>
      </div>
    );
  }

  return (
    <div id="cart-page" className="bg-surface pb-20">
      <div className="bg-white py-14 border-b border-outline">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2 block">Giỏ hàng của bạn</span>
          <h1 className="text-4xl font-black uppercase tracking-tight text-text-main">XÁC NHẬN ĐƠN HÀNG</h1>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60">Bạn đang có {totalItems} sản phẩm được chọn</p>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-7xl gap-12 px-4 md:grid-cols-[1fr_380px] md:px-8">
        {/* List */}
        <div className="space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex flex-col gap-8 rounded-[2rem] bg-white p-8 border border-outline shadow-sm md:flex-row items-center">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-stone-50 border border-outline md:h-32 md:w-32 shadow-sm">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col h-full justify-between w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-50 mb-1">{item.category}</p>
                    <h3 className="text-lg font-black uppercase tracking-tight text-text-main leading-tight">{item.name}</h3>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center rounded-xl border border-outline p-1 bg-stone-50">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white transition-all text-text-main hover:shadow-sm"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center text-sm font-black text-text-main">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white transition-all text-text-main hover:shadow-sm"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 opacity-40">{(item.price).toLocaleString()}đ / SP</p>
                    <p className="text-xl font-black text-emerald-700 tracking-tight">{(item.price * item.quantity).toLocaleString()}đ</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="sticky top-28 h-fit">
          <div className="rounded-[2.5rem] bg-text-main p-10 text-white shadow-2xl shadow-emerald-900/30">
            <h3 className="mb-10 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Thanh toán</h3>
            <div className="space-y-6 pb-10 border-b border-white/10">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/50">
                <span>Tạm tính</span>
                <span className="text-white">{totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white/50">
                <span>Vận chuyển</span>
                <span className="text-emerald-400">MIỄN PHÍ</span>
              </div>
            </div>
            <div className="mt-10 flex justify-between items-end">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Tổng cộng</span>
              <span className="text-4xl font-black text-white tracking-tighter">{totalPrice.toLocaleString()}đ</span>
            </div>
            <button 
              onClick={() => navigate('/checkout')}
              className="mt-12 flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 py-6 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-400 active:scale-95 shadow-xl shadow-emerald-500/20"
            >
              Đặt Hàng Ngay <ArrowRight size={18} />
            </button>
          </div>
          <Link to="/products" className="mt-8 block text-center text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-primary transition-all opacity-40 hover:opacity-100">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
