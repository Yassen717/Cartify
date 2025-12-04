import { Request, Response, NextFunction } from 'express';

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
        console.log(`ℹ️  [INFO] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`⚠️  [WARN] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`❌ [ERROR] ${message}`, ...args);
    },
    debug: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`🐛 [DEBUG] ${message}`, ...args);
        }
    },
};
