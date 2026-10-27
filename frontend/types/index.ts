// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'KITCHEN';
  phone?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role?: string;
}

// Menu Types
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

// Cart Types
export interface CartItem extends MenuItem {
  quantity: number;
}

// Order Types
export interface OrderItem {
  id?: number;
  menuItemId: number;
  menuItem?: MenuItem;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  userId: number;
  user?: User;
  orderItems: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: string;
  deliveryAddress: string;
  specialNote?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELED';

// Order Statistics Type (for admin dashboard)
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  todayOrders: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Component Props Types
export interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemove: (id: number) => void;
}

export interface OrderCardProps {
  order: Order;
  isAdmin?: boolean;
  isKitchen?: boolean;
  onStatusUpdate?: (orderId: number, status: OrderStatus) => void;
}

export interface LayoutProps {
  children: React.ReactNode;
}

// Admin Component Props Types
export interface AdminMenuTableProps {
  menuItems: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export interface AddMenuItemModalProps {
  onClose: () => void;
  onSave: (itemData: Partial<MenuItem>) => void;
}

export interface EditMenuItemModalProps {
  item: MenuItem;
  onClose: () => void;
  onSave: (itemData: Partial<MenuItem>) => void;
}

export interface DeleteConfirmModalProps {
  item: MenuItem;
  onClose: () => void;
  onConfirm: () => void;
}

// Admin Order Management Props Types
export interface AdminOrdersTableProps {
  orders: Order[];
  onStatusUpdate: (orderId: number, status: OrderStatus) => void;
  loading?: boolean;
}

export interface OrderStatusSummaryProps {
  orders: Order[];
}

// Analytics Types (for future use)
export interface SalesAnalytics {
  period: 'daily' | 'weekly' | 'monthly';
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface PopularMenuItem {
  menuItem: MenuItem;
  orderCount: number;
  revenue: number;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageOrdersPerCustomer: number;
}

// Utility Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Form Types
export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface DeliveryInfo {
  address: string;
  instructions?: string;
  estimatedTime?: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Filter Types
export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  userId?: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface MenuFilters {
  category?: string;
  available?: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
  searchTerm?: string;
}