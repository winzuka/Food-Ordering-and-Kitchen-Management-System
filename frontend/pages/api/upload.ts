// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Define upload directory
    const uploadDir = path.join(process.cwd(), 'public/images/menu');
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Configure formidable
    const form = formidable({
      uploadDir: uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB limit
      filename: (name, ext, part) => {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        return `menu-${timestamp}-${randomStr}${ext}`;
      },
    });

    // Parse the incoming form data
    const [fields, files] = await form.parse(req);
    
    // Get the uploaded file
    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    
    if (!file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        success: false 
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype || '')) {
      // Delete the uploaded file if invalid type
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
        success: false 
      });
    }

    // Validate file size (double check)
    if (file.size > 5 * 1024 * 1024) {
      // Delete the uploaded file if too large
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ 
        error: 'File size too large. Maximum size is 5MB.',
        success: false 
      });
    }

    // Get the filename from the uploaded file path
    const filename = path.basename(file.filepath);
    
    // Create the public URL path
    const imageUrl = `/images/menu/${filename}`;
    
    // Return success response
    res.status(200).json({ 
      success: true,
      imageUrl: imageUrl,
      filename: filename,
      size: file.size,
      type: file.mimetype,
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('maxFileSize')) {
        return res.status(400).json({ 
          error: 'File too large. Maximum size is 5MB.',
          success: false 
        });
      }
    }
    
    // Generic error response
    res.status(500).json({ 
      error: 'Internal server error during upload',
      success: false 
    });
  }
}

// Utility function to delete old images (optional)
export const deleteImage = (imagePath: string): boolean => {
  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};