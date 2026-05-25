import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Plus, Minus, ChevronRight } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAppContext } from '../AppContext';
import { motion } from 'motion/react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useAppContext();
  const product = products.find((p) => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImg, setSelectedImg] = useState(product?.image);

  useEffect(() => {
    if (product) {
      setSelectedImg(product.image);
    }
  }, [product]);

  if (!product) {
    return <div className="flex h-[50vh] items-center justify-center">Sản phẩm không tồn tại.</div>;
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div id="product-detail" className="bg-white pb-20">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
          <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Trang chủ</button>
          <ChevronRight size={10} />
          <button onClick={() => navigate('/products')} className="hover:text-primary transition-colors">Sản phẩm</button>
          <ChevronRight size={10} />
          <span className="text-text-main">{product.name}</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl gap-16 px-4 md:grid-cols-2 md:px-8">
        {/* Images */}
        <div className="space-y-6">
          <div className="aspect-square overflow-hidden rounded-[2rem] bg-stone-50 border border-outline shadow-sm">
            <img src={selectedImg} alt={product.name} className="h-full w-full object-cover transition-all duration-700 hover:scale-105" />
          </div>
          {product.thumbnails.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {[product.image, ...product.thumbnails].map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(thumb)}
                  className={`aspect-square overflow-hidden rounded-2xl border-2 transition-all ${
                    selectedImg === thumb ? 'border-primary shadow-lg shadow-primary/20 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={thumb} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <span className="mb-4 inline-block text-[10px] font-black uppercase tracking-[0.3em] text-primary">{product.category}</span>
          <h1 className="mb-6 text-4xl font-black uppercase tracking-tight text-text-main md:text-5xl leading-none">{product.name}</h1>
          
          <div className="mb-10 flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-emerald-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'} className={i < Math.floor(product.rating) ? 'opacity-100' : 'opacity-20'} />
              ))}
              <span className="ml-3 text-xs font-black uppercase tracking-widest text-text-muted">{product.rating} <span className="opacity-40">/ 5.0</span></span>
            </div>
            <div className="h-1 w-1 rounded-full bg-stone-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Sẵn hàng</span>
          </div>

          <div className="mb-10 flex items-baseline gap-6">
            <span className="text-5xl font-black text-emerald-700 tracking-tighter">{product.price.toLocaleString()}đ</span>
            {product.originalPrice && (
              <span className="text-2xl text-text-muted line-through opacity-40">{product.originalPrice.toLocaleString()}đ</span>
            )}
          </div>

          <p className="mb-12 text-sm font-medium text-text-muted leading-relaxed max-w-xl">
            {product.description}
          </p>

          <div className="mb-12 flex flex-wrap gap-6 items-center">
            <div className="flex items-center rounded-2xl bg-stone-100 p-1.5 border border-outline">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="flex h-12 w-12 items-center justify-center rounded-xl hover:bg-white transition-all text-text-main hover:shadow-sm"
              >
                <Minus size={20} />
              </button>
              <span className="w-14 text-center font-black text-lg">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="flex h-12 w-12 items-center justify-center rounded-xl hover:bg-white transition-all text-text-main hover:shadow-sm"
              >
                <Plus size={20} />
              </button>
            </div>
            <button 
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-3 rounded-2xl border-2 border-primary px-8 py-5 text-xs font-black uppercase tracking-widest text-primary transition-all hover:bg-emerald-50 active:scale-95 shadow-lg shadow-emerald-900/5"
            >
              <ShoppingCart size={18} /> Thêm vào giỏ
            </button>
          </div>

          <button 
            onClick={handleBuyNow}
            className="mb-12 w-full rounded-2xl bg-emerald-600 py-6 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-xl shadow-emerald-600/30"
          >
            MUA NGAY - MIỄN PHÍ VẬN CHUYỂN
          </button>

          {/* Quick Features */}
          <div className="grid grid-cols-3 gap-6 border-t border-outline pt-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50 text-emerald-600 border border-outline">
                <ShieldCheck size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Chính hãng</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50 text-emerald-600 border border-outline">
                <Truck size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Tốc hành</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50 text-emerald-600 border border-outline">
                <RotateCcw size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">Đổi trả</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto mt-24 max-w-7xl px-4 md:px-8">
        <div className="border-b border-outline">
          <div className="flex gap-12">
            {[
              { id: 'description', label: 'CHI TIẾT' },
              { id: 'specs', label: 'THÔNG SỐ' },
              { id: 'usage', label: 'CÁCH DÙNG' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative pb-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                  activeTab === tab.id ? 'text-primary' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="tab" className="absolute bottom-0 left-0 h-1 w-full bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(5,150,105,0.4)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="py-16">
          {activeTab === 'description' && (
            <div className="max-w-3xl space-y-10">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight text-text-main mb-6">Lợi ích vượt trội</h3>
                <ul className="space-y-4">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-4 text-sm font-medium text-text-muted">
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Plus size={10} />
                      </div>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                 <h3 className="text-xl font-black uppercase tracking-tight text-text-main mb-6">Mô tả sản phẩm</h3>
                 <p className="text-sm font-medium text-text-muted leading-loose opacity-80">{product.description}</p>
              </div>
            </div>
          )}
          {activeTab === 'specs' && (
            <div className="max-w-2xl overflow-hidden rounded-2xl border border-outline shadow-sm">
               <table className="w-full text-left">
                 <tbody className="divide-y divide-outline">
                   {product.specs.map((s, i) => (
                     <tr key={i} className="group hover:bg-stone-50 transition-colors">
                       <td className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-text-main bg-stone-50/50 w-1/3">{s.label}</td>
                       <td className="py-5 px-8 text-sm font-bold text-text-muted">{s.value}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          )}
          {activeTab === 'usage' && (
            <div className="bg-stone-50 border border-outline p-12 rounded-[2rem] shadow-sm">
               <h3 className="text-2xl font-black uppercase tracking-tight text-text-main mb-8">Pha chế & Phun xịt</h3>
               <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 {product.usage.map((u, i) => (
                   <div key={i} className="relative bg-white p-8 rounded-2xl border border-outline shadow-sm">
                     <span className="absolute -top-4 -left-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-black shadow-lg shadow-emerald-200">
                       0{i + 1}
                     </span>
                     <p className="text-sm font-bold text-text-main leading-relaxed">{u}</p>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
