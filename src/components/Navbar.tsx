import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, Phone, User, Leaf, LayoutDashboard, RotateCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../CartContext';
import { useAppContext } from '../AppContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { totalItems } = useCart();
  const { settings, isAdmin, user, logout, updateProducts } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        toast.error('Server không trả về sản phẩm. Bỏ qua cập nhật để tránh xóa dữ liệu cục bộ.');
        return;
      }

      updateProducts(data as any, true);
      toast.success('Đã cập nhật danh sách sản phẩm');
      return;
    } catch (e) {
      console.error('Refresh products failed', e);
      toast.error('Không thể cập nhật sản phẩm. Vui lòng thử lại sau.');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-outline">
      {/* Top Bar */}
      <div className="bg-text-main px-4 py-2 text-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-primary" /> {settings.phoneNumber}
            </span>
          </div>
          <div className="hidden md:block">
            Giải pháp nông nghiệp bền vững cho nhà nông
          </div>
          <div>
            {/* Removed Login/Contact for harmony as per request */}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img src="/Logo.png" alt="THATRICO Logo" className="h-16 w-auto object-contain" />
          <div className="hidden flex-col leading-none md:flex">
            <span className="text-lg font-black uppercase tracking-[0.25em] text-text-main">THATRICO</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-muted">Giải pháp nông nghiệp</span>
          </div>
        </Link>
        {/* Desktop Menu */}
        <ul className="hidden items-center gap-10 text-xs font-bold uppercase tracking-widest text-text-muted md:flex">
          <li><Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link></li>
          <li><Link to="/products" className="hover:text-primary transition-colors">Sản phẩm</Link></li>
          <li><Link to="/track-order" className="hover:text-primary transition-colors">Tra cứu đơn</Link></li>
          <li><Link to="/about" className="hover:text-primary transition-colors">Giới thiệu</Link></li>
          <li><Link to="/news" className="hover:text-primary transition-colors">Tin tức</Link></li>
        </ul>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex mr-4">
             <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Tìm sản phẩm..." 
                  className="rounded-full bg-stone-100 py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-primary focus:outline-none w-48 lg:w-64"
                />
             </div>
          </div>
          
          <Link 
            to={user ? (user.type === 'admin' ? '/admin' : '/') : '/login'} 
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
          >
            <User size={20} />
          </Link>
          
          <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                {totalItems}
              </span>
            )}
          </Link>
          
          <button 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white px-4 pb-6 md:hidden"
          >
            <ul className="flex flex-col gap-4 text-gray-700">
              <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Trang chủ</Link></li>
              <li><Link to="/products" onClick={() => setIsMenuOpen(false)}>Sản phẩm</Link></li>
              <li><Link to="/track-order" onClick={() => setIsMenuOpen(false)}>Tra cứu đơn</Link></li>
              <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>Giới thiệu</Link></li>
              <li><Link to="/news" onClick={() => setIsMenuOpen(false)}>Tin tức</Link></li>
              <li>
                <button onClick={() => { setIsMenuOpen(false); refreshProducts(); }} className="w-full text-left flex items-center gap-2 py-2 px-3 rounded-md bg-stone-50 hover:bg-stone-100">
                  <RotateCw size={16} /> Cập nhật sản phẩm
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
