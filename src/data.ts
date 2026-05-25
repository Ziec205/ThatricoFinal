import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Đạm Hữu Cơ Thatrico - Chai 1L',
    category: 'Phân Bón Hữu Cơ',
    categorySlug: 'phan-bon-huu-co',
    price: 150000,
    image: '/images/san-pham-1-1.jpg',
    thumbnails: [
      '/images/san-pham-1-2.png',
      '/images/san-pham-1-3.png'
    ],
    description: 'Sản phẩm Đạm Hữu Cơ Thatrico giúp cây trồng phát triển bộ rễ mạnh mẽ, bung đọt nhanh, xanh lá, dày lá. Phù hợp cho nhiều loại cây trồng đặc biệt là cây ăn trái và cây công nghiệp.',
    specs: [
      { label: 'Loại', value: 'Đạm Hữu Cơ' },
      { label: 'Quy cách', value: 'Chai 1 Lít' },
      { label: 'Thương hiệu', value: 'Thatrico' }
    ],
    benefits: [
      'Bật mầm tốt, xanh lá, dày lá.',
      'Cây phát triển mạnh bộ rễ.',
      'Đậu hoa, giúp nuôi trái lớn.',
      'Đẻ nhánh mạnh, bung cành.',
      'Cải tạo đất, ổn định pH đất.'
    ],
    usage: [
      'Pha 20-25ml cho bình 25 lít nước.',
      'Dùng định kỳ 7-10 ngày/lần.',
      'Dùng trong tất cả các giai đoạn của cây trồng.'
    ],
    isHot: true,
    stockStatus: 'in-stock',
    rating: 5.0,
    reviewsCount: 15
  },
  {
    id: '2',
    name: 'Đạm Hữu Cơ Thatrico - Can 5L',
    category: 'Phân Bón Hữu Cơ',
    categorySlug: 'phan-bon-huu-co',
    price: 300000,
    image: '/images/san-pham-2-1.png',
    thumbnails: [
      '/images/san-pham-2-2.png',
      '/images/san-pham-2-3.jpg'
    ],
    description: 'Quy cách tiết kiệm cho diện tích lớn. Đạm Hữu Cơ Thatrico cung cấp dưỡng chất thiết yếu giúp phục hồi cây nhanh chóng sau thu hoạch và kích thích tăng trưởng mạnh mẽ.',
    specs: [
      { label: 'Loại', value: 'Đạm Hữu Cơ' },
      { label: 'Quy cách', value: 'Can 5 Lít' },
      { label: 'Thương hiệu', value: 'Thatrico' }
    ],
    benefits: [
      'Bật mầm tốt, xanh lá, dày lá.',
      'Cây phát triển mạnh bộ rễ.',
      'Đậu hoa, giúp nuôi trái lớn.',
      'Đẻ nhánh mạnh, bung cành.',
      'Cải tạo đất, ổn định pH đất.'
    ],
    usage: [
      'Pha 250-500ml cho phuy 200 lít nước.',
      'Dùng tưới gốc hoặc phun qua lá.',
      'Dùng giai đoạn sau thu hoạch, kiến thiết cơ bản.'
    ],
    isHot: true,
    isNew: true,
    stockStatus: 'in-stock',
    rating: 4.9,
    reviewsCount: 10
  },
  {
    id: '3',
    name: 'Phân Bón Trung Lượng Denta-Max',
    category: 'Phân Bón Trung Lượng',
    categorySlug: 'phan-bon-trung-luong',
    price: 85000,
    image: '/images/tat-ca-san-pham.png',
    thumbnails: [],
    description: 'Khắc phục vàng lá, hạn chế cháy lá, giúp cây xanh mướt, bền bỉ. Công nghệ từ Hoa Kỳ.',
    specs: [
      { label: 'Thương hiệu', value: 'Denta-Max' },
      { label: 'Công nghệ', value: 'U.S.A' }
    ],
    benefits: [
      'Khắc phục vàng lá.',
      'Hạn chế cháy lá.',
      'Cung cấp Ca, Mg, B, Zn, Cu, Fe.'
    ],
    usage: [
      'Bón gốc hoặc hòa nước tưới.'
    ],
    isHot: true,
    stockStatus: 'in-stock',
    rating: 4.8,
    reviewsCount: 20
  }
];
