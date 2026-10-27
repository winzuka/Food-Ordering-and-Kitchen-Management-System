import { UserStatus, UserRole, User, UserPermissions } from '@/types/admin-user';

// ==================== STATUS UTILITIES ====================

/**
 * Get user-friendly status label
 */
export function getStatusLabel(status: UserStatus): string {
  const statusLabels: Record<UserStatus, string> = {
    ACTIVE: 'Active',
    BLOCKED: 'Blocked',
    SUSPENDED: 'Suspended',
    PENDING: 'Pending'
  };
  
  return statusLabels[status] || status;
}

/**
 * Get status description
 */
export function getStatusDescription(status: UserStatus): string {
  const descriptions: Record<UserStatus, string> = {
    ACTIVE: 'User can access the application normally',
    BLOCKED: 'User is permanently blocked from accessing the application',
    SUSPENDED: 'User is temporarily suspended from accessing the application',
    PENDING: 'User account is pending verification or approval'
  };
  
  return descriptions[status] || 'Unknown status';
}

/**
 * Get status color theme
 */
export function getStatusColor(status: UserStatus): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  const colors = {
    ACTIVE: {
      bg: 'bg-success-100',
      text: 'text-success-700',
      border: 'border-success-200',
      icon: 'text-success-500'
    },
    BLOCKED: {
      bg: 'bg-accent-100',
      text: 'text-accent-700',
      border: 'border-accent-200',
      icon: 'text-accent-500'
    },
    SUSPENDED: {
      bg: 'bg-warning-100',
      text: 'text-warning-700',
      border: 'border-warning-200',
      icon: 'text-warning-500'
    },
    PENDING: {
      bg: 'bg-info-100',
      text: 'text-info-700',
      border: 'border-info-200',
      icon: 'text-info-500'
    }
  };
  
  return colors[status] || colors.ACTIVE;
}

/**
 * Check if status change is allowed
 */
export function isStatusChangeAllowed(
  currentStatus: UserStatus,
  newStatus: UserStatus,
  userRole: UserRole,
  adminRole: UserRole
): { allowed: boolean; reason?: string } {
  // Admin users cannot be blocked
  if (userRole === 'ADMIN' && newStatus === 'BLOCKED') {
    return {
      allowed: false,
      reason: 'Admin users cannot be blocked for security reasons'
    };
  }
  
  // Only admins can change other admin users
  if (userRole === 'ADMIN' && adminRole !== 'ADMIN') {
    return {
      allowed: false,
      reason: 'Only admins can modify other admin users'
    };
  }
  
  // Staff cannot block other staff or admins
  if (adminRole === 'STAFF' && (userRole === 'STAFF' || userRole === 'ADMIN')) {
    return {
      allowed: false,
      reason: 'Staff users cannot modify other staff or admin users'
    };
  }
  
  // Cannot change to the same status
  if (currentStatus === newStatus) {
    return {
      allowed: false,
      reason: `User is already ${getStatusLabel(newStatus).toLowerCase()}`
    };
  }
  
  return { allowed: true };
}

/**
 * Get available status transitions
 */
export function getAvailableStatusTransitions(
  currentStatus: UserStatus,
  userRole: UserRole,
  adminRole: UserRole
): UserStatus[] {
  const allStatuses: UserStatus[] = ['ACTIVE', 'BLOCKED', 'SUSPENDED', 'PENDING'];
  
  return allStatuses.filter(status => {
    const { allowed } = isStatusChangeAllowed(currentStatus, status, userRole, adminRole);
    return allowed && status !== currentStatus;
  });
}

// ==================== ROLE UTILITIES ====================

/**
 * Get user-friendly role label
 */
export function getRoleLabel(role: UserRole): string {
  const roleLabels: Record<UserRole, string> = {
    ADMIN: 'Administrator',
    STAFF: 'Staff Member',
    CUSTOMER: 'Customer'
  };
  
  return roleLabels[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    ADMIN: 'Full system access with administrative privileges',
    STAFF: 'Staff access for order management and kitchen operations',
    CUSTOMER: 'Customer access for ordering and account management'
  };
  
  return descriptions[role] || 'Unknown role';
}

/**
 * Get role color theme
 */
export function getRoleColor(role: UserRole): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  const colors = {
    ADMIN: {
      bg: 'bg-accent-100',
      text: 'text-accent-700',
      border: 'border-accent-200',
      icon: 'text-accent-500'
    },
    STAFF: {
      bg: 'bg-warning-100',
      text: 'text-warning-700',
      border: 'border-warning-200',
      icon: 'text-warning-500'
    },
    CUSTOMER: {
      bg: 'bg-info-100',
      text: 'text-info-700',
      border: 'border-info-200',
      icon: 'text-info-500'
    }
  };
  
  return colors[role] || colors.CUSTOMER;
}

/**
 * Get role hierarchy level (higher number = more privileges)
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    CUSTOMER: 1,
    STAFF: 2,
    ADMIN: 3
  };
  
  return levels[role] || 0;
}

/**
 * Check if role change is allowed
 */
export function isRoleChangeAllowed(
  currentRole: UserRole,
  newRole: UserRole,
  adminRole: UserRole
): { allowed: boolean; reason?: string } {
  // Only admins can change roles
  if (adminRole !== 'ADMIN') {
    return {
      allowed: false,
      reason: 'Only administrators can change user roles'
    };
  }
  
  // Cannot change own role
  if (currentRole === 'ADMIN' && newRole !== 'ADMIN') {
    return {
      allowed: false,
      reason: 'Administrators cannot change their own role'
    };
  }
  
  // Cannot change to the same role
  if (currentRole === newRole) {
    return {
      allowed: false,
      reason: `User already has ${getRoleLabel(newRole)} role`
    };
  }
  
  return { allowed: true };
}

// ==================== USER UTILITIES ====================

/**
 * Get user's full name
 */
export function getUserFullName(user: User): string {
  return `${user.first_name} ${user.last_name}`.trim();
}

/**
 * Get user's initials
 */
export function getUserInitials(user: User): string {
  const firstInitial = user.first_name.charAt(0).toUpperCase();
  const lastInitial = user.last_name.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}`;
}

/**
 * Get user's display email (truncated if too long)
 */
export function getDisplayEmail(email: string, maxLength = 30): string {
  if (email.length <= maxLength) {
    return email;
  }
  
  const [localPart, domain] = email.split('@');
  if (localPart.length > maxLength - domain.length - 4) {
    return `${localPart.substring(0, maxLength - domain.length - 7)}...@${domain}`;
  }
  
  return email;
}

/**
 * Check if user is active
 */
export function isUserActive(user: User): boolean {
  return (user.status || 'ACTIVE') === 'ACTIVE';
}

/**
 * Check if user is blocked
 */
export function isUserBlocked(user: User): boolean {
  return user.status === 'BLOCKED';
}

/**
 * Check if user can be contacted
 */
export function canContactUser(user: User): boolean {
  return isUserActive(user) && !!user.email;
}

/**
 * Get user status icon
 */
export function getUserStatusIcon(status: UserStatus): string {
  const icons: Record<UserStatus, string> = {
    ACTIVE: '✅',
    BLOCKED: '🚫',
    SUSPENDED: '⏸️',
    PENDING: '⏳'
  };
  
  return icons[status] || '❓';
}

/**
 * Get role icon
 */
export function getRoleIcon(role: UserRole): string {
  const icons: Record<UserRole, string> = {
    ADMIN: '👑',
    STAFF: '👨‍🍳',
    CUSTOMER: '👤'
  };
  
  return icons[role] || '👤';
}

// ==================== PERMISSION UTILITIES ====================

/**
 * Get user permissions based on role
 */
export function getUserPermissions(role: UserRole): UserPermissions {
  const permissions: Record<UserRole, UserPermissions> = {
    ADMIN: {
      canViewUsers: true,
      canEditUsers: true,
      canDeleteUsers: true,
      canBlockUsers: true,
      canChangeRoles: true,
      canViewOrders: true,
      canExportData: true,
      canViewAnalytics: true
    },
    STAFF: {
      canViewUsers: true,
      canEditUsers: false,
      canDeleteUsers: false,
      canBlockUsers: false,
      canChangeRoles: false,
      canViewOrders: true,
      canExportData: false,
      canViewAnalytics: false
    },
    CUSTOMER: {
      canViewUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canBlockUsers: false,
      canChangeRoles: false,
      canViewOrders: false,
      canExportData: false,
      canViewAnalytics: false
    }
  };
  
  return permissions[role] || permissions.CUSTOMER;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: keyof UserPermissions
): boolean {
  const permissions = getUserPermissions(userRole);
  return permissions[permission];
}

// ==================== VALIDATION UTILITIES ====================

/**
 * Validate user status
 */
export function isValidUserStatus(status: string): status is UserStatus {
  return ['ACTIVE', 'BLOCKED', 'SUSPENDED', 'PENDING'].includes(status);
}

/**
 * Validate user role
 */
export function isValidUserRole(role: string): role is UserRole {
  return ['ADMIN', 'STAFF', 'CUSTOMER'].includes(role);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Basic phone validation - can be enhanced based on requirements
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// ==================== FORMATTING UTILITIES ====================

/**
 * Format user status for display
 */
export function formatUserStatus(status: UserStatus | undefined): string {
  if (!status) return 'Active';
  return getStatusLabel(status);
}

/**
 * Format user role for display
 */
export function formatUserRole(role: UserRole): string {
  return getRoleLabel(role);
}

/**
 * Format user join date
 */
export function formatJoinDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Unknown';
  }
}

/**
 * Get time since user joined
 */
export function getTimeSinceJoined(dateString: string): string {
  try {
    const joinDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - joinDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
  } catch {
    return 'Unknown';
  }
}

// ==================== SORTING UTILITIES ====================

/**
 * Compare users for sorting
 */
export function compareUsers(
  a: User,
  b: User,
  field: keyof User,
  order: 'asc' | 'desc' = 'asc'
): number {
  let aValue = a[field];
  let bValue = b[field];
  
  // Handle special cases
  if (field === 'status') {
    aValue = aValue || 'ACTIVE';
    bValue = bValue || 'ACTIVE';
  }
  
  // Convert to strings for comparison
  const aStr = String(aValue).toLowerCase();
  const bStr = String(bValue).toLowerCase();
  
  const comparison = aStr.localeCompare(bStr);
  return order === 'desc' ? -comparison : comparison;
}

/**
 * Sort users array
 */
export function sortUsers(
  users: User[],
  field: keyof User,
  order: 'asc' | 'desc' = 'asc'
): User[] {
  return [...users].sort((a, b) => compareUsers(a, b, field, order));
}