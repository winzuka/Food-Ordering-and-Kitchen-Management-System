import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Types
interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  address?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  status?: 'ACTIVE' | 'BLOCKED';
  created_at: string;
  updated_at: string;
}

interface BlockUserRequest {
  userId: number;
  status: 'ACTIVE' | 'BLOCKED';
  reason?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: any;
}

// User Service API client
const userServiceClient = axios.create({
  baseURL: process.env.USER_SERVICE_URL || 'http://localhost:8083',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
userServiceClient.interceptors.request.use(
  (config) => {
    console.log(`📤 Block User API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Block User Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
userServiceClient.interceptors.response.use(
  (response) => {
    console.log(`📥 Block User API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Block User Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'PUT':
      case 'POST':
        return await handleBlockUser(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} not allowed`,
          data: null
        });
    }
  } catch (error) {
    console.error('🚨 Unhandled Block User API Error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

// PUT/POST /api/admin/block-user - Block or unblock a user
async function handleBlockUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, status, reason }: BlockUserRequest = req.body;

    console.log(`🔒 ${status === 'BLOCKED' ? 'Blocking' : 'Unblocking'} user:`, { userId, status, reason });

    // Validate request body
    if (!userId || typeof userId !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing userId',
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          details: 'userId must be a valid number'
        }
      });
    }

    if (!status || !['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be ACTIVE or BLOCKED',
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          details: 'status must be either ACTIVE or BLOCKED'
        }
      });
    }

    // First, get the user to check if they exist and their current status
    let currentUser: User;
    try {
      const getUserResponse = await userServiceClient.get(`/api/users/${userId}`);
      currentUser = getUserResponse.data;
      
      console.log('👤 Current user status:', { 
        userId: currentUser.user_id, 
        currentStatus: currentUser.status || 'ACTIVE',
        role: currentUser.role 
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null,
          error: {
            code: 'USER_NOT_FOUND',
            details: `No user found with ID ${userId}`
          }
        });
      }
      throw error; // Re-throw other errors to be handled below
    }

    // Prevent blocking admin users
    if (currentUser.role === 'ADMIN' && status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Cannot block admin users',
        data: null,
        error: {
          code: 'FORBIDDEN_ACTION',
          details: 'Admin users cannot be blocked for security reasons'
        }
      });
    }

    // Check if user is already in the requested status
    const currentStatus = currentUser.status || 'ACTIVE';
    if (currentStatus === status) {
      return res.status(400).json({
        success: false,
        message: `User is already ${status.toLowerCase()}`,
        data: currentUser,
        error: {
          code: 'NO_CHANGE_NEEDED',
          details: `User status is already ${status}`
        }
      });
    }

    // Prepare update data
    const updateData = {
      status,
      ...(reason && { reason }),
      updated_at: new Date().toISOString()
    };

    // Make request to User Service to update user status
    // Note: Adjust the endpoint based on your User Service API
    const response = await userServiceClient.put(`/api/users/${userId}/status`, updateData);
    
    const updatedUser = response.data;
    console.log(`✅ User ${status === 'BLOCKED' ? 'blocked' : 'unblocked'} successfully:`, updatedUser.user_id);

    // Log the action for audit purposes
    console.log('📋 User Status Change Audit:', {
      userId: updatedUser.user_id,
      userEmail: updatedUser.email,
      previousStatus: currentStatus,
      newStatus: status,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString(),
      actionType: status === 'BLOCKED' ? 'USER_BLOCKED' : 'USER_UNBLOCKED'
    });

    const successMessage = status === 'BLOCKED' 
      ? `User ${updatedUser.first_name} ${updatedUser.last_name} has been blocked successfully`
      : `User ${updatedUser.first_name} ${updatedUser.last_name} has been unblocked successfully`;

    return res.status(200).json({
      success: true,
      message: successMessage,
      data: updatedUser
    });

  } catch (error: any) {
    console.error('❌ Error updating user status:', error);

    // Handle different error types
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'User Service is not available. Please check if the service is running on port 8083.',
        data: null,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          details: 'Cannot connect to User Service'
        }
      });
    }

    if (error.response) {
      // User Service returned an error
      const status = error.response.status;
      const message = error.response.data?.message || 'Error updating user status';
      
      return res.status(status).json({
        success: false,
        message,
        data: null,
        error: {
          code: 'USER_SERVICE_ERROR',
          details: error.response.data
        }
      });
    }

    // Network or other error
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        details: error.message
      }
    });
  }
}

