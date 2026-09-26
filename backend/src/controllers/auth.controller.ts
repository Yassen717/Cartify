import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import {
    BadRequestError,
    UnauthorizedError,
    ConflictError,
    NotFoundError,
} from '../utils/errors';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../utils/jwt';
import { logger } from '../utils/logger';
import { env } from '../config/env';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const refreshCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: '/api/auth',
};

const setRefreshCookie = (res: Response, token: string): void => {
    res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions);
};

const clearRefreshCookie = (res: Response): void => {
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: refreshCookieOptions.httpOnly,
        secure: refreshCookieOptions.secure,
        sameSite: refreshCookieOptions.sameSite,
        path: refreshCookieOptions.path,
    });
};

const getRefreshTokenFromRequest = (req: Request): string | undefined =>
    req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

// Register new user
export const register = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { email, password, firstName, lastName, phone } = req.body;

        // Validate input
        if (!email || !password || !firstName || !lastName) {
            throw new BadRequestError('Email, password, first name, and last name are required');
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                firstName,
                lastName,
                phone: phone || null,
                role: 'CUSTOMER',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.email, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Save refresh token
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt,
            },
        });

        setRefreshCookie(res, refreshToken);

        logger.info(`New user registered: ${user.email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                accessToken,
                refreshToken,
            },
        });
    }
);

// Login user
export const login = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            throw new BadRequestError('Email and password are required');
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Generate tokens
        const accessToken = generateAccessToken(user.id, user.email, user.role);
        const refreshToken = generateRefreshToken(user.id);

        // Save refresh token
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt,
            },
        });

        setRefreshCookie(res, refreshToken);

        logger.info(`User logged in: ${user.email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phone: user.phone,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            },
        });
    }
);

// Refresh access token - rotates the refresh token on every use
export const refresh = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const refreshToken = getRefreshTokenFromRequest(req);

        if (!refreshToken) {
            throw new BadRequestError('Refresh token is required');
        }

        // Verify refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            clearRefreshCookie(res);
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        // Check if token exists in database
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                token: refreshToken,
                userId: decoded.userId,
                expiresAt: {
                    gte: new Date(),
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        if (!storedToken) {
            // A cryptographically valid token that is no longer in the database was
            // already rotated or revoked. Treat as possible theft: revoke every
            // session for this user.
            await prisma.refreshToken.deleteMany({
                where: { userId: decoded.userId },
            });
            clearRefreshCookie(res);
            throw new UnauthorizedError('Refresh token reuse detected. Please login again.');
        }

        // Rotate: invalidate the presented token and issue a new one
        await prisma.refreshToken.delete({
            where: { id: storedToken.id },
        });

        const newRefreshToken = generateRefreshToken(storedToken.user.id);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        await prisma.refreshToken.create({
            data: {
                userId: storedToken.user.id,
                token: newRefreshToken,
                expiresAt,
            },
        });

        setRefreshCookie(res, newRefreshToken);

        const accessToken = generateAccessToken(
            storedToken.user.id,
            storedToken.user.email,
            storedToken.user.role
        );

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        });
    }
);

// Logout user
export const logout = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const refreshToken = getRefreshTokenFromRequest(req);

        if (refreshToken) {
            // Delete refresh token from database
            await prisma.refreshToken.deleteMany({
                where: { token: refreshToken },
            });
        }

        clearRefreshCookie(res);

        res.json({
            success: true,
            message: 'Logout successful',
        });
    }
);

// Get current user profile
export const getProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        res.json({
            success: true,
            data: { user },
        });
    }
);

// Update user profile
export const updateProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { firstName, lastName, phone } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(phone !== undefined && { phone }),
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user },
        });
    }
);

// Change password
export const changePassword = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new BadRequestError('Current password and new password are required');
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!isValidPassword) {
            throw new UnauthorizedError('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: req.user.id },
            data: { passwordHash: newPasswordHash },
        });

        // Delete all refresh tokens to force re-login
        await prisma.refreshToken.deleteMany({
            where: { userId: req.user.id },
        });

        clearRefreshCookie(res);

        logger.info(`Password changed for user: ${user.email}`);

        res.json({
            success: true,
            message: 'Password changed successfully. Please login again.',
        });
    }
);
