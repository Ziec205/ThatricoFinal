import { motion } from 'motion/react';
import { ArrowRight, Star, ShoppingBag, ShieldCheck, Truck, Zap, Phone, Leaf, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useAppContext } from '../AppContext';

export default function HomePage() {
  const { addToCart } = useCart();
  const { products, settings } = useAppContext();
  const hotProducts = products.filter(p => p.isHot);

  return (
    <div id="home-page" className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-8">
        <div className="relative h-[400px] w-full overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 to-emerald-700 md:h-[500px] shadow-2xl shadow-emerald-900/20">
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2670&auto=format&fit=crop" 
            alt="Lush green garden"
            className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="relative z-10 flex h-full flex-col justify-center px-8 md:px-16">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-4 inline-block w-fit rounded-full bg-white/20 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-[#cbffc2] backdrop-blur-md"
            >
              Công Nghệ Nông Nghiệp Mới
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6 max-w-2xl text-4xl font-black leading-none text-white md:text-6xl"
            >
              GIẢI PHÁP <br /> <span className="text-emerald-400">DINH DƯỠNG</span> <br /> BỀN VỮNG
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10 max-w-md text-sm font-medium text-white/70 md:text-base"
            >
              Tăng năng suất cây trồng đến 30% với các dòng phân bón hữu cơ vi sinh nhập khẩu chính ngạch.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/products" className="flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-400 shadow-lg shadow-emerald-500/30">
                Mua Ngay <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-xs font-black uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/20">
                Tìm Hiểu
              </Link>
            </motion.div>
          </div>
          
          {/* Abstract blobs like in design */}
          <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-10 right-20 h-24 w-24 rounded-full bg-emerald-400/20 blur-xl" />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { icon: ShieldCheck, title: 'CHẤT LƯỢNG', desc: 'Sản phẩm nhập khẩu 100%' },
            { icon: Truck, title: 'GIAO HÀNG', desc: 'Toàn quốc 2-3 ngày' },
            { icon: Zap, title: 'HIỆU QUẢ', desc: 'Thấy rõ sau 7 ngày' },
            { icon: Phone, title: 'HỖ TRỢ', desc: 'Kỹ thuật 24/7' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 border border-outline bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-primary">
                <item.icon size={24} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-text-main">{item.title}</h3>
                <p className="text-[10px] font-bold text-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Danh mục nổi bật</span>
            <h2 className="text-2xl font-black uppercase tracking-tight text-text-main md:text-3xl">Sản Phẩm Bán Chạy</h2>
          </div>
          <Link to="/products" className="text-xs font-black uppercase tracking-widest text-primary hover:underline underline-offset-8">Xem tất cả</Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {hotProducts.map((product) => (
            <div key={product.id} className="group relative border border-outline bg-white p-5 rounded-2xl shadow-sm transition-all hover:shadow-xl hover:border-emerald-200">
              <Link to={`/product/${product.id}`} className="block">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-50">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  {product.isHot && (
                    <span className="absolute left-4 top-4 rounded-lg bg-red-500 px-2 py-1 text-[8px] font-black text-white uppercase tracking-widest">
                      HOT
                    </span>
                  )}
                </div>
              </Link>
              <div className="mt-6">
                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">{product.category}</p>
                <Link to={`/product/${product.id}`}>
                  <h3 className="mb-3 text-sm font-black uppercase tracking-tight text-text-main hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                </Link>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    {product.originalPrice && (
                      <span className="text-[10px] text-text-muted line-through">{(product.originalPrice).toLocaleString()}đ</span>
                    )}
                    <span className="text-lg font-black text-emerald-700">{(product.price).toLocaleString()}đ</span>
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:scale-110 active:scale-95"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-text-main py-16 px-8 text-white md:px-16 shadow-2xl">
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 backdrop-blur-sm">
              <Leaf size={32} />
            </div>
            <h2 className="mb-6 text-3xl font-black uppercase tracking-tight md:text-5xl">Gia tăng năng suất <br /> <span className="text-emerald-500">vượt giới hạn</span></h2>
            <p className="mb-10 text-sm font-medium text-white/60 md:text-lg">
              Đội ngũ kỹ sư Thatrico sẵn sàng đồng hành cùng bạn trên mọi mảnh vườn. Tư vấn kỹ thuật và giải pháp dinh dưỡng miễn phí.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="rounded-xl bg-white px-8 py-4 text-xs font-black uppercase tracking-widest text-text-main hover:bg-stone-100 shadow-xl">
                Bắt Đầu Ngay
              </Link>
              <a href={`tel:${settings.phoneNumber}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 backdrop-blur-sm">
                <Phone size={16} className="text-emerald-500" /> {settings.phoneNumber}
              </a>
            </div>
          </div>
          {/* Decorative gradients */}
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-900 blur-3xl opacity-50" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500 blur-3xl opacity-20" />
        </div>
      </section>
    </div>
  );
}
