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
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
userServiceClient.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetUsers(req, res);
      case 'POST':
        return await handleCreateUser(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} not allowed`,
          data: null
        });
    }
  } catch (error) {
    console.error('🚨 Unhandled API Error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}

// GET /api/admin/users - Get all users
async function handleGetUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { 
      page = '1', 
      limit = '50', 
      role, 
      status, 
      search 
    } = req.query;

    console.log('🔍 Fetching users with params:', { page, limit, role, status, search });

    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page as string);
    params.append('limit', limit as string);
    
    if (role && role !== 'all') {
      params.append('role', role as string);
    }
    
    if (status && status !== 'all') {
      params.append('status', status as string);
    }
    
    if (search) {
      params.append('search', search as string);
    }

    // Make request to User Service
    const response = await userServiceClient.get(`/api/users?${params.toString()}`);
    
    const users = response.data;
    console.log(`✅ Successfully fetched ${Array.isArray(users) ? users.length : 'unknown'} users`);

    // Transform response to match our API format
    const apiResponse: ApiResponse<User[]> = {
      success: true,
      message: 'Users retrieved successfully',
      data: Array.isArray(users) ? users : [],
      pagination: {
        currentPage: parseInt(page as string),
        totalPages: Math.ceil((Array.isArray(users) ? users.length : 0) / parseInt(limit as string)),
        totalItems: Array.isArray(users) ? users.length : 0,
        itemsPerPage: parseInt(limit as string)
      }
    };

    return res.status(200).json(apiResponse);

  } catch (error: any) {
    console.error('❌ Error fetching users:', error);

    // Handle different error types
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'User Service is not available. Please check if the service is running on port 8083.',
        data: [],
        error: {
          code: 'SERVICE_UNAVAILABLE',
          details: 'Cannot connect to User Service'
        }
      });
    }

    if (error.response) {
      // User Service returned an error
      const status = error.response.status;
      const message = error.response.data?.message || 'Error from User Service';
      
      return res.status(status).json({
        success: false,
        message,
        data: [],
        error: {
          code: 'USER_SERVICE_ERROR',
          details: error.response.data
        }
      });
    }

    // Network or other error
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users from User Service',
      data: [],
      error: {
        code: 'NETWORK_ERROR',
        details: error.message
      }
    });
  }
}

// POST /api/admin/users - Create new user (if needed)
async function handleCreateUser(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userData = req.body;
    
    console.log('👤 Creating new user:', { email: userData.email, role: userData.role });

    // Validate required fields
    const requiredFields = ['email', 'password', 'first_name', 'last_name', 'role'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          details: { missingFields }
        }
      });
    }

    // Validate role
    const validRoles = ['CUSTOMER', 'STAFF', 'ADMIN'];
    if (!validRoles.includes(userData.role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          details: { invalidRole: userData.role }
        }
      });
    }

    // Make request to User Service
    const response = await userServiceClient.post('/api/users/register', userData);
    
    const newUser = response.data;
    console.log('✅ User created successfully:', newUser.user_id);

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });

  } catch (error: any) {
    console.error('❌ Error creating user:', error);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Error creating user';
      
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

    return res.status(500).json({
      success: false,
      message: 'Failed to create user',
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        details: error.message
      }
    });
  }
}