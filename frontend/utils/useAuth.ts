import { useState, useEffect } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  role: "USER" | "ADMIN";
  status?: "ACTIVE" | "BLOCKED";
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const USER_SERVICE_URL = 'http://localhost:8083';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const setStoredAuth = (user: User, token?: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

const clearStoredAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

// ============================================================================
// API HELPERS
// ============================================================================

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getStoredToken();
  
  const response = await fetch(`${USER_SERVICE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredAuth();
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = getStoredUser();
        const token = getStoredToken();
        
        if (storedUser && token) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearStoredAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.user) {
        setUser(response.user);
        setStoredAuth(response.user, response.token);
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    address?: string;
  }): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.user) {
        setUser(response.user);
        setStoredAuth(response.user, response.token);
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Try to logout on server (optional)
      try {
        await apiRequest('/api/users/logout', { method: 'POST' });
      } catch {
        // Ignore server logout errors
      }
    } finally {
      // Always clear local state
      setUser(null);
      clearStoredAuth();
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    if (!user) return;

    try {
      const response = await apiRequest(`/api/users/${user.user_id}`);
      if (response.user) {
        setUser(response.user);
        setStoredAuth(response.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails due to auth error, logout
      if (error instanceof Error && error.message.includes('Session expired')) {
        await logout();
      }
    }
  };

  // Update user profile
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    try {
      const response = await apiRequest(`/api/users/${user.user_id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      if (response.user) {
        setUser(response.user);
        setStoredAuth(response.user);
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  // Role checking helpers
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // Computed properties
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';

  return {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Role checks
    isAdmin,
    isUser,
    hasRole,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Check if user is authenticated (can be used in getServerSideProps)
export const isUserAuthenticated = (): boolean => {
  return !!(getStoredUser() && getStoredToken());
};

// Get current user without hook (can be used in getServerSideProps)
export const getCurrentUser = (): User | null => {
  return getStoredUser();
};

// Check user role without hook
export const checkUserRole = (requiredRoles: string | string[]): boolean => {
  const user = getStoredUser();
  if (!user) return false;
  
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(user.role);
};

// Simple auth redirect helper
export const getRedirectPath = (userRole?: string): string => {
  switch (userRole) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'USER':
      return '/menu';
    default:
      return '/';
  }
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  useAuth,
  isUserAuthenticated,
  getCurrentUser,
  checkUserRole,
  getRedirectPath,
};