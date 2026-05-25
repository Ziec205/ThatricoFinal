import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, SlidersHorizontal, ChevronRight, Plus } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAppContext } from '../AppContext';

export default function ProductListPage() {
  const { addToCart } = useCart();
  const { products } = useAppContext();
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceRange, setPriceRange] = useState(1000000);

  const categories = [
    { name: 'Tất cả', slug: 'all', count: products.length },
    { name: 'Phân Bón Hữu Cơ', slug: 'phan-bon-huu-co', count: products.filter(p => p.categorySlug === 'phan-bon-huu-co').length },
    { name: 'Phân Bón Lá', slug: 'phan-bon-la', count: products.filter(p => p.categorySlug === 'phan-bon-la').length },
    { name: 'Dinh Dưỡng Đất', slug: 'dinh-duong-dat', count: products.filter(p => p.categorySlug === 'dinh-duong-dat').length },
    { name: 'Thuốc Sinh Học', slug: 'thuoc-sinh-hoc', count: products.filter(p => p.categorySlug === 'thuoc-sinh-hoc').length },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.categorySlug === activeCategory;
    const matchesPrice = p.price <= priceRange;
    return matchesCategory && matchesPrice;
  });

  return (
    <div id="product-list" className="bg-surface pb-20">
      {/* Breadcrumb & Header */}
      <div className="bg-white py-12 border-b border-outline">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <nav className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight size={10} />
            <span className="text-text-main">Sản phẩm</span>
          </nav>
          <h1 className="text-4xl font-black uppercase tracking-tight text-text-main">Danh Mục Sản Phẩm</h1>
        </div>
      </div>

      <div className="mx-auto mt-12 grid max-w-7xl gap-12 px-4 md:grid-cols-[260px_1fr] md:px-8">
        {/* Sidebar Filters */}
        <aside className="hidden md:block">
          <div className="sticky top-28 space-y-12">
            <div>
              <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-main">Phân loại</h3>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                        activeCategory === cat.slug 
                          ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                          : 'text-text-muted hover:bg-stone-100 hover:text-text-main'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md ${activeCategory === cat.slug ? 'bg-emerald-200' : 'bg-stone-200 text-stone-500'}`}>
                        {cat.count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-main">Lọc giá</h3>
              <div className="space-y-8 px-2">
                <div className="relative">
                  <div 
                    className="absolute -top-7 px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-md -translate-x-1/2 pointer-events-none whitespace-nowrap shadow-lg shadow-primary/20 after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-primary"
                    style={{ left: `${(priceRange / 1000000) * 100}%` }}
                  >
                    {priceRange.toLocaleString()}đ
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="10000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="accent-primary w-full cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none" 
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  <span>0đ</span>
                  <span>1.000.000đ+</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-900 p-6 text-white shadow-xl shadow-emerald-900/20">
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400">Ưu đãi mùa vụ</span>
               <p className="mt-2 text-sm font-black leading-tight uppercase">Giảm 15% cho đơn hàng phân bón lá</p>
               <button className="mt-6 w-full rounded-xl bg-emerald-500 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                 Nhận Mã Ngay
               </button>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main>
          <div className="mb-10 flex items-center justify-between rounded-2xl bg-white p-5 border border-outline shadow-sm">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-text-muted">
              <SlidersHorizontal size={14} className="text-primary" />
              <span>Kết quả: {filteredProducts.length} sản phẩm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Sắp xếp:</span>
              <select className="bg-transparent text-[10px] font-black uppercase tracking-widest text-text-main focus:outline-none cursor-pointer">
                <option>Mới nhất</option>
                <option>Giá tăng dần</option>
                <option>Giá giảm dần</option>
              </select>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group relative border border-outline bg-white p-5 rounded-2xl shadow-sm transition-all hover:shadow-xl hover:border-emerald-200">
                <Link to={`/product/${product.id}`} className="block">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-stone-50">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    {product.isHot && <span className="absolute left-4 top-4 rounded-lg bg-red-500 px-2 py-1 text-[8px] font-black text-white uppercase tracking-widest">HOT</span>}
                    {product.isNew && <span className="absolute left-4 top-4 rounded-lg bg-emerald-500 px-2 py-1 text-[8px] font-black text-white uppercase tracking-widest">MỚI</span>}
                  </div>
                </Link>
                <div className="mt-6">
                  <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-text-muted opacity-60">{product.category}</p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="mb-3 text-sm font-black uppercase tracking-tight text-text-main hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
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
        </main>
      </div>
    </div>
  );
}
