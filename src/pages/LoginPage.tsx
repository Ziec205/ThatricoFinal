import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, Phone, MapPin, Building } from 'lucide-react';

type AuthMode = 'login' | 'register';

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState('');
  
  const { login, register, isAdmin } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (login(username, password)) {
        if (username === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác');
      }
    } else {
      // Basic validation for registration
      if (!username || !password || !fullName || !phone) {
        setError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }
      
      register({
        username,
        fullName,
        phone,
        address,
        city
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-8 md:p-10">
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
              <UserIcon size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-text-main">
              {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
            </h1>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-2 px-10 leading-relaxed">
              {mode === 'login' 
                ? 'Nhập thông tin tài khoản của bạn để tiếp tục' 
                : 'Tham gia hệ thống THATRICO để lưu trữ thông tin mua hàng'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Tên đăng nhập (Username/SĐT)</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-stone-100 border-none rounded-xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="username/sdt"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-100 border-none rounded-xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Họ và tên</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-stone-100 border-none rounded-xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-stone-100 border-none rounded-xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder="0xxx xxx xxx"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Địa chỉ</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-stone-100 border-none rounded-xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Số nhà, tên đường..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Tỉnh/Thành phố</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-stone-100 border-none rounded-xl py-4 pl-12 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="VD: Long An"
                    />
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest text-center bg-red-50 py-3 rounded-xl">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-primary text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] mt-4"
            >
              {mode === 'login' ? 'Đăng nhập' : 'Hoàn tất đăng ký'}
            </button>

            <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError('');
                }}
                className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
              >
                {mode === 'login' ? 'Bạn chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
