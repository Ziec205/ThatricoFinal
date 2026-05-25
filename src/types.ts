export interface Product {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  image: string;
  thumbnails: string[];
  description: string;
  specs: { label: string; value: string }[];
  benefits: string[];
  usage: string[];
  isHot?: boolean;
  isNew?: boolean;
  stockStatus: 'in-stock' | 'out-of-stock';
  rating: number;
  reviewsCount: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
}

export interface AuthUser extends User {
  type: 'admin' | 'user';
}

export interface AppSettings {
  phoneNumber: string;
  facebookUrl: string;
  spreadsheetId?: string;
}
