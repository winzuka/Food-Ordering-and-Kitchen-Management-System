/**
 * Date Utility Functions for Food Ordering System
 * Provides comprehensive date formatting and manipulation utilities
 */

// ============================================================================
// BASIC DATE FORMATTING
// ============================================================================

/**
 * Formats a date string to a readable format (e.g., "Jan 15, 2024")
 * @param dateString - ISO date string or date-like string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return typeof dateString === 'string' ? dateString : "Invalid Date";
  }
};

/**
 * Formats a date string to include time (e.g., "Jan 15, 2024 at 2:30 PM")
 * @param dateString - ISO date string or date-like string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return typeof dateString === 'string' ? dateString : "Invalid Date";
  }
};

/**
 * Formats time only (e.g., "2:30 PM")
 * @param dateString - ISO date string or date-like string
 * @returns Formatted time string
 */
export const formatTime = (dateString: string | Date): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Time";
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return "Invalid Time";
  }
};

// ============================================================================
// RELATIVE TIME FORMATTING
// ============================================================================

/**
 * Returns relative time string (e.g., "2 hours ago", "in 30 minutes")
 * @param dateString - ISO date string or date-like string
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string | Date): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return formatDate(date);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return "Invalid Date";
  }
};

/**
 * Returns time until a future date (e.g., "in 2 hours", "in 30 minutes")
 * @param dateString - ISO date string or date-like string
 * @returns Time until string
 */
export const formatTimeUntil = (dateString: string | Date): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return "Past due";
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else {
      return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.error('Error formatting time until:', error);
    return "Invalid Date";
  }
};

// ============================================================================
// SPECIALIZED RESTAURANT FORMATTING
// ============================================================================

/**
 * Formats order date for order history display
 * @param dateString - Order date string
 * @returns Formatted order date
 */
export const formatOrderDate = (dateString: string | Date): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return `Today at ${formatTime(date)}`;
    } else if (isYesterday) {
      return `Yesterday at ${formatTime(date)}`;
    } else {
      return formatDateTime(date);
    }
  } catch (error) {
    console.error('Error formatting order date:', error);
    return "Invalid Date";
  }
};

/**
 * Formats estimated delivery time
 * @param dateString - Estimated delivery time
 * @returns Formatted delivery time with relative info
 */
export const formatDeliveryTime = (dateString: string | Date): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMs <= 0) {
      return "Ready for delivery";
    } else if (diffMinutes <= 60) {
      return `${diffMinutes} min (${formatTime(date)})`;
    } else {
      return formatTime(date);
    }
  } catch (error) {
    console.error('Error formatting delivery time:', error);
    return "Invalid Date";
  }
};

// ============================================================================
// DATE VALIDATION AND UTILITIES
// ============================================================================

/**
 * Checks if a date string is valid
 * @param dateString - Date string to validate
 * @returns Boolean indicating if date is valid
 */
export const isValidDate = (dateString: string | Date): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Checks if a date is today
 * @param dateString - Date string to check
 * @returns Boolean indicating if date is today
 */
export const isToday = (dateString: string | Date): boolean => {
  if (!isValidDate(dateString)) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Checks if a date is in the past
 * @param dateString - Date string to check
 * @returns Boolean indicating if date is in the past
 */
export const isPastDate = (dateString: string | Date): boolean => {
  if (!isValidDate(dateString)) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  return date.getTime() < now.getTime();
};

/**
 * Checks if a date is in the future
 * @param dateString - Date string to check
 * @returns Boolean indicating if date is in the future
 */
export const isFutureDate = (dateString: string | Date): boolean => {
  if (!isValidDate(dateString)) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  return date.getTime() > now.getTime();
};

// ============================================================================
// DATE CALCULATIONS
// ============================================================================

/**
 * Adds minutes to a date
 * @param dateString - Base date
 * @param minutes - Minutes to add
 * @returns New date string
 */
export const addMinutes = (dateString: string | Date, minutes: number): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    date.setMinutes(date.getMinutes() + minutes);
    return date.toISOString();
  } catch (error) {
    console.error('Error adding minutes:', error);
    return "";
  }
};

/**
 * Adds hours to a date
 * @param dateString - Base date
 * @param hours - Hours to add
 * @returns New date string
 */
export const addHours = (dateString: string | Date, hours: number): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    date.setHours(date.getHours() + hours);
    return date.toISOString();
  } catch (error) {
    console.error('Error adding hours:', error);
    return "";
  }
};

/**
 * Gets the difference in minutes between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Difference in minutes
 */
export const getDifferenceInMinutes = (startDate: string | Date, endDate: string | Date): number => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  } catch (error) {
    console.error('Error calculating difference:', error);
    return 0;
  }
};

// ============================================================================
// BUSINESS HOURS AND SPECIAL FORMATTING
// ============================================================================

/**
 * Formats date for business display (e.g., order reports)
 * @param dateString - Date to format
 * @returns Business-friendly date format
 */
export const formatBusinessDate = (dateString: string | Date): string => {
  if (!dateString) return "N/A";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting business date:', error);
    return "Invalid Date";
  }
};

/**
 * Gets current timestamp in ISO format
 * @returns Current timestamp string
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Gets current date in YYYY-MM-DD format
 * @returns Current date string
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Formats date for form inputs (YYYY-MM-DD)
 * @param dateString - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString: string | Date): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return "";
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

// Default export with commonly used functions
export default {
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatOrderDate,
  formatDeliveryTime,
  isValidDate,
  isToday,
  getCurrentTimestamp,
  getCurrentDate
};