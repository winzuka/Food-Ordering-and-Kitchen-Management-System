import Cookies from 'js-cookie';
import { User } from '../types';

// Token management
export const setAuthToken = (token: string): void => {
  Cookies.set('authToken', token, { expires: 7 });
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get('authToken');
};

export const removeAuthToken = (): void => {
  Cookies.remove('authToken');
};

// User management
export const setUser = (user: User): void => {
  Cookies.set('user', JSON.stringify(user), { expires: 7 });
};

export const getUser = (): User | null => {
  const user = Cookies.get('user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = (): void => {
  Cookies.remove('user');
};

// Authentication checks
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const isAdmin = (): boolean => {
  const user = getUser();
  return user?.role === 'ADMIN';
};

// Get current user (alias for getUser for consistency)
export const getCurrentUser = (): User | null => {
  return getUser();
};

// Logout functionality
export const logout = (): void => {
  removeAuthToken();
  removeUser();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Additional utility functions
export const getUserRole = (): string | null => {
  const user = getUser();
  return user?.role || null;
};

export const getUserId = (): number | null => {
  const user = getUser();
  return user?.id || null;
};

export const getUsername = (): string | null => {
  const user = getUser();
  return user?.username || null;
};

// Check if user has specific role
export const hasRole = (role: 'CUSTOMER' | 'ADMIN'): boolean => {
  const user = getUser();
  return user?.role === role;
};

// Redirect helpers
export const redirectToLogin = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const redirectToHome = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

export const redirectToAdmin = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/menu';
  }
};