import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  ShoppingBag, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  LogOut, 
  Save, 
  X, 
  Clock,
  Truck,
  AlertCircle,
  QrCode,
  CheckCircle2,
  Search,
  ExternalLink
} from 'lucide-react';
import { Product, Order } from '../types';
import { toast } from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'qrcode';
import ConfirmModal from '../components/ConfirmModal';

type BackendOrderProduct = {
  name?: string;
  quantity?: number;
  price?: number;
};

type BackendOrder = {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  products?: string;
  totalPrice: number;
  status?: string;
  createdAt?: string;
};

const InlineQRCode = ({ orderId, onClick }: { orderId: number, onClick: () => void }) => {
  const [dataUrl, setDataUrl] = React.useState<string>('');
  
  React.useEffect(() => {
    const url = `${window.location.origin}/order-view/${orderId}`;
    QRCode.toDataURL(url, { width: 100, margin: 1, color: { dark: '#1c1917', light: '#ffffff' } }, (err, res) => {
      if (!err) setDataUrl(res);
    });
  }, [orderId]);

  if (!dataUrl) return <div className="h-10 w-10 bg-stone-100 rounded-lg animate-pulse" />;

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="bg-white p-1 rounded-lg border border-stone-200 shadow-sm hover:scale-110 transition-all cursor-pointer relative"
      title="Click để xem mã QR"
    >
      <img src={dataUrl} alt="QR" className="h-10 w-10 block" />
    </div>
  );
};

export default function AdminDashboard() {
  const { 
    products, 
    orders: contextOrders, 
    settings, 
    updateProducts, 
    updateOrders, 
    updateSettings, 
    logout 
  } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editingSettings, setEditingSettings] = useState(settings);

  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [selectedQR, setSelectedQR] = useState<{ id: number, url: string } | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; orderId: number | null }>({ isOpen: false, orderId: null });
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const getOrderStatusClass = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-stone-100 text-stone-600';
    }
  };

  const productToneClasses = [
    'bg-emerald-50 border-emerald-200 text-emerald-800',
    'bg-amber-50 border-amber-200 text-amber-800',
    'bg-sky-50 border-sky-200 text-sky-800',
    'bg-rose-50 border-rose-200 text-rose-800',
    'bg-violet-50 border-violet-200 text-violet-800',
    'bg-orange-50 border-orange-200 text-orange-800'
  ];

  const parseOrderProducts = (order: BackendOrder) => {
    if (!order.products) return [] as BackendOrderProduct[];

    try {
      const parsed = JSON.parse(order.products);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const renderOrderSummary = (order: BackendOrder) => {
    const products = parseOrderProducts(order);

    if (products.length === 0) {
      return <span className="text-stone-400">Không có dữ liệu sản phẩm</span>;
    }

    const visibleProducts = products.slice(0, 2);
    const remainingCount = products.length - visibleProducts.length;

    return (
      <div className="flex flex-col gap-2">
        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">
          {products.length} sản phẩm
        </div>
        {visibleProducts.map((item, index) => {
          const toneClass = productToneClasses[index % productToneClasses.length];
          return (
            <div
              key={`${item.name || 'product'}-${index}`}
              className={`inline-flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${toneClass}`}
            >
              <span className="min-w-0 flex-1 truncate">
                {item.name || 'Sản phẩm'} x{item.quantity || 1}
              </span>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-current opacity-70" />
            </div>
          );
        })}
        {remainingCount > 0 && (
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            +{remainingCount} sản phẩm khác
          </div>
        )}
      </div>
    );
  };

  const renderOrderProducts = (order: BackendOrder) => {
    const products = parseOrderProducts(order);

    if (products.length === 0) {
      return <span className="text-stone-400">Không có dữ liệu sản phẩm</span>;
    }

    return (
      <div className="flex flex-col gap-2">
        {products.map((item, index) => {
          const toneClass = productToneClasses[index % productToneClasses.length];
          return (
            <div
              key={`${item.name || 'product'}-${index}`}
              className={`inline-flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest ${toneClass}`}
            >
              <span className="min-w-0 flex-1 truncate">
                {item.name || 'Sản phẩm'} x{item.quantity || 1}
              </span>
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-current opacity-70" />
            </div>
          );
        })}
      </div>
    );
  };

  const fetchOrderById = async (id: string | number) => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Order not found');
      const order = await res.json();
      setEditingOrder(order);
      toast.success(`Đã tìm thấy đơn hàng #${id}`);
    } catch (error) {
      console.error(error);
      toast.error('Không tìm thấy đơn hàng hoặc mã QR không hợp lệ');
    }
  };

  // Removed Google/Drive methods
  
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    
    if (showQRScanner) {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      html5QrCode = new Html5Qrcode("reader");
      
      html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        (decodedText) => {
          // Success
          let orderId = decodedText;
          // Support various formats if needed, e.g. URL or just ID
          if (decodedText.startsWith('http')) {
            const parts = decodedText.split('/');
            orderId = parts[parts.length - 1];
          }
          
          fetchOrderById(orderId);
          setShowQRScanner(false);
          if (html5QrCode) {
            html5QrCode.stop().catch(p => console.error(p));
          }
        },
        (errorMessage) => {
          // parse error, ignore it.
        }
      ).catch(err => {
        console.error("Unable to start scanning.", err);
        toast.error("Không thể khởi động camera. Vui lòng cấp quyền truy cập.");
        setShowQRScanner(false);
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error(err));
      }
    };
  }, [showQRScanner]);

  // Removed Google Auth effect
  
  // --- Orders Logic ---
  const [backendOrders, setBackendOrders] = useState<BackendOrder[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBackendOrders(data as BackendOrder[]);
      }
      return Array.isArray(data) ? (data as BackendOrder[]) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleExportInvoice = async (orderId: number) => {
    try {
      // For demo we pick a default email
      const email = prompt("Nhập email khách hàng để gửi hóa đơn:");
      if (!email) return;

      const res = await fetch('/api/orders/export-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Xuất hóa đơn thành công!");
        fetchOrders(); // Refresh table
      } else {
        toast.error("Lỗi xuất hóa đơn!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Đã xảy ra lỗi hệ thống.");
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const res = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOrder)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cập nhật đơn hàng thành công!');
        setEditingOrder(null);
        fetchOrders();
      } else {
        toast.error('Lỗi cập nhật đơn hàng!');
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi kết nối server.');
    }
  };

  const handleDeleteBackendOrder = (id: number) => {
    console.log('[Admin] Opening delete confirmation modal for order ID:', id);
    setDeleteConfirmModal({ isOpen: true, orderId: id });
  };

  const confirmDeleteOrder = async () => {
    const id = deleteConfirmModal.orderId;
    if (!id) return;

    console.log('[Admin] Requesting deletion for order ID:', id);
    
    setIsDeleting(id);
    setDeleteConfirmModal({ isOpen: false, orderId: null });

    const snapshot = backendOrders;
    setBackendOrders(prev => prev.filter(o => o.id !== id));
    
    try {
      console.log('[Admin] Sending DELETE request to /api/orders/' + id);
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      console.log('[Admin] Server responded:', data, 'Status:', res.status);
      
      if (!res.ok || !data.success) {
        const errorMsg = data.error || 'Lỗi không xác định';
        const latestOrders = await fetchOrders();
        const orderStillExists = latestOrders.some(order => order.id === id);

        if (!orderStillExists) {
          toast.success('Đã xóa đơn hàng thành công!');
          return;
        }

        setBackendOrders(snapshot);
        toast.error('Lỗi khi xóa đơn hàng: ' + errorMsg);
        console.error('[Admin] Deletion failed:', errorMsg);
        return;
      }
      
      toast.success('Đã xóa đơn hàng thành công!');
      await fetchOrders();
    } catch (error) {
      console.error('[Admin] Network or server error during deletion:', error);
      const latestOrders = await fetchOrders();
      const orderStillExists = latestOrders.some(order => order.id === id);

      if (!orderStillExists) {
        toast.success('Đã xóa đơn hàng thành công!');
        return;
      }

      setBackendOrders(snapshot);
      toast.error('Lỗi kết nối server, vui lòng thử lại sau.');
    } finally {
      setIsDeleting(null);
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const newOrders = contextOrders.map(o => o.id === orderId ? { ...o, status } : o);
    updateOrders(newOrders);
  };

  const deleteOrder = (orderId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      updateOrders(contextOrders.filter(o => o.id !== orderId));
    }
  };

  // --- Products Logic ---
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Không thể đọc file ảnh'));
        reader.readAsDataURL(file);
      });

      if (!imageDataUrl) {
        toast.error('Không thể tải ảnh lên');
        return;
      }

      // Update product with an embedded image so it survives reloads.
      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          image: imageDataUrl
        });
      }

      toast.success('Tải hình ảnh thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi kết nối khi upload hình ảnh');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const saveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (products.find(p => p.id === editingProduct.id)) {
      updateProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      toast.success('Đã cập nhật sản phẩm!');
    } else {
      updateProducts([...products, editingProduct]);
      toast.success('Đã thêm sản phẩm mới!');
    }
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm('Xóa sản phẩm này?')) {
      updateProducts(products.filter(p => p.id !== id));
      toast.success('Đã xóa sản phẩm!');
    }
  };

  const startNewProduct = () => {
    setEditingProduct({
      id: Date.now().toString(),
      name: '',
      category: 'Phân Bón Hữu Cơ',
      categorySlug: 'phan-bon-huu-co',
      price: 0,
      image: '',
      thumbnails: [],
      description: '',
      specs: [],
      benefits: [],
      usage: [],
      stockStatus: 'in-stock',
      rating: 5,
      reviewsCount: 0
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-10 pb-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-text-main">Quản Trị Hệ Thống</h1>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">Bảng điều khiển admin THATRICO</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 rounded-xl bg-stone-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-stone-600 hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-10 flex gap-4 border-b border-stone-200">
          {[
            { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
            { id: 'products', label: 'Sản phẩm', icon: Package },
            { id: 'settings', label: 'Cài đặt', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? 'text-primary' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                    {backendOrders.length} đơn hàng đang chờ xử lý
                  </p>
                  <button 
                    onClick={() => setShowQRScanner(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-stone-800 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-stone-900"
                  >
                    <QrCode size={16} /> Quét mã QR đơn hàng
                  </button>
                </div>

                {backendOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-stone-200">
                    <ShoppingBag size={48} className="mx-auto text-stone-200 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Chưa có đơn hàng chờ xử lý nào trong DB</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl overflow-x-auto overflow-y-hidden shadow-sm border border-stone-100">
                    <table className="min-w-[1100px] w-full table-fixed text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50 border-b border-stone-100">
                          <th className="w-[8%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Mã ĐH</th>
                          <th className="w-[12%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Ngày đặt</th>
                          <th className="w-[16%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Khách hàng</th>
                          <th className="w-[14%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Sản phẩm</th>
                          <th className="w-[12%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Tổng tiền</th>
                          <th className="w-[10%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Trạng thái</th>
                          <th className="w-[18%] px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backendOrders.map(order => (
                          <tr key={order.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                            <td className="px-6 py-4 text-xs font-bold font-mono">#{order.id}</td>
                            <td className="px-6 py-4">
                              <p className="text-[10px] font-bold text-text-muted uppercase tracking-tight">
                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                              </p>
                              <p className="text-[8px] font-medium text-stone-400">
                                {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-text-main">{order.customerName}</p>
                              <p className="text-[10px] font-bold text-text-muted">{order.phone}</p>
                            </td>
                            <td className="px-6 py-4 align-top">
                              {renderOrderSummary(order)}
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-primary">{order.totalPrice.toLocaleString()}đ</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-black uppercase tracking-widest rounded-lg px-3 py-1.5 ${getOrderStatusClass(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-2 justify-end">
                              <button 
                                onClick={() => setEditingOrder(order)}
                                className="flex items-center gap-1 bg-stone-100 text-stone-600 text-[10px] font-black uppercase px-3 py-2 rounded-lg hover:bg-stone-200 shrink-0"
                                title="Sửa đơn hàng"
                              >
                                <Edit2 size={14} /> Sửa
                              </button>
                              <InlineQRCode 
                                orderId={order.id} 
                                onClick={async () => {
                                  const url = `${window.location.origin}/order-view/${order.id}`;
                                  const dataUrl = await QRCode.toDataURL(url, { width: 600, margin: 2 });
                                  setSelectedQR({ id: order.id, url: dataUrl });
                                }} 
                              />
                              <button 
                                id={`delete-order-${order.id}`}
                                onClick={() => handleDeleteBackendOrder(order.id)}
                                disabled={isDeleting === order.id}
                                className="flex items-center gap-1 bg-red-50 text-red-500 text-[10px] font-black uppercase px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 shrink-0"
                                title="Xóa đơn hàng"
                              >
                                <Trash2 size={14} /> Xóa
                              </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-end">
                  <button 
                    onClick={startNewProduct}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    <Plus size={16} /> Thêm sản phẩm mới
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(product => (
                    <div key={product.id} className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm relative group overflow-hidden">
                      <div className="aspect-square rounded-2xl bg-stone-50 mb-6 overflow-hidden">
                        <img src={product.image} alt={product.name} className="h-full w-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-tight text-text-main line-clamp-1 mb-1">{product.name}</h3>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">{product.category}</p>
                      <p className="text-lg font-black text-primary mb-6">{product.price.toLocaleString()}đ</p>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setEditingProduct(product)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-100 py-3 text-[10px] font-black uppercase tracking-widest text-stone-600 hover:bg-stone-200 transition-all"
                        >
                          <Edit2 size={14} /> Sửa
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.id)}
                          className="w-12 flex items-center justify-center rounded-xl bg-red-50 py-3 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl"
              >
                <div className="bg-white rounded-3xl p-10 border border-stone-100 shadow-sm">
                  <h3 className="text-xl font-black uppercase tracking-tight text-text-main mb-8">Thông tin liên hệ</h3>
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Số điện thoại</label>
                      <input 
                        type="text" 
                        value={editingSettings.phoneNumber}
                        onChange={(e) => setEditingSettings({ ...editingSettings, phoneNumber: e.target.value })}
                        className="w-full bg-stone-50 border-none rounded-xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Facebook URL</label>
                      <input 
                        type="text" 
                        value={editingSettings.facebookUrl}
                        onChange={(e) => setEditingSettings({ ...editingSettings, facebookUrl: e.target.value })}
                        className="w-full bg-stone-50 border-none rounded-xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        updateSettings(editingSettings);
                        toast.success('Đã lưu cài đặt!');
                      }}
                      className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                      <Save size={16} /> Lưu cài đặt
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Product Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0 bg-text-main/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] shadow-2xl p-10"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black uppercase tracking-tight text-text-main">
                  {products.find(p => p.id === editingProduct.id) ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </h2>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={saveProduct} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Tên sản phẩm</label>
                      <input 
                        type="text" 
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full bg-stone-100 border-none rounded-xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Danh mục</label>
                        <select 
                          value={editingProduct.categorySlug}
                          onChange={(e) => {
                            const option = e.target.selectedOptions[0];
                            setEditingProduct({ 
                              ...editingProduct, 
                              categorySlug: e.target.value,
                              category: option.text
                            });
                          }}
                          className="w-full bg-stone-100 border-none rounded-xl py-4 px-4 text-xs font-bold focus:ring-2 focus:ring-primary"
                        >
                          <option value="phan-bon-huu-co">Phân Bón Hữu Cơ</option>
                          <option value="phan-bon-la">Phân Bón Lá</option>
                          <option value="phan-bon-trung-luong">Phân Bón Trung Lượng</option>
                          <option value="dinh-duong-dat">Dinh Dưỡng Đất</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Giá tiền (VNĐ)</label>
                        <input 
                          type="number" 
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          className="w-full bg-stone-100 border-none rounded-xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Hình ảnh chính</label>
                      <div className="space-y-4">
                        {/* Image Preview */}
                        {editingProduct.image && (
                          <div className="relative w-full aspect-square rounded-2xl bg-stone-100 overflow-hidden border-2 border-primary/20">
                            <img 
                              src={editingProduct.image} 
                              alt="Preview" 
                              className="w-full h-full object-contain p-4"
                            />
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, image: '' })}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                              title="Xóa ảnh"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        )}

                        {/* File Input */}
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file);
                              }
                            }}
                            disabled={isUploadingImage}
                            className="hidden"
                            id="product-image-input"
                          />
                          <label
                            htmlFor="product-image-input"
                            className={`block w-full bg-stone-100 border-2 border-dashed border-primary/30 rounded-xl py-8 px-6 text-center cursor-pointer transition-all hover:border-primary/50 ${
                              isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="text-2xl">📁</div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                                {isUploadingImage ? 'Đang tải lên...' : 'Chọn hoặc kéo hình ảnh'}
                              </p>
                              <p className="text-[9px] font-bold text-stone-300">JPG, PNG, WebP, GIF (Max 5MB)</p>
                            </div>
                          </label>
                        </div>

                        {/* Drag & Drop */}
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('border-primary', 'bg-primary/5');
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                            const file = e.dataTransfer.files?.[0];
                            if (file && file.type.startsWith('image/')) {
                              handleImageUpload(file);
                            }
                          }}
                          className="border-2 border-dashed border-stone-200 rounded-xl p-4 text-center transition-colors"
                        >
                          <p className="text-[10px] font-bold text-stone-400">Hoặc kéo thả file vào đây</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Mô tả sản phẩm</label>
                      <textarea 
                        value={editingProduct.description}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        className="w-full bg-stone-100 border-none rounded-xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-primary h-32"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Trạng thái kho</label>
                      <div className="flex gap-4">
                        <button 
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, stockStatus: 'in-stock' })}
                          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            editingProduct.stockStatus === 'in-stock' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          Sẵn hàng
                        </button>
                        <button 
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, stockStatus: 'out-of-stock' })}
                          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            editingProduct.stockStatus === 'out-of-stock' ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          Hết hàng
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-10 border-t border-stone-100">
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Lưu sản phẩm
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-10 bg-stone-200 text-stone-600 font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-stone-300 transition-all"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Edit Modal */}
      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingOrder(null)}
              className="absolute inset-0 bg-text-main/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl p-10"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black uppercase tracking-tight text-text-main">Sửa Đơn Hàng #{editingOrder.id}</h2>
                <button onClick={() => setEditingOrder(null)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdateOrder} className="space-y-6">
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Họ và tên</label>
                      <input 
                        type="text" 
                        value={editingOrder.customerName}
                        onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                        className="w-full bg-stone-100 border-none rounded-xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Số điện thoại</label>
                      <input 
                        type="text" 
                        value={editingOrder.phone}
                        onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                        className="w-full bg-stone-100 border-none rounded-xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Tổng tiền (VNĐ)</label>
                      <input 
                        type="number" 
                        value={editingOrder.totalPrice}
                        onChange={(e) => setEditingOrder({ ...editingOrder, totalPrice: Number(e.target.value) })}
                        className="w-full bg-stone-100 border-none rounded-xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Sản phẩm đã mua</label>
                      <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-4 text-xs font-bold text-text-main leading-relaxed">
                        {renderOrderProducts(editingOrder)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Trạng thái</label>
                      <select 
                        value={editingOrder.status}
                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                        className="w-full bg-stone-100 border-none rounded-xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-primary"
                      >
                        <option value="pending">Đang xử lý (Pending)</option>
                        <option value="completed">Đã hoàn thành (Completed)</option>
                        <option value="cancelled">Đã hủy (Cancelled)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Địa chỉ</label>
                    <input 
                      type="text" 
                      value={editingOrder.address}
                      onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                      className="w-full bg-stone-100 border-none rounded-xl py-4 px-6 text-xs font-bold focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-10 border-t border-stone-100">
                  <button 
                    type="submit"
                    className="flex-1 bg-primary text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Lưu thông tin
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-10 bg-stone-200 text-stone-600 font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-stone-300 transition-all"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showQRScanner && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQRScanner(false)}
              className="absolute inset-0 bg-text-main/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-text-main">Quét mã QR</h2>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Sử dụng camera của bạn</p>
                </div>
                <button onClick={() => setShowQRScanner(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div 
                  id="reader" 
                  className="w-full aspect-square bg-stone-100 rounded-2xl overflow-hidden border-2 border-dashed border-stone-200"
                ></div>
                
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-700">
                    <AlertCircle size={20} className="shrink-0" />
                    <p className="text-[11px] font-bold leading-relaxed">
                      Di chuyển camera của bạn để mã QR nằm gọn trong khung hình phía trên.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setShowQRScanner(false)}
                    className="w-full bg-stone-200 text-stone-600 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-stone-300 transition-all text-xs"
                  >
                    Hủy quét
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Large QR Modal */}
      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQR(null)}
              className="absolute inset-0 bg-text-main/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-10 overflow-hidden flex flex-col items-center"
            >
              <button 
                onClick={() => setSelectedQR(null)}
                className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-xl font-black uppercase tracking-tight text-text-main">Mã QR Đơn Hàng</h2>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">Đơn hàng #{selectedQR.id}</p>
              </div>

              <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-stone-100 mb-8">
                <img src={selectedQR.url} alt="QR Code" className="w-full h-auto" />
              </div>

              <div className="space-y-4 w-full">
                <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl text-stone-600">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                    Quét mã này để xem chi tiết đơn hàng trên thiết bị di động.
                  </p>
                </div>
                
                <a
                  href={selectedQR.url}
                  download={`Order-${selectedQR.id}-QR.png`}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-primary/90 transition-all text-[10px]"
                >
                  <QrCode size={16} /> Tải mã QR về máy
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        title="Xóa đơn hàng"
        message={`Bạn có chắc chắn muốn xóa đơn hàng #${deleteConfirmModal.orderId}? Hành động này không thể hoàn tác.`}
        icon={<Trash2 size={24} />}
        confirmText="Xóa"
        cancelText="Hủy bỏ"
        isDangerous={true}
        onConfirm={confirmDeleteOrder}
        onCancel={() => setDeleteConfirmModal({ isOpen: false, orderId: null })}
      />
    </div>
  );
}
