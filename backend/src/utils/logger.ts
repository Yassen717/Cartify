import { Request, Response, NextFunction } from 'express';
import { sanitizeForLog } from './sanitize';

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log when response finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMessage = `${req.method} ${req.path} ${res.statusCode} - ${duration}ms`;

        // Color code based on status
        if (res.statusCode >= 500) {
            console.error(`❌ ${logMessage}`);
        } else if (res.statusCode >= 400) {
            console.warn(`⚠️  ${logMessage}`);
        } else {
            console.log(`✅ ${logMessage}`);
        }
    });

    next();
};

// Simple logger utility
export const logger = {
    info: (message: string, ...args: any[]) => {
        const sanitized = args.map(arg => sanitizeForLog(arg));
        console.log(`ℹ️  [INFO] ${message}`, ...sanitized);
    },
    warn: (message: string, ...args: any[]) => {
        const sanitized = args.map(arg => sanitizeForLog(arg));
        console.warn(`⚠️  [WARN] ${message}`, ...sanitized);
    },
    error: (message: string, ...args: any[]) => {
        const sanitized = args.map(arg => sanitizeForLog(arg));
        console.error(`❌ [ERROR] ${message}`, ...sanitized);
    },
    debug: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            const sanitized = args.map(arg => sanitizeForLog(arg));
            console.log(`🐛 [DEBUG] ${message}`, ...sanitized);
        }
    },
};
