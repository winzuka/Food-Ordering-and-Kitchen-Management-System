/**
 * Comprehensive formatting utilities for the food ordering system
 * Includes date, currency, text, and other common formatting functions
 */

// ==================== DATE FORMATTING ====================

/**
 * Format date string to human-readable format
 */
export function formatDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format date to just date (no time)
 */
export function formatDateOnly(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSeconds < 30) return 'Just now';
    if (diffMinutes < 1) return `${diffSeconds} second${diffSeconds > 1 ? 's' : ''} ago`;
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Unknown time';
  }
}

/**
 * Format time only (HH:MM AM/PM)
 */
export function formatTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Invalid Time';
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
}

/**
 * Format duration in minutes to readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return 'Less than 1 minute';
  if (minutes < 60) return `${Math.round(minutes)} minute${minutes > 1 ? 's' : ''}`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// ==================== CURRENCY FORMATTING ====================

/**
 * Format number as currency
 */
export function formatCurrency(amount: number | string, currency = 'USD'): string {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${(numAmount || 0).toFixed(2)}`;
  }
}

/**
 * Format currency without symbol (just the number)
 */
export function formatCurrencyNumber(amount: number | string): string {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
      return '0.00';
    }
    
    return numAmount.toFixed(2);
  } catch (error) {
    console.error('Error formatting currency number:', error);
    return '0.00';
  }
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
}

// ==================== TEXT FORMATTING ====================

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert to sentence case
 */
export function sentenceCase(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Truncate text at word boundary
 */
export function truncateWords(text: string, maxWords: number): string {
  if (!text) return '';
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Format multi-line text for display
 */
export function formatMultilineText(text: string): string {
  if (!text) return '';
  return text.replace(/\n/g, ' • ');
}

/**
 * Remove extra whitespace and normalize text
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

// ==================== CONTACT FORMATTING ====================

/**
 * Format phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US format with country code: +1 (123) 456-7890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length > 10) {
    // International format: +XX XXX XXX XXXX
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)} ${cleaned.slice(-4)}`;
  }
  
  // Return original if not standard format
  return phone;
}

/**
 * Format email for display (truncate if too long)
 */
export function formatEmail(email: string, maxLength = 30): string {
  if (!email) return '';
  
  if (email.length <= maxLength) {
    return email;
  }
  
  const [localPart, domain] = email.split('@');
  if (!domain) return truncateText(email, maxLength);
  
  const availableLength = maxLength - domain.length - 4; // Account for @, ..., and domain
  if (availableLength > 3) {
    return `${localPart.substring(0, availableLength)}...@${domain}`;
  }
  
  return truncateText(email, maxLength);
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address) return 'No address provided';
  
  // Replace newlines with commas for single-line display
  return address.split('\n').filter(line => line.trim()).join(', ');
}

/**
 * Format address for multiline display
 */
export function formatAddressMultiline(address: string): string[] {
  if (!address) return ['No address provided'];
  
  return address.split('\n').filter(line => line.trim());
}

// ==================== BUSINESS SPECIFIC FORMATTING ====================

/**
 * Format user full name
 */
export function formatUserName(firstName: string, lastName: string): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  if (!first && !last) return 'Unknown User';
  if (!first) return last;
  if (!last) return first;
  
  return `${first} ${last}`;
}

/**
 * Format user initials
 */
export function formatUserInitials(firstName: string, lastName: string): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  
  const firstInitial = first.charAt(0).toUpperCase();
  const lastInitial = last.charAt(0).toUpperCase();
  
  return `${firstInitial}${lastInitial}` || '??';
}

/**
 * Format order number
 */
export function formatOrderNumber(orderNumber: string | number): string {
  if (!orderNumber) return 'No Order Number';
  
  const orderStr = orderNumber.toString();
  
  // If it's a simple number, format it nicely
  if (/^\d+$/.test(orderStr)) {
    return `#${orderStr.padStart(6, '0')}`;
  }
  
  // If it already has formatting, return as is
  return orderStr;
}

/**
 * Format order status for display
 */
export function formatOrderStatus(status: string): string {
  if (!status) return 'Unknown';
  
  return status
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Format user role for display
 */
export function formatUserRole(role: string): string {
  if (!role) return 'Unknown';
  
  const roleMap: Record<string, string> = {
    'ADMIN': 'Administrator',
    'STAFF': 'Staff Member',
    'CUSTOMER': 'Customer',
    'MANAGER': 'Manager',
    'KITCHEN': 'Kitchen Staff',
    'DELIVERY': 'Delivery Driver'
  };
  
  return roleMap[role.toUpperCase()] || titleCase(role);
}

// ==================== NUMERIC FORMATTING ====================

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  if (isNaN(value)) return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  if (isNaN(bytes)) return 'Unknown Size';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format rating (e.g., 4.5/5 stars)
 */
export function formatRating(rating: number, maxRating = 5): string {
  if (isNaN(rating)) return 'No rating';
  
  const clampedRating = Math.max(0, Math.min(rating, maxRating));
  return `${clampedRating.toFixed(1)}/${maxRating}`;
}

/**
 * Format count with plural
 */
export function formatCount(count: number, singular: string, plural?: string): string {
  if (isNaN(count)) return `0 ${plural || singular + 's'}`;
  
  const pluralForm = plural || singular + 's';
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

// ==================== VALIDATION HELPERS ====================

/**
 * Check if a string is a valid date
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Check if a string is a valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format search results count
 */
export function formatSearchResults(count: number, total: number, searchTerm?: string): string {
  if (searchTerm) {
    return `Showing ${count} of ${total} results for "${searchTerm}"`;
  }
  return `Showing ${count} of ${total} results`;
}

/**
 * Format loading state text
 */
export function formatLoadingText(action: string): string {
  return `${action}...`;
}

/**
 * Format error message
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.data?.message) return error.data.message;
  return 'An unexpected error occurred';
}

/**
 * Format success message for actions
 */
export function formatSuccessMessage(action: string, item?: string): string {
  if (item) {
    return `${item} ${action} successfully`;
  }
  return `${action} completed successfully`;
}

// ==================== EXPORT ALL FUNCTIONS ====================

export default {
  // Date formatting
  formatDate,
  formatDateOnly,
  formatRelativeTime,
  formatTime,
  formatDuration,
  
  // Currency formatting
  formatCurrency,
  formatCurrencyNumber,
  formatCompactNumber,
  
  // Text formatting
  capitalize,
  titleCase,
  sentenceCase,
  truncateText,
  truncateWords,
  formatMultilineText,
  normalizeText,
  
  // Contact formatting
  formatPhoneNumber,
  formatEmail,
  formatAddress,
  formatAddressMultiline,
  
  // Business formatting
  formatUserName,
  formatUserInitials,
  formatOrderNumber,
  formatOrderStatus,
  formatUserRole,
  
  // Numeric formatting
  formatPercentage,
  formatFileSize,
  formatRating,
  formatCount,
  
  // Validation
  isValidDate,
  isValidEmail,
  isValidPhoneNumber,
  
  // Utilities
  formatSearchResults,
  formatLoadingText,
  formatErrorMessage,
  formatSuccessMessage
};