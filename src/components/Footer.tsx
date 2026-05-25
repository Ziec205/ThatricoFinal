import { Leaf, Phone, Mail, MapPin, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../AppContext';

export default function Footer() {
  const { settings } = useAppContext();

  return (
    <footer className="bg-stone-100 border-t border-outline pt-20 pb-10 text-text-muted">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-16 md:grid-cols-4">
          {/* Logo & Contact */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="mb-8 flex items-center">
              <img 
                src="/Logo.png" 
                alt="THATRICO Logo" 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="mb-8 text-xs font-medium leading-relaxed opacity-80">
              Tiên phong trong các giải pháp dinh dưỡng hữu cơ và công nghệ nông nghiệp bền vững tại Việt Nam.
            </p>
            <div className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary" />
                <span className="text-text-main">{settings.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-primary" />
                <span className="text-text-main">info@thatrico.vn</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-main">Điều hướng</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><Link to="/about" className="hover:text-primary transition-colors">Giới thiệu</Link></li>
              <li><Link to="/news" className="hover:text-primary transition-colors">Tin tức</Link></li>
              <li><Link to="/gallery" className="hover:text-primary transition-colors">Thư viện</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Hỗ trợ</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-main">Sản phẩm</h4>
            <ul className="space-y-4 text-[10px] font-bold uppercase tracking-widest">
              <li><Link to="/products?cat=phan-bon-huu-co" className="hover:text-primary transition-colors">Hữu cơ</Link></li>
              <li><Link to="/products?cat=phan-bon-la" className="hover:text-primary transition-colors">Phân bón lá</Link></li>
              <li><Link to="/products?cat=dinh-duong-dat" className="hover:text-primary transition-colors">Dinh dưỡng đất</Link></li>
              <li><Link to="/products?cat=thuoc-sinh-hoc" className="hover:text-primary transition-colors">Sinh học</Link></li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h4 className="mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-main">Kết nối</h4>
            <div className="mb-8 flex gap-3">
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 text-stone-600 transition-all hover:bg-primary hover:text-white">
                <Facebook size={18} />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-200 text-stone-600 transition-all hover:bg-primary hover:text-white">
                <Youtube size={18} />
              </a>
            </div>
            <form className="relative">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                className="w-full rounded-xl bg-stone-200/50 border-none py-3 px-4 text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button className="absolute right-1 top-1 bottom-1 px-4 rounded-lg bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                Gửi
              </button>
            </form>
          </div>
        </div>

        <div className="mt-20 border-t border-outline/50 pt-10 text-center text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
          <p>© {new Date().getFullYear()} THATRICO Agricultural Solutions</p>
        </div>
      </div>
    </footer>
  );
}
