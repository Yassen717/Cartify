import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ForbiddenError } from '../utils/errors';
import { redisClient } from '../config/redis';

// Store for CSRF tokens (fallback when Redis is unavailable)
const csrfTokens = new Map<string, { token: string; expires: number }>();
const CSRF_TTL_MS = 60 * 60 * 1000; // 1 hour
const CSRF_TTL_SECONDS = 60 * 60;
const CSRF_KEY_PREFIX = 'csrf:';

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

const getCsrfKey = (sessionId: string) => `${CSRF_KEY_PREFIX}${sessionId}`;

const storeToken = async (sessionId: string, token: string): Promise<void> => {
    if (redisClient.isReady()) {
        const stored = await redisClient.set(getCsrfKey(sessionId), token, CSRF_TTL_SECONDS);
        if (stored) {
            return;
        }
    }

    csrfTokens.set(sessionId, {
        token,
        expires: Date.now() + CSRF_TTL_MS,
    });
};

const getStoredToken = async (sessionId: string): Promise<string | null> => {
    if (redisClient.isReady()) {
        const token = await redisClient.get(getCsrfKey(sessionId));
        if (token) {
            return token;
        }
    }

    const storedToken = csrfTokens.get(sessionId);
    if (!storedToken) return null;
    if (storedToken.expires < Date.now()) {
        csrfTokens.delete(sessionId);
        return null;
    }
    return storedToken.token;
};

// Set CSRF token in cookie and response
export const setCsrfToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = generateCsrfToken();
    const sessionId = req.cookies.sessionId || crypto.randomBytes(16).toString('hex');
    
    await storeToken(sessionId, token);
    
    // Set session cookie
    res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: CSRF_TTL_MS,
    });
    
    // Send token in response
    res.locals.csrfToken = token;
    next();
};

// Verify CSRF token
export const verifyCsrfToken = async (req: Request, _res: Response, next: NextFunction) => {
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
    
    const storedToken = await getStoredToken(sessionId);
    
    if (!storedToken) {
        throw new ForbiddenError('CSRF token expired');
    }
    
    if (storedToken !== token) {
        throw new ForbiddenError('Invalid CSRF token');
    }
    
    next();
};
