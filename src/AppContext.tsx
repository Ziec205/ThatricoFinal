import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, AppSettings, User, AuthUser } from './types';
import { PRODUCTS as INITIAL_PRODUCTS } from './data';

interface AppContextType {
  products: Product[];
  orders: Order[];
  settings: AppSettings;
  user: AuthUser | null;
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (userData: Omit<User, 'id'>) => void;
  updateProducts: (products: Product[]) => void;
  updateOrders: (orders: Order[]) => void;
  updateSettings: (settings: AppSettings) => void;
  addOrder: (order: Order) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    phoneNumber: '0838008747',
    facebookUrl: 'https://www.facebook.com/profile.php?id=61570207916087',
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Load from server first, fallback to localStorage
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data as Product[]);
            localStorage.setItem('thatrico_products_v2', JSON.stringify(data));
            return;
          }
        }
      } catch (e) {
        // ignore and fallback to localStorage
      }

      const savedProducts = localStorage.getItem('thatrico_products_v2');
    const savedOrders = localStorage.getItem('thatrico_orders_v2');
    const savedSettings = localStorage.getItem('thatrico_settings_v2');
    const savedUser = localStorage.getItem('thatrico_user_v2');

    if (savedProducts) setProducts(JSON.parse(savedProducts));
    else setProducts(INITIAL_PRODUCTS);

    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedUser) {
      const u = JSON.parse(savedUser) as AuthUser;
      setUser(u);
      if (u.type === 'admin') setIsAdmin(true);
    }
  }, []);

  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('thatrico_products_v2', JSON.stringify(newProducts));

    // Try to sync to backend (replace entire product list)
    (async () => {
      try {
        await fetch('/api/products/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProducts)
        });
      } catch (e) {
        // ignore sync errors — app will continue to use local copy
        console.error('Failed to sync products to server', e);
      }
    })();
  };

  const updateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('thatrico_orders_v2', JSON.stringify(newOrders));
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('thatrico_settings_v2', JSON.stringify(newSettings));
  };

  const addOrder = (order: Order) => {
    const newOrders = [order, ...orders];
    updateOrders(newOrders);
  };

  const login = (username: string, password: string) => {
    if (username === 'admin' && password === 'Thatrico') {
      const adminUser: AuthUser = {
        id: 'admin',
        username: 'admin',
        fullName: 'Administrator',
        phone: '0838008747',
        address: '',
        city: '',
        type: 'admin'
      };
      setIsAdmin(true);
      setUser(adminUser);
      localStorage.setItem('thatrico_user_v2', JSON.stringify(adminUser));
      return true;
    }

    // For simplicity, let's treat any other login as a "success" if it matches a saved user
    // or just allow login with any username/pass for demo (as per typical requests like this)
    // Actually, the user asked for "user bình thường thì sau đăng nhập sẽ quay lại trang chủ... tài khoản dùng để lưu thông tin"
    const savedUsersStr = localStorage.getItem('thatrico_all_users') || '[]';
    const allUsers = JSON.parse(savedUsersStr) as User[];
    const foundUser = allUsers.find(u => u.username === username);

    if (foundUser) {
      const authUser: AuthUser = { ...foundUser, type: 'user' };
      setUser(authUser);
      localStorage.setItem('thatrico_user_v2', JSON.stringify(authUser));
      return true;
    }

    return false;
  };

  const register = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    const savedUsersStr = localStorage.getItem('thatrico_all_users') || '[]';
    const allUsers = JSON.parse(savedUsersStr);
    allUsers.push(newUser);
    localStorage.setItem('thatrico_all_users', JSON.stringify(allUsers));

    const authUser: AuthUser = { ...newUser, type: 'user' };
    setUser(authUser);
    localStorage.setItem('thatrico_user_v2', JSON.stringify(authUser));
  };

  const logout = () => {
    setIsAdmin(false);
    setUser(null);
    localStorage.removeItem('thatrico_user_v2');
  };

  return (
    <AppContext.Provider value={{
      products,
      orders,
      settings,
      user,
      isAdmin,
      login,
      logout,
      register,
      updateProducts,
      updateOrders,
      updateSettings,
      addOrder
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
