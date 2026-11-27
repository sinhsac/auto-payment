export interface CatalogCategory {
  catid: number
  display_name: string
  description: string
}

export interface CatalogProduct {
  item: {
    item_id: number
    shop_id: number
    title: string
    price: number // stored in Shopee x100000 format for full compatibility with existing ES data
    description: string
    categories: { catid: number }[]
  }
  product_images: {
    images: string[]
    directUrl?: string
  }
  product_review: {
    historical_sold: number
    rating?: number
  }
}

function makeProductSvg(label: string, bg1: string, bg2: string, icon: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" rx="24" fill="url(#g)"/>
    <circle cx="200" cy="165" r="72" fill="rgba(255,255,255,0.16)"/>
    <text x="200" y="185" font-size="64" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif">${icon}</text>
    <text x="200" y="295" font-size="22" font-weight="700" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif">${label}</text>
    <text x="200" y="330" font-size="14" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Segoe UI, Arial, sans-serif">Auto Payment Store</text>
  </svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export const DEMO_CATEGORIES: CatalogCategory[] = [
  { catid: 101935, display_name: 'Thiết bị công nghệ', description: 'Phụ kiện máy tính, bàn phím, chuột và thiết bị làm việc' },
  { catid: 101936, display_name: 'Phần mềm & Tài khoản số', description: 'Gói bản quyền, công cụ tự động hóa và dịch vụ số' },
  { catid: 101937, display_name: 'Nhà thông minh IoT', description: 'Cảm biến, ổ cắm thông minh và phụ kiện Smart Home' },
  { catid: 101938, display_name: 'Phụ kiện di động', description: 'Cáp sạc nhanh, pin dự phòng và phụ kiện điện thoại' },
]

export const DEMO_PRODUCTS: CatalogProduct[] = [
  {
    item: {
      item_id: 900101,
      shop_id: 1001,
      title: 'Bàn phím cơ không dây 75% Hot-Swap RGB',
      price: 1290000 * 100000,
      description: 'Kết nối 3 chế độ Bluetooth 5.1 / 2.4GHz / Type-C, switch êm ái, pin 4000mAh.',
      categories: [{ catid: 101935 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('Mechanical Keyboard', '#0f172a', '#2563eb', '⌨') },
    product_review: { historical_sold: 1420, rating: 4.9 },
  },
  {
    item: {
      item_id: 900102,
      shop_id: 1001,
      title: 'Chuột công thái học Silent Wireless 4000 DPI',
      price: 490000 * 100000,
      description: 'Thiết kế chống mỏi cổ tay, click siêu êm, hỗ trợ chuyển đổi 3 thiết bị.',
      categories: [{ catid: 101935 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('Ergonomic Mouse', '#1e293b', '#0d9488', '🖱') },
    product_review: { historical_sold: 2850, rating: 4.8 },
  },
  {
    item: {
      item_id: 900103,
      shop_id: 1001,
      title: 'Hub chuyển đổi USB-C 8-in-1 HDMI 4K & PD 100W',
      price: 650000 * 100000,
      description: 'Vỏ nhôm nguyên khối, cổng LAN Gigabit, đầu đọc thẻ SD/TF tốc độ cao.',
      categories: [{ catid: 101935 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('USB-C Hub 8-in-1', '#312e81', '#6366f1', '⚡') },
    product_review: { historical_sold: 980, rating: 4.9 },
  },
  {
    item: {
      item_id: 900104,
      shop_id: 1001,
      title: 'Giá đỡ Laptop nhôm tản nhiệt xoay 360 độ',
      price: 320000 * 100000,
      description: 'Chịu tải đến 10kg, phù hợp laptop 11-17 inch, gập gọn dễ mang theo.',
      categories: [{ catid: 101935 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('Laptop Stand 360', '#334155', '#0284c7', '💻') },
    product_review: { historical_sold: 3210, rating: 4.9 },
  },
  {
    item: {
      item_id: 900201,
      shop_id: 1002,
      title: 'Gói Cloud Backup 1TB (12 tháng)',
      price: 299000 * 100000,
      description: 'Kích hoạt tự động ngay sau khi thanh toán VietQR thành công.',
      categories: [{ catid: 101936 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('Cloud Backup 1TB', '#064e3b', '#10b981', '☁') },
    product_review: { historical_sold: 640, rating: 5.0 },
  },
  {
    item: {
      item_id: 900202,
      shop_id: 1002,
      title: 'Gói Webhook API Pro — Không giới hạn giao dịch',
      price: 199000 * 100000,
      description: 'Đồng bộ giao dịch ngân hàng realtime qua Android Notification Listener.',
      categories: [{ catid: 101936 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('Webhook API Pro', '#1e1b4b', '#7c3aed', '🔗') },
    product_review: { historical_sold: 415, rating: 4.9 },
  },
  {
    item: {
      item_id: 900203,
      shop_id: 1002,
      title: 'Ebook: Thiết kế hệ thống thanh toán tự động',
      price: 50000 * 100000,
      description: 'Tài liệu thực chiến VietQR, Webhook, Idempotency & SSE (giá nhỏ dễ test QR!).',
      categories: [{ catid: 101936 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('Payment Ebook', '#7c2d12', '#ea580c', '📘') },
    product_review: { historical_sold: 1890, rating: 5.0 },
  },
  {
    item: {
      item_id: 900301,
      shop_id: 1003,
      title: 'Ổ cắm thông minh Wi-Fi đo điện năng tiêu thụ',
      price: 185000 * 100000,
      description: 'Hẹn giờ bật tắt từ xa, theo dõi kWh trực quan, hỗ trợ Home Assistant.',
      categories: [{ catid: 101937 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('Smart Wi-Fi Plug', '#14532d', '#16a34a', '🔌') },
    product_review: { historical_sold: 2150, rating: 4.8 },
  },
  {
    item: {
      item_id: 900302,
      shop_id: 1003,
      title: 'Cảm biến nhiệt độ & độ ẩm Zigbee màn hình E-Ink',
      price: 245000 * 100000,
      description: 'Màn hình sắc nét, pin dùng trên 1 năm, tích hợp kịch bản tự động hóa.',
      categories: [{ catid: 101937 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('Zigbee Sensor', '#134e4a', '#14b8a6', '🌡') },
    product_review: { historical_sold: 870, rating: 4.9 },
  },
  {
    item: {
      item_id: 900401,
      shop_id: 1004,
      title: 'Củ sạc nhanh GaN 65W 3 cổng (2C + 1A)',
      price: 390000 * 100000,
      description: 'Nhỏ gọn, sạc đồng thời laptop và điện thoại, bảo vệ quá nhiệt đa lớp.',
      categories: [{ catid: 101938 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('GaN 65W Charger', '#4c1d95', '#ec4899', '🔋') },
    product_review: { historical_sold: 4520, rating: 4.9 },
  },
  {
    item: {
      item_id: 900402,
      shop_id: 1004,
      title: 'Cáp sạc nhanh Type-C to C 100W bọc dù 2m',
      price: 95000 * 100000,
      description: 'Chip E-Marker an toàn, đầu hợp kim kẽm bền bỉ, chống đứt gãy.',
      categories: [{ catid: 101938 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('USB-C 100W Cable', '#1e3a8a', '#3b82f6', '🔌') },
    product_review: { historical_sold: 6120, rating: 4.8 },
  },
  {
    item: {
      item_id: 900403,
      shop_id: 1004,
      title: 'Pin dự phòng 20.000mAh PD 30W màn hình LED',
      price: 540000 * 100000,
      description: 'Sạc nhanh 2 chiều, hiển thị phần trăm pin chính xác, an toàn mang lên máy bay.',
      categories: [{ catid: 101938 }],
    },
    product_images: { images: [], directUrl: makeProductSvg('Powerbank 20000', '#3f3f46', '#f59e0b', '⚡') },
    product_review: { historical_sold: 1730, rating: 4.9 },
  },
]

export function getDemoCategoryById(id: number): CatalogCategory | null {
  return DEMO_CATEGORIES.find((c) => c.catid === id) || null
}

export function queryDemoProducts(options: { category?: number | null; q?: string }): CatalogProduct[] {
  let list = DEMO_PRODUCTS
  if (options.category && Number.isFinite(options.category)) {
    const filtered = list.filter((p) => p.item.categories.some((c) => c.catid === options.category))
    if (filtered.length > 0) {
      list = filtered
    }
  }
  if (options.q && options.q.trim()) {
    const needle = options.q.trim().toLowerCase()
    list = list.filter(
      (p) =>
        p.item.title.toLowerCase().includes(needle) ||
        p.item.description.toLowerCase().includes(needle)
    )
  }
  return list
}
