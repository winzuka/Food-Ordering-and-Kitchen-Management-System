import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// Types
import { User } from '@/types/admin-user';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  error?: any;
}

interface BlockUserRequest {
  userId: number;
  status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'PENDING';
  reason?: string;
}

interface UserFilters {
  page?: number;
  limit?: number;
  role?: 'all' | 'CUSTOMER' | 'ADMIN';  // Updated to match your types
  status?: 'all' | 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'PENDING';  // Updated to include all statuses
  search?: string;
}

interface Order {
  id: number;
  order_number?: string;
  user_id: number;
  total_amount: number;
  status: string;
  order_type?: string;
  delivery_address: string;
  phone_number: string;
  customer_name?: string;
  special_instructions?: string;
  estimated_delivery_time?: string;
  created_at: string;
  updated_at: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  suspendedUsers: number;
  pendingUsers: number;
  adminUsers: number;
  customerUsers: number;  // Updated from staffUsers/customerUsers
  newUsersThisMonth: number;
  newUsersToday: number;
}

class AdminUserService {
  private userApiClient: AxiosInstance;
  private orderApiClient: AxiosInstance;

  constructor() {
    // Direct API client for User Service (port 8081)
    this.userApiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8081',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Direct API client for Order Service (port 8083)
    this.orderApiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8083',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for authentication (User Service)
    this.userApiClient.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`📤 User Service Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling (User Service)
    this.userApiClient.interceptors.response.use(
      (response) => {
        console.log(`📥 User Service Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ User Service Error:', error.response?.status, error.response?.data || error.message);
        this.handleApiError(error, 'User Service');
        return Promise.reject(error);
      }
    );

    // Setup order API client interceptors
    this.orderApiClient.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`📤 Order Service Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.orderApiClient.interceptors.response.use(
      (response) => {
        console.log(`📥 Order Service Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Order Service Error:', error.response?.status, error.response?.data || error.message);
        this.handleApiError(error, 'Order Service');
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || localStorage.getItem('auth-token');
    }
    return null;
  }

  private handleApiError(error: any, serviceName: string = 'API'): void {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          toast.error('Authentication required. Please login again.');
          // Redirect to login or clear auth
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth_user');
            window.location.href = '/auth/login';
          }
          break;
        case 403:
          toast.error('You do not have permission to perform this action.');
          break;
        case 404:
          toast.error(`${serviceName}: Resource not found. Please check if the service is running.`);
          break;
        case 500:
          toast.error(`${serviceName}: Server error. Please try again later.`);
          break;
        case 503:
          toast.error(`${serviceName}: Service unavailable. Please check if the service is running.`);
          break;
        default:
          toast.error(data?.message || `${serviceName}: An unexpected error occurred.`);
      }
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      toast.error(`Cannot connect to ${serviceName}. Please check if the service is running on the correct port.`);
    } else {
      toast.error(`${serviceName}: An unexpected error occurred.`);
    }
  }

  // ==================== USER MANAGEMENT METHODS ====================

  /**
   * Get all users with optional filtering and pagination
   */
  async getAllUsers(filters: UserFilters = {}): Promise<ApiResponse<User[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.role && filters.role !== 'all') params.append('role', filters.role);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/api/users${queryString ? `?${queryString}` : ''}`;
      
      const response: AxiosResponse<any> = await this.userApiClient.get(url);
      
      // Handle different response formats from your User Service
      const users = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      return {
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        pagination: {
          currentPage: filters.page || 1,
          totalPages: Math.ceil(users.length / (filters.limit || 20)),
          totalItems: users.length,
          itemsPerPage: filters.limit || 20
        }
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get a single user by ID
   */
  async getUserById(userId: number): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<any> = await this.userApiClient.get(`/api/users/${userId}`);
      
      // Handle different response formats - your backend returns user directly
      const user = response.data;
      
      return {
        success: true,
        message: 'User retrieved successfully',
        data: user
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Update user status (block/unblock/suspend/etc.)
   */
  async updateUserStatus(
    userId: number, 
    status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'PENDING', 
    reason?: string
  ): Promise<ApiResponse<User>> {
    try {
      const requestData = {
        status,
        ...(reason && { reason })
      };

      const response: AxiosResponse<any> = await this.userApiClient.put(
        `/api/users/${userId}/status`,
        requestData
      );
      
      // Handle different response formats - your backend returns user directly
      const user = response.data;
      
      // Show success toast
      const statusActions = {
        'BLOCKED': 'blocked',
        'ACTIVE': 'activated',
        'SUSPENDED': 'suspended',
        'PENDING': 'set to pending'
      };
      
      const action = statusActions[status] || status.toLowerCase();
      toast.success(`User ${action} successfully`);

      return {
        success: true,
        message: `User ${action} successfully`,
        data: user
      };
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Create a new user (admin functionality)
   */
  async createUser(userData: Omit<User, 'user_id' | 'created_at' | 'updated_at'> & { password: string }): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<any> = await this.userApiClient.post('/api/users', userData);
      
      // Handle different response formats - your backend returns user directly
      const user = response.data;

      toast.success('User created successfully');
      
      return {
        success: true,
        message: 'User created successfully',
        data: user
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<any> = await this.userApiClient.put(`/api/users/${userId}`, userData);
      
      // Handle different response formats - your backend returns user directly
      const user = response.data;

      toast.success('User updated successfully');
      
      return {
        success: true,
        message: 'User updated successfully',
        data: user
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete a user (if needed)
   */
  async deleteUser(userId: number): Promise<ApiResponse<null>> {
    try {
      await this.userApiClient.delete(`/api/users/${userId}`);

      toast.success('User deleted successfully');
      
      return {
        success: true,
        message: 'User deleted successfully',
        data: null
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // ==================== ORDER MANAGEMENT METHODS ====================

  /**
   * Get orders for a specific user
   */
  async getUserOrders(userId: number, page = 1, limit = 20): Promise<ApiResponse<Order[]>> {
    try {
      // Try to get orders from Order Service directly
      const response: AxiosResponse<any> = await this.orderApiClient.get(
        `/api/orders/user/${userId}?page=${page}&limit=${limit}`
      );
      
      // Transform response to match our API format - handle direct array or wrapped response
      const orders = Array.isArray(response.data) ? response.data : response.data.data || [];
      
      return {
        success: true,
        message: 'User orders retrieved successfully',
        data: orders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(orders.length / limit),
          totalItems: orders.length,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      
      // Fallback: return empty array if order service is unavailable
      return {
        success: false,
        message: 'Failed to fetch user orders. Order service may be unavailable.',
        data: [],
        error: error
      };
    }
  }

  /**
   * Get order statistics for a user
   */
  async getUserOrderStats(userId: number): Promise<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    completedOrders: number;
  }> {
    try {
      const ordersResponse = await this.getUserOrders(userId, 1, 1000); // Get all orders
      const orders = ordersResponse.data;

      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const completedOrders = orders.filter(order => 
        order.status === 'COMPLETED' || order.status === 'DELIVERED'
      ).length;

      return {
        totalOrders,
        totalSpent,
        averageOrderValue,
        completedOrders
      };
    } catch (error) {
      console.error('Error calculating user order stats:', error);
      return {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        completedOrders: 0
      };
    }
  }

  // ==================== STATISTICS AND ANALYTICS ====================

  /**
   * Get user statistics for admin dashboard
   */
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await this.getAllUsers({ limit: 1000 }); // Get all users for stats
      const users = response.data;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const stats: UserStats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => (u.status || 'ACTIVE') === 'ACTIVE').length,
        blockedUsers: users.filter(u => u.status === 'BLOCKED').length,
        suspendedUsers: users.filter(u => u.status === 'SUSPENDED').length,
        pendingUsers: users.filter(u => u.status === 'PENDING').length,
        adminUsers: users.filter(u => u.role === 'ADMIN').length,
        customerUsers: users.filter(u => u.role === 'CUSTOMER').length,
        newUsersThisMonth: users.filter(u => new Date(u.created_at) >= startOfMonth).length,
        newUsersToday: users.filter(u => new Date(u.created_at) >= startOfDay).length,
      };

      return stats;
    } catch (error) {
      console.error('Error calculating user stats:', error);
      // Return default stats on error
      return {
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        suspendedUsers: 0,
        pendingUsers: 0,
        adminUsers: 0,
        customerUsers: 0,
        newUsersThisMonth: 0,
        newUsersToday: 0,
      };
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(searchTerm: string, filters: Omit<UserFilters, 'search'> = {}): Promise<ApiResponse<User[]>> {
    return this.getAllUsers({
      ...filters,
      search: searchTerm
    });
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'CUSTOMER' | 'ADMIN', page = 1, limit = 20): Promise<ApiResponse<User[]>> {
    return this.getAllUsers({
      role,
      page,
      limit
    });
  }

  /**
   * Get users by status
   */
  async getUsersByStatus(
    status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'PENDING', 
    page = 1, 
    limit = 20
  ): Promise<ApiResponse<User[]>> {
    return this.getAllUsers({
      status,
      page,
      limit
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if user service is available
   */
  async checkUserServiceHealth(): Promise<boolean> {
    try {
      await this.userApiClient.get('/api/users?limit=1');
      return true;
    } catch (error) {
      console.error('User service health check failed:', error);
      return false;
    }
  }

  /**
   * Check if order service is available
   */
  async checkOrderServiceHealth(): Promise<boolean> {
    try {
      await this.orderApiClient.get('/api/orders?limit=1');
      return true;
    } catch (error) {
      console.error('Order service health check failed:', error);
      return false;
    }
  }

  /**
   * Bulk update user status
   */
  async bulkUpdateUserStatus(
    userIds: number[], 
    status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'PENDING', 
    reason?: string
  ): Promise<{ success: User[]; failed: { userId: number; error: string }[] }> {
    const results = {
      success: [] as User[],
      failed: [] as { userId: number; error: string }[]
    };

    // Process users in parallel with limited concurrency
    const promises = userIds.map(async (userId) => {
      try {
        const response = await this.updateUserStatus(userId, status, reason);
        results.success.push(response.data);
      } catch (error: any) {
        results.failed.push({
          userId,
          error: error.message || 'Unknown error'
        });
      }
    });

    await Promise.allSettled(promises);

    const successCount = results.success.length;
    const failedCount = results.failed.length;
    
    if (successCount > 0) {
      toast.success(`${successCount} user${successCount > 1 ? 's' : ''} updated successfully`);
    }
    
    if (failedCount > 0) {
      toast.error(`Failed to update ${failedCount} user${failedCount > 1 ? 's' : ''}`);
    }

    return results;
  }

  /**
   * Export users data
   */
  async exportUsers(format: 'csv' | 'json' = 'csv', filters: UserFilters = {}): Promise<string> {
    try {
      const response = await this.getAllUsers({ ...filters, limit: 10000 }); // Get all users
      const users = response.data;

      if (format === 'json') {
        return JSON.stringify(users, null, 2);
      } else {
        // Convert to CSV
        const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Phone', 'Role', 'Status', 'Created At'];
        const csvRows = [
          headers.join(','),
          ...users.map(user => [
            user.user_id,
            user.email,
            user.first_name,
            user.last_name,
            user.phone_number || '',
            user.role,
            user.status || 'ACTIVE',
            user.created_at
          ].map(field => `"${field}"`).join(','))
        ];
        
        return csvRows.join('\n');
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      throw new Error('Failed to export users data');
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    userService: boolean;
    orderService: boolean;
    overall: boolean;
  }> {
    const userServiceHealth = await this.checkUserServiceHealth();
    const orderServiceHealth = await this.checkOrderServiceHealth();
    
    return {
      userService: userServiceHealth,
      orderService: orderServiceHealth,
      overall: userServiceHealth && orderServiceHealth
    };
  }

  /**
   * Simple method to get users without complex response wrapping (for backward compatibility)
   */
  async getUsers(): Promise<{ data: User[] }> {
    try {
      const response = await this.userApiClient.get('/api/users');
      // Handle different response formats - your backend returns users directly as an array
      const users = Array.isArray(response.data) ? response.data : response.data.data || [];
      return { data: users };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Simple method to update user status without complex response wrapping
   */
  async updateStatus(userId: number, status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'PENDING'): Promise<any> {
    try {
      const response = await this.userApiClient.put(`/api/users/${userId}/status`, { status });
      
      const statusActions = {
        'BLOCKED': 'blocked',
        'ACTIVE': 'activated', 
        'SUSPENDED': 'suspended',
        'PENDING': 'set to pending'
      };
      
      const action = statusActions[status] || status.toLowerCase();
      toast.success(`User ${action} successfully`);
      
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const adminUserService = new AdminUserService();
export default adminUserService;

// Export types for use in components
export type {
  ApiResponse,
  UserFilters,
  BlockUserRequest,
  Order,
  UserStats
};