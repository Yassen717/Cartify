import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { UnauthorizedError } from '../utils/errors';

// Custom CSRF protection for JWT-based APIs
// Uses double-submit cookie pattern

export const generateCsrfToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

export const setCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    const token = generateCsrfToken();
    
    res.cookie('csrf-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 3600000, // 1 hour
    });
    
    res.locals.csrfToken = token;
    next();
};

export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    const headerToken = req.headers['x-csrf-token'] as string;
    const cookieToken = req.cookies['csrf-token'];
    
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        throw new UnauthorizedError('Invalid CSRF token');
    }
    
    next();
};
