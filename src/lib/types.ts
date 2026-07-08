export type CategorySlug =
  | "women"
  | "men"
  | "wellness"
  | "perfumes"
  | "turaren-wuta";

export type IconName =
  | "leaf"
  | "droplet"
  | "shield"
  | "sparkles"
  | "heart"
  | "bottle"
  | "jar"
  | "dumbbell"
  | "cart"
  | "truck"
  | "headset"
  | "globe"
  | "flame"
  | "grid"
  | "box"
  | "chat"
  | "gear"
  | "logout"
  | "search"
  | "plus"
  | "trash"
  | "pencil"
  | "close"
  | "check"
  | "clock"
  | "chevronDown"
  | "chevronLeft"
  | "chevronRight"
  | "alertTriangle"
  | "user"
  | "mail"
  | "mapPin"
  | "creditCard"
  | "upload"
  | "menu"
  | "trend";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  icon: IconName;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategorySlug;
  price: number;
  costPrice?: number;
  compareAtPrice?: number;
  shortDescription: string;
  description: string;
  tags: string[];
  icon: IconName;
  imageUrls: string[];
  stock: number;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  createdAt: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "failed";

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  price: number;
  costPrice: number | null;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  trackingNumber: string | null;
  courier: string | null;
  adminNotes: string | null;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  status: string;
  note: string | null;
  createdAt: string;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenueToday: number;
  revenueMonth: number;
  revenueTotal: number;
  profitToday: number;
  profitMonth: number;
  profitTotal: number;
}

export interface ProductStats {
  totalProducts: number;
  inventoryValue: number;
  lowStock: number;
  outOfStock: number;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type AdminRole = "admin" | "customer";

export interface AdminProfile {
  id: string;
  role: AdminRole;
  fullName: string | null;
}
