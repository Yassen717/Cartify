import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ForbiddenError } from '../utils/errors';

// Store for CSRF tokens (in production, use Redis)
const csrfTokens = new Map<string, { token: string; expires: number }>();

// Clean expired tokens every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of csrfTokens.entries()) {
        if (value.expires < now) {
            csrfTokens.delete(key);
        }
    }
}, 5 * 60 * 1000);

// Generate CSRF token
export const generateCsrfToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Set CSRF token in cookie and response
export const setCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    const token = generateCsrfToken();
    const sessionId = req.cookies.sessionId || crypto.randomBytes(16).toString('hex');
    
    // Store token with 1 hour expiration
    csrfTokens.set(sessionId, {
        token,
        expires: Date.now() + 60 * 60 * 1000,
    });
    
    // Set session cookie
    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour
    });
    
    // Send token in response
    res.locals.csrfToken = token;
    next();
};

// Verify CSRF token
export const verifyCsrfToken = (req: Request, _res: Response, next: NextFunction) => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    // Skip CSRF in development for easier testing
    if (process.env.NODE_ENV === 'development') {
        return next();
    }
    
    const sessionId = req.cookies.sessionId;
    const token = req.headers['x-csrf-token'] as string;
    
    if (!sessionId || !token) {
        throw new ForbiddenError('CSRF token missing');
    }
    
    const storedToken = csrfTokens.get(sessionId);
    
    if (!storedToken || storedToken.expires < Date.now()) {
        csrfTokens.delete(sessionId);
        throw new ForbiddenError('CSRF token expired');
    }
    
    if (storedToken.token !== token) {
        throw new ForbiddenError('Invalid CSRF token');
    }
    
    next();
};
