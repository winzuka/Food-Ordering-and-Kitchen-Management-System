import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getAuthToken, logout, getUser } from '../utils/auth';
import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  MenuItem, 
  Category, 
  Order, 
  OrderStatus,
  ApiResponse,
  LoginResponse 
} from '../types';

const API_BASE_URL = 'http://localhost';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

// User Service APIs (Port: 8081)
export const userService = {
  login: (credentials: LoginCredentials): Promise<AxiosResponse<LoginResponse>> => 
    api.post('http://localhost:8081/api/auth/login', credentials),
  
  register: (userData: RegisterData): Promise<AxiosResponse<User>> => 
    api.post('http://localhost:8081/api/auth/register', userData),
  
  // Updated to include userId parameter for backend compatibility
  getProfile: (): Promise<AxiosResponse<User>> => {
    const user = getUser();
    if (!user || !user.id) {
      return Promise.reject(new Error('User not found. Please log in again.'));
    }
    return api.get(`http://localhost:8081/api/users/profile?userId=${user.id}`);
  },
  
  // Updated to include userId parameter for backend compatibility
  updateProfile: (userData: Partial<User>): Promise<AxiosResponse<User>> => {
    const user = getUser();
    if (!user || !user.id) {
      return Promise.reject(new Error('User not found. Please log in again.'));
    }
    return api.put(`http://localhost:8081/api/users/profile?userId=${user.id}`, userData);
  },

  // Get user by ID (admin function)
  getUserById: (id: number): Promise<AxiosResponse<User>> => 
    api.get(`http://localhost:8081/api/users/${id}`),

  // Additional user management functions
  getAllUsers: (): Promise<AxiosResponse<User[]>> => 
    api.get('http://localhost:8081/api/users'),

  // Delete user (admin function)
  deleteUser: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`http://localhost:8081/api/users/${id}`),

  // Update user role (admin function)
  updateUserRole: (id: number, role: 'CUSTOMER' | 'ADMIN'): Promise<AxiosResponse<User>> => 
    api.put(`http://localhost:8081/api/users/${id}/role`, { role }),
};

// Menu Service APIs (Port: 8082)
export const menuService = {
  // Get all menu items
  getMenuItems: (): Promise<AxiosResponse<MenuItem[]>> => 
    api.get('http://localhost:8082/api/menu/items'),
  
  // Get categories
  getCategories: (): Promise<AxiosResponse<string[]>> => 
    api.get('http://localhost:8082/api/menu/categories'),
  
  // Get menu item by ID
  getMenuItemById: (id: number): Promise<AxiosResponse<MenuItem>> => 
    api.get(`http://localhost:8082/api/menu/items/${id}`),
  
  // Create new menu item (Admin only)
  createMenuItem: (itemData: Partial<MenuItem>): Promise<AxiosResponse<MenuItem>> => 
    api.post('http://localhost:8082/api/menu/items', itemData),
  
  // Update menu item (Admin only)
  updateMenuItem: (id: number, itemData: Partial<MenuItem>): Promise<AxiosResponse<MenuItem>> => 
    api.put(`http://localhost:8082/api/menu/items/${id}`, itemData),
  
  // Delete menu item (Admin only)
  deleteMenuItem: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`http://localhost:8082/api/menu/items/${id}`),
  
  // Search menu items
  searchMenuItems: (name: string): Promise<AxiosResponse<MenuItem[]>> => 
    api.get(`http://localhost:8082/api/menu/items/search?name=${encodeURIComponent(name)}`),
  
  // Get items by category
  getMenuItemsByCategory: (category: string): Promise<AxiosResponse<MenuItem[]>> => 
    api.get(`http://localhost:8082/api/menu/items/category/${encodeURIComponent(category)}`),
  
  // Health check
  getHealth: (): Promise<AxiosResponse<string>> => 
    api.get('http://localhost:8082/api/menu/health'),
};

// Order Service APIs (Port: 8083)
interface CreateOrderData {
  userId: number;
  orderItems: Array<{
    menuItemId: number;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryAddress: string;
}

export const orderService = {
  // Basic order operations
  createOrder: (orderData: CreateOrderData): Promise<AxiosResponse<Order>> => 
    api.post('http://localhost:8083/api/orders', orderData),
  
  getUserOrders: (userId: number): Promise<AxiosResponse<Order[]>> => 
    api.get(`http://localhost:8083/api/orders/user/${userId}`),
  
  // Get current user's orders
  getMyOrders: (): Promise<AxiosResponse<Order[]>> => {
    const user = getUser();
    if (!user || !user.id) {
      return Promise.reject(new Error('User not found. Please log in again.'));
    }
    return api.get(`http://localhost:8083/api/orders/user/${user.id}`);
  },
  
  getAllOrders: (): Promise<AxiosResponse<Order[]>> => 
    api.get('http://localhost:8083/api/orders'),
  
  getOrderById: (orderId: number): Promise<AxiosResponse<Order>> => 
    api.get(`http://localhost:8083/api/orders/${orderId}`),
  
  deleteOrder: (orderId: number): Promise<AxiosResponse<void>> => 
    api.delete(`http://localhost:8083/api/orders/${orderId}`),
  
  // Admin order management functions
  updateOrderStatus: (orderId: number, status: OrderStatus): Promise<AxiosResponse<Order>> => 
    api.put(`http://localhost:8083/api/orders/${orderId}/status`, { status }),
  
  // Get orders by status (useful for filtering)
  getOrdersByStatus: (status: OrderStatus): Promise<AxiosResponse<Order[]>> => 
    api.get(`http://localhost:8083/api/orders/status/${status}`),
  
  // Get recent orders (useful for dashboard)
  getRecentOrders: (limit: number = 10): Promise<AxiosResponse<Order[]>> => 
    api.get(`http://localhost:8083/api/orders/recent?limit=${limit}`),
  
  // Get orders by date range (useful for analytics)
  getOrdersByDateRange: (startDate: string, endDate: string): Promise<AxiosResponse<Order[]>> => 
    api.get(`http://localhost:8083/api/orders/date-range?start=${startDate}&end=${endDate}`),
  
  // Get order statistics (useful for dashboard)
  getOrderStatistics: (): Promise<AxiosResponse<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    todayOrders: number;
  }>> => 
    api.get('http://localhost:8083/api/orders/statistics'),
  
  // Bulk update order statuses (useful for admin operations)
  bulkUpdateOrderStatus: (orderIds: number[], status: OrderStatus): Promise<AxiosResponse<Order[]>> => 
    api.put('http://localhost:8083/api/orders/bulk-status', { orderIds, status }),

  // Cancel order (customer function)
  cancelOrder: (orderId: number): Promise<AxiosResponse<Order>> => 
    api.put(`http://localhost:8083/api/orders/${orderId}/cancel`),
};

// Analytics Service (if you have analytics endpoints)
export const analyticsService = {
  // Get sales analytics
  getSalesAnalytics: (period: 'daily' | 'weekly' | 'monthly'): Promise<AxiosResponse<any>> => 
    api.get(`http://localhost:8083/api/analytics/sales?period=${period}`),
  
  // Get popular menu items
  getPopularMenuItems: (limit: number = 10): Promise<AxiosResponse<any[]>> => 
    api.get(`http://localhost:8083/api/analytics/popular-items?limit=${limit}`),
  
  // Get customer analytics
  getCustomerAnalytics: (): Promise<AxiosResponse<any>> => 
    api.get('http://localhost:8083/api/analytics/customers'),

  // Get revenue analytics
  getRevenueAnalytics: (startDate: string, endDate: string): Promise<AxiosResponse<any>> => 
    api.get(`http://localhost:8083/api/analytics/revenue?start=${startDate}&end=${endDate}`),

  // Get order trends
  getOrderTrends: (period: 'daily' | 'weekly' | 'monthly'): Promise<AxiosResponse<any>> => 
    api.get(`http://localhost:8083/api/analytics/trends?period=${period}`),
};

// Utility functions for API calls
export const apiUtils = {
  // Handle API errors
  handleApiError: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.response?.status === 401) {
      return 'Session expired. Please log in again.';
    } else if (error.response?.status === 403) {
      return 'Access denied. You do not have permission to perform this action.';
    } else if (error.response?.status === 404) {
      return 'Resource not found.';
    } else if (error.response?.status >= 500) {
      return 'Server error. Please try again later.';
    } else if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  },

  // Check if user is authenticated for API calls
  requireAuth: (): boolean => {
    const token = getAuthToken();
    const user = getUser();
    return !!(token && user);
  },

  // Get current user ID for API calls
  getCurrentUserId: (): number => {
    const user = getUser();
    if (!user || !user.id) {
      throw new Error('User not found. Please log in again.');
    }
    return user.id;
  },
};

export default api;