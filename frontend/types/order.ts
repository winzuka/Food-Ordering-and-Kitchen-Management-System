// ==================== ORDER TYPES ====================

export interface Order {
  id: number;
  order_number?: string;
  user_id: number;
  total_amount: number;
  status: OrderStatus;
  order_type: OrderType;
  order_date: string;
  delivery_address: string;
  phone_number: string;
  customer_name?: string;
  customer_notes?: string;
  special_instructions?: string;
  estimated_delivery_time?: string;
  estimated_ready_time?: string;
  completed_at?: string;
  staff_id?: number;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

// Order status enum matching your backend
export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'COMPLETED' 
  | 'CANCELLED';

// Order type enum matching your backend
export type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN' | 'TAKEAWAY';

// ==================== ORDER ITEM TYPES ====================

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  item_id: number;
  menu_item_id: number;
  item_name: string;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  subtotal: number;
  special_instructions?: string;
  created_at: string;
}

// ==================== ORDER REQUEST/RESPONSE TYPES ====================

// Order creation request
export interface OrderRequestDTO {
  user_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  customer_notes?: string;
  order_type: OrderType;
  order_items: OrderItemRequestDTO[];
}

// Order item in request
export interface OrderItemRequestDTO {
  item_id: number;
  menu_item_id: number;
  quantity: number;
  special_instructions?: string;
}

// Order response from API
export interface OrderResponseDTO {
  id: number;
  order_number: string;
  user_id: number;
  total_amount: number;
  status: OrderStatus;
  order_type: OrderType;
  delivery_address: string;
  phone_number: string;
  customer_name: string;
  customer_notes?: string;
  estimated_delivery_time?: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItemResponseDTO[];
}

// Order item in response
export interface OrderItemResponseDTO {
  order_item_id: number;
  order_id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  created_at: string;
}

// ==================== ORDER HISTORY TYPES ====================

export interface OrderStatusHistory {
  history_id: number;
  order_id: number;
  old_status?: OrderStatus;
  new_status: OrderStatus;
  changed_by?: number;
  notes?: string;
  changed_at: string;
}

// ==================== ORDER SUMMARY TYPES ====================

export interface OrderSummary {
  order_id: number;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: OrderStatus;
  order_type: OrderType;
  item_count: number;
  order_date: string;
  estimated_delivery_time?: string;
}

// User's order statistics
export interface UserOrderStats {
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  completed_orders: number;
  cancelled_orders: number;
  pending_orders: number;
  favorite_items: string[];
  last_order_date?: string;
  first_order_date?: string;
}

// ==================== ORDER FILTERS AND SEARCH ====================

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: 'all' | OrderStatus;
  order_type?: 'all' | OrderType;
  date_from?: string;
  date_to?: string;
  customer_name?: string;
  order_number?: string;
  user_id?: number;
  staff_id?: number;
  min_amount?: number;
  max_amount?: number;
  sort_by?: OrderSortField;
  sort_order?: 'asc' | 'desc';
}

export type OrderSortField = 
  | 'created_at'
  | 'updated_at' 
  | 'total_amount'
  | 'status'
  | 'order_type'
  | 'customer_name'
  | 'estimated_delivery_time';

// ==================== ORDER ANALYTICS TYPES ====================

export interface OrderAnalytics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  orders_by_status: Record<OrderStatus, number>;
  orders_by_type: Record<OrderType, number>;
  revenue_by_day: { date: string; revenue: number; orders: number }[];
  popular_items: {
    item_id: number;
    item_name: string;
    order_count: number;
    total_quantity: number;
    total_revenue: number;
  }[];
  peak_hours: { hour: number; order_count: number }[];
  customer_metrics: {
    new_customers: number;
    returning_customers: number;
    customer_retention_rate: number;
  };
}

export interface DailyOrderMetrics {
  date: string;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  completed_orders: number;
  cancelled_orders: number;
  peak_hour: number;
  popular_items: string[];
}

// ==================== ORDER TRACKING TYPES ====================

export interface OrderTracking {
  order_id: number;
  order_number: string;
  current_status: OrderStatus;
  status_history: OrderTrackingStep[];
  estimated_completion: string;
  delivery_info?: DeliveryInfo;
}

export interface OrderTrackingStep {
  status: OrderStatus;
  timestamp: string;
  description: string;
  staff_member?: string;
  notes?: string;
}

export interface DeliveryInfo {
  driver_name?: string;
  driver_phone?: string;
  vehicle_info?: string;
  estimated_arrival: string;
  tracking_url?: string;
  delivery_coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// ==================== PAYMENT TYPES ====================

export interface PaymentInfo {
  payment_id: number;
  order_id: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount: number;
  currency: string;
  transaction_id?: string;
  payment_date: string;
  refund_amount?: number;
  refund_date?: string;
}

export type PaymentMethod = 
  | 'CASH' 
  | 'CARD' 
  | 'DIGITAL_WALLET' 
  | 'BANK_TRANSFER' 
  | 'ONLINE';

export type PaymentStatus = 
  | 'PENDING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED';

// ==================== COMPONENT PROP TYPES ====================

// Order table props
export interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  onOrderSelect?: (order: Order) => void;
  onStatusChange?: (orderId: number, newStatus: OrderStatus) => void;
  onViewDetails?: (order: Order) => void;
  selectedOrders?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
  sortBy?: OrderSortField;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: OrderSortField, order: 'asc' | 'desc') => void;
  showActions?: boolean;
  compact?: boolean;
}

// Order card props
export interface OrderCardProps {
  order: Order;
  showActions?: boolean;
  showCustomer?: boolean;
  onStatusChange?: (orderId: number, newStatus: OrderStatus) => void;
  onViewDetails?: (order: Order) => void;
  onClick?: (order: Order) => void;
  className?: string;
}

// Order modal props
export interface OrderModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'view' | 'edit';
  onSave?: (updatedOrder: Order) => void;
  showCustomerInfo?: boolean;
  showOrderItems?: boolean;
}

// Order status badge props
export interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'subtle';
  showIcon?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

// ==================== FORM TYPES ====================

// Order search form
export interface OrderSearchForm {
  search_term: string;
  status: 'all' | OrderStatus;
  order_type: 'all' | OrderType;
  date_from?: string;
  date_to?: string;
  sort_by: OrderSortField;
  sort_order: 'asc' | 'desc';
}

// Order status update form
export interface OrderStatusUpdateForm {
  order_id: number;
  new_status: OrderStatus;
  notes?: string;
  estimated_time?: string;
  notify_customer?: boolean;
}

// ==================== API RESPONSE TYPES ====================

export interface OrderApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
  error?: any;
}

// ==================== EXPORT TYPES ====================

export interface OrderExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields: (keyof Order)[];
  filters?: OrderFilters;
  include_items?: boolean;
  include_customer_info?: boolean;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface OrderExportResult {
  success: boolean;
  data?: string | Blob;
  filename: string;
  message: string;
  record_count?: number;
}

// ==================== BULK OPERATION TYPES ====================

export interface BulkOrderOperation {
  order_ids: number[];
  action: 'update_status' | 'cancel' | 'export' | 'assign_staff';
  parameters?: {
    new_status?: OrderStatus;
    staff_id?: number;
    reason?: string;
    notify_customers?: boolean;
  };
}

export interface BulkOrderResult {
  success: Order[];
  failed: {
    order_id: number;
    order?: Order;
    error: string;
    error_code?: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}

// ==================== NOTIFICATION TYPES ====================

export interface OrderNotification {
  notification_id: number;
  order_id: number;
  user_id: number;
  type: OrderNotificationType;
  title: string;
  message: string;
  sent_at: string;
  read_at?: string;
  delivery_method: 'email' | 'sms' | 'push' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

export type OrderNotificationType = 
  | 'order_confirmed'
  | 'order_preparing' 
  | 'order_ready'
  | 'order_dispatched'
  | 'order_delivered'
  | 'order_cancelled'
  | 'payment_received'
  | 'refund_processed';

// ==================== MENU ITEM TYPES (for order items) ====================

export interface MenuItem {
  item_id: number;
  category_id: number;
  item_name: string;
  description?: string;
  price: number;
  is_available: boolean;
  image_url?: string;
  preparation_time?: number;
  ingredients?: string;
  dietary_info?: string;
  calories?: number;
  spice_level?: number;
  is_featured?: boolean;
}

// ==================== KITCHEN DISPLAY TYPES ====================

export interface KitchenOrder {
  order_id: number;
  order_number: string;
  customer_name: string;
  order_type: OrderType;
  status: OrderStatus;
  items: KitchenOrderItem[];
  special_instructions?: string;
  estimated_ready_time: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  preparation_time: number;
  created_at: string;
}

export interface KitchenOrderItem {
  item_name: string;
  quantity: number;
  special_instructions?: string;
  preparation_time: number;
  status: 'pending' | 'preparing' | 'ready';
}

// ==================== RECEIPT TYPES ====================

export interface OrderReceipt {
  order_id: number;
  order_number: string;
  customer_info: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  order_info: {
    order_date: string;
    order_type: OrderType;
    status: OrderStatus;
  };
  items: ReceiptItem[];
  pricing: {
    subtotal: number;
    tax_amount?: number;
    delivery_fee?: number;
    discount_amount?: number;
    total_amount: number;
  };
  payment_info?: {
    method: PaymentMethod;
    status: PaymentStatus;
    transaction_id?: string;
  };
  restaurant_info: {
    name: string;
    address: string;
    phone: string;
    email?: string;
  };
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
}

// ==================== VALIDATION TYPES ====================

export interface OrderValidationRules {
  min_order_amount: number;
  max_order_amount: number;
  max_items_per_order: number;
  required_fields: (keyof OrderRequestDTO)[];
  delivery_areas: string[];
  operating_hours: {
    open: string;
    close: string;
    days: number[];
  };
}

export interface OrderValidationResult {
  is_valid: boolean;
  errors: {
    field: string;
    message: string;
    code: string;
  }[];
  warnings?: {
    field: string;
    message: string;
  }[];
}