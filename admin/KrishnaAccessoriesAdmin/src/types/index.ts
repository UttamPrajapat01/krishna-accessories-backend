export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  price: number;
  mrp: number;
  discount: number;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  mainImageUrl?: string;
  imageUrls: string[];
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddressSnapshot: string;
  subTotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantityAvailable: number;
  quantityReserved: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  lastRestockedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minimumOrderAmount: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  lowStockProductsCount: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}
