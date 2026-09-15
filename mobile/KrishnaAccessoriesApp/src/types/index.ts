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

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImageUrl?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  availableStock: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subTotal: number;
  estimatedTax: number;
  estimatedShipping: number;
  totalAmount: number;
  itemCount: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  mrp: number;
  discount: number;
  imageUrl?: string;
  stockQuantity: number;
  inStock: boolean;
}

export interface Wishlist {
  id: string;
  items: WishlistItem[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
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

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  dataJson?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}
