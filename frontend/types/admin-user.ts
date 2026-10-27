// ==================== USER TYPES ====================

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  role: UserRole;
  status?: UserStatus;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'CUSTOMER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'PENDING';

// User creation/registration data
export interface UserRegistrationDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  role?: UserRole;
}

// User update data
export interface UserUpdateDTO {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  address?: string;
  role?: UserRole;
  status?: UserStatus;
}

// User response from API
export interface UserResponseDTO {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  role: UserRole;
  status?: UserStatus;
  created_at: string;
  updated_at: string;
}

// Login request
export interface LoginRequestDTO {
  email: string;
  password: string;
}

// User profile data
export interface UserProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// User preferences
export interface UserPreferences {
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
}

// ==================== ORDER TYPES ====================

export interface Order {
  id: number;
  order_number?: string;
  user_id: number;
  total_amount: number;
  status: OrderStatus;
  order_type: OrderType;
  delivery_address: string;
  phone_number: string;
  customer_name?: string;
  special_instructions?: string;
  estimated_delivery_time?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PREPARING' 
  | 'READY' 
  | 'DISPATCHED' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type OrderType = 'DELIVERY' | 'PICKUP' | 'DINE_IN';

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions?: string;
  created_at: string;
}

// Order summary for user
export interface UserOrderSummary {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  favoriteItems?: string[];
  lastOrderDate?: string;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationInfo;
  errors?: Record<string, string[]>;
  error?: any;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
}

// ==================== ADMIN TYPES ====================

// Admin user management filters
export interface UserFilters {
  page?: number;
  limit?: number;
  role?: 'all' | UserRole;
  status?: 'all' | UserStatus;
  search?: string;
  sortBy?: UserSortField;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export type UserSortField = 
  | 'created_at' 
  | 'updated_at' 
  | 'email' 
  | 'first_name' 
  | 'last_name' 
  | 'role' 
  | 'status';

// Block user request
export interface BlockUserRequest {
  userId: number;
  status: UserStatus;
  reason?: string;
  blockedBy?: number;
  blockedAt?: string;
}

// User action log
export interface UserActionLog {
  log_id: number;
  user_id: number;
  admin_id: number;
  action: UserAction;
  previous_value?: string;
  new_value?: string;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export type UserAction = 
  | 'USER_CREATED'
  | 'USER_UPDATED' 
  | 'USER_BLOCKED' 
  | 'USER_UNBLOCKED'
  | 'USER_SUSPENDED'
  | 'USER_DELETED'
  | 'ROLE_CHANGED'
  | 'PASSWORD_RESET'
  | 'LOGIN_FAILED'
  | 'LOGIN_SUCCESS';

// ==================== STATISTICS TYPES ====================

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  adminUsers: number;
  staffUsers: number;
  customerUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  newUsersThisYear: number;
  userGrowthRate: number;
  averageOrdersPerUser: number;
  averageSpendingPerUser: number;
}

export interface UserAnalytics {
  usersByRole: Record<UserRole, number>;
  usersByStatus: Record<UserStatus, number>;
  userGrowthOverTime: { date: string; count: number }[];
  topCustomersBySpending: { user: User; totalSpent: number; orderCount: number }[];
  userActivityByMonth: { month: string; activeUsers: number; newUsers: number }[];
  userRetentionRate: number;
  averageSessionDuration: number;
}

// ==================== FORM TYPES ====================

// User form data
export interface UserFormData {
  email: string;
  password?: string;
  confirmPassword?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  role: UserRole;
  status?: UserStatus;
  sendWelcomeEmail?: boolean;
  requirePasswordChange?: boolean;
}

// User search form
export interface UserSearchForm {
  searchTerm: string;
  role: 'all' | UserRole;
  status: 'all' | UserStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy: UserSortField;
  sortOrder: 'asc' | 'desc';
}

// Bulk action form
export interface BulkActionForm {
  userIds: number[];
  action: 'block' | 'unblock' | 'suspend' | 'activate' | 'delete';
  reason?: string;
  sendNotification?: boolean;
}

// ==================== COMPONENT PROP TYPES ====================

// User table props
export interface UserTableProps {
  users: User[];
  loading?: boolean;
  onUserSelect?: (user: User) => void;
  onUserStatusChange?: (userId: number, newStatus: UserStatus) => void;
  onViewUserInfo?: (user: User) => void;
  onViewUserOrders?: (user: User) => void;
  selectedUsers?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
  sortBy?: UserSortField;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: UserSortField, order: 'asc' | 'desc') => void;
}

// User card props
export interface UserCardProps {
  user: User;
  showActions?: boolean;
  onStatusChange?: (userId: number, newStatus: UserStatus) => void;
  onViewDetails?: (user: User) => void;
  onEdit?: (user: User) => void;
  className?: string;
}

// User modal props
export interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'view' | 'edit';
  onSave?: (updatedUser: User) => void;
}

// User status badge props
export interface UserStatusBadgeProps {
  status: UserStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'subtle';
  showIcon?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

// ==================== UTILITY TYPES ====================

// User display name
export interface UserDisplayInfo {
  fullName: string;
  initials: string;
  displayEmail: string;
  roleLabel: string;
  statusLabel: string;
  avatarUrl?: string;
}

// User permissions
export interface UserPermissions {
  canViewUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canBlockUsers: boolean;
  canChangeRoles: boolean;
  canViewOrders: boolean;
  canExportData: boolean;
  canViewAnalytics: boolean;
}

// User activity
export interface UserActivity {
  user_id: number;
  activity_type: 'login' | 'logout' | 'order_placed' | 'profile_updated' | 'password_changed';
  description: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ==================== VALIDATION TYPES ====================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface UserValidationRules {
  email: ValidationRule[];
  password: ValidationRule[];
  first_name: ValidationRule[];
  last_name: ValidationRule[];
  phone_number: ValidationRule[];
  role: ValidationRule[];
}

// Form validation errors
export interface FormErrors {
  [key: string]: string | undefined;
}

// ==================== EXPORT TYPES ====================

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  fields: (keyof User)[];
  filters?: UserFilters;
  includeOrders?: boolean;
  includeStats?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: string | Blob;
  filename: string;
  message: string;
}

// ==================== BULK OPERATION TYPES ====================

export interface BulkOperationResult {
  success: User[];
  failed: {
    userId: number;
    user?: User;
    error: string;
    errorCode?: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}

export interface BulkOperationProgress {
  total: number;
  completed: number;
  current?: User;
  errors: string[];
  isRunning: boolean;
}