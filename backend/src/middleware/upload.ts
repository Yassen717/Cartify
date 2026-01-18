import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { BadRequestError } from '../utils/errors';
import { env } from '../config/env';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        // Generate cryptographically secure random filename
        const randomName = crypto.randomBytes(32).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${randomName}${ext}`);
    },
});

// Strict file filter for images only
const imageFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check file extension (whitelist approach)
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
        return cb(new BadRequestError('Invalid file extension. Only jpg, jpeg, png, and webp are allowed'));
    }
    
    // Check MIME type (double validation)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new BadRequestError('Invalid file type. Only JPEG, PNG, and WebP images are allowed'));
    }
    
    // Prevent path traversal in filename
    const basename = path.basename(file.originalname);
    if (basename !== file.originalname || basename.includes('..')) {
        return cb(new BadRequestError('Invalid filename'));
    }
    
    cb(null, true);
};

// Create multer instance with strict limits
export const upload = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 10, // Max 10 files per request
        fields: 20, // Max 20 non-file fields
    },
});

// Helper function to delete file
export const deleteFile = (filePath: string): void => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// Helper to get file URL
export const getFileUrl = (filename: string): string => {
    return `${env.BASE_URL}/uploads/${filename}`;
};

// Rate limiter for upload endpoints
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 upload requests per window
    message: 'Too many upload requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
