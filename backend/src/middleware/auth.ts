import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import prisma from '../config/database';
import { env } from '../config/env';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}

// Middleware to verify JWT token
export const authenticate = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
            userId: string;
            email: string;
            role: string;
        };

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // Attach user to request
        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedError('Token expired'));
        } else {
            next(error);
        }
    }
};

// Middleware to check user role
export const authorize = (...roles: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError('Not authenticated'));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new ForbiddenError('You do not have permission to access this resource')
            );
        }

        next();
    };
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, env.JWT_SECRET) as {
                userId: string;
                email: string;
                role: string;
            };

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            });

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Ignore errors for optional auth
        next();
    }
};
