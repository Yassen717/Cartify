import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';

// Error handling middleware
export const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Log error for debugging
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
    });

    // Check if it's an operational error
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.details && { details: err.details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        });
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({
            success: false,
            message: 'Database error occurred',
            ...(process.env.NODE_ENV === 'development' && { details: err.message }),
        });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            details: err.message,
        });
    }

    // Default error response
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};

// Async handler wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
