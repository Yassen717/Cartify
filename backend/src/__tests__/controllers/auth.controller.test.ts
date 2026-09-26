import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../config/database';
import { register, login, refresh } from '../../controllers/auth.controller';
import * as jwtUtils from '../../utils/jwt';

// Mock dependencies
vi.mock('bcrypt', () => {
    const hash = vi.fn();
    const compare = vi.fn();
    return {
        hash,
        compare,
        default: { hash, compare },
    };
});

// Mock JWT utils
vi.mock('../../utils/jwt', () => ({
    generateAccessToken: vi.fn(),
    generateRefreshToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
}));

// Mock logger
vi.mock('../../utils/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    }
}));

// Mock env so tests don't depend on a real .env file
vi.mock('../../config/env', () => ({
    env: {
        NODE_ENV: 'test',
        PORT: 3000,
        DATABASE_URL: 'postgresql://test',
        JWT_SECRET: 'a'.repeat(64),
        JWT_REFRESH_SECRET: 'b'.repeat(64),
        JWT_EXPIRES_IN: '1h',
        JWT_REFRESH_EXPIRES_IN: '7d',
        CORS_ORIGIN: 'http://localhost:5173',
        BASE_URL: 'http://localhost:3000',
    },
}));

describe('Auth Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: any;
    let statusMock: any;
    let cookieMock: any;
    let clearCookieMock: any;
    let nextMock: NextFunction;

    beforeEach(() => {
        jsonMock = vi.fn();
        statusMock = vi.fn().mockReturnValue({ json: jsonMock });
        cookieMock = vi.fn();
        clearCookieMock = vi.fn();
        mockResponse = {
            status: statusMock,
            json: jsonMock,
            cookie: cookieMock,
            clearCookie: clearCookieMock,
        };
        mockRequest = {};
        nextMock = vi.fn();
        vi.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            mockRequest = {
                body: {
                    email: 'test@example.com',
                    password: 'password123',
                    firstName: 'John',
                    lastName: 'Doe',
                },
            };

            // Set up mocks
            (prisma.user.findUnique as any).mockResolvedValue(null);
            (bcrypt.hash as any).mockResolvedValue('hashed-password');
            (prisma.user.create as any).mockResolvedValue({
                id: 'user-id',
                email: 'test@example.com',
                role: 'CUSTOMER'
            });
            (prisma.refreshToken.create as any).mockResolvedValue({});
            (jwtUtils.generateAccessToken as any).mockReturnValue('access-token');
            (jwtUtils.generateRefreshToken as any).mockReturnValue('refresh-token');

            await register(mockRequest as Request, mockResponse as Response, nextMock);

            if (nextMock.mock.calls.length > 0) {
                console.error('Register failed with:', nextMock.mock.calls[0][0]);
            }

            expect(nextMock).not.toHaveBeenCalled();
            expect(prisma.user.create).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                success: true
            }));
            // Refresh token must also be delivered via httpOnly cookie
            expect(cookieMock).toHaveBeenCalledWith(
                'refreshToken',
                'refresh-token',
                expect.objectContaining({ httpOnly: true })
            );
        });
    });

    describe('refresh', () => {
        it('should rotate the refresh token and issue new tokens', async () => {
            mockRequest = {
                body: { refreshToken: 'old-refresh-token' },
                cookies: {},
            };

            (jwtUtils.verifyRefreshToken as any).mockReturnValue({ userId: 'user-id' });
            (prisma.refreshToken.findFirst as any).mockResolvedValue({
                id: 'token-row-id',
                token: 'old-refresh-token',
                userId: 'user-id',
                user: { id: 'user-id', email: 'test@example.com', role: 'CUSTOMER' },
            });
            (prisma.refreshToken.delete as any).mockResolvedValue({});
            (jwtUtils.generateRefreshToken as any).mockReturnValue('new-refresh-token');
            (prisma.refreshToken.create as any).mockResolvedValue({});
            (jwtUtils.generateAccessToken as any).mockReturnValue('new-access-token');

            await refresh(mockRequest as Request, mockResponse as Response, nextMock);

            if (nextMock.mock.calls.length > 0) {
                console.error('Refresh failed with:', nextMock.mock.calls[0][0]);
            }

            expect(nextMock).not.toHaveBeenCalled();
            // Old token invalidated
            expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
                where: { id: 'token-row-id' },
            });
            // New token persisted and sent via httpOnly cookie
            expect(prisma.refreshToken.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ token: 'new-refresh-token' }),
                })
            );
            expect(cookieMock).toHaveBeenCalledWith(
                'refreshToken',
                'new-refresh-token',
                expect.objectContaining({ httpOnly: true })
            );
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    accessToken: 'new-access-token',
                    refreshToken: 'new-refresh-token',
                }),
            }));
        });

        it('should revoke all user sessions when an already-rotated token is presented', async () => {
            mockRequest = {
                body: { refreshToken: 'stale-token' },
                cookies: {},
            };

            // JWT signature is valid, but the token is no longer in the DB
            (jwtUtils.verifyRefreshToken as any).mockReturnValue({ userId: 'user-id' });
            (prisma.refreshToken.findFirst as any).mockResolvedValue(null);

            await refresh(mockRequest as Request, mockResponse as Response, nextMock);

            expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: { userId: 'user-id' },
            });
            expect(clearCookieMock).toHaveBeenCalled();
            expect(nextMock).toHaveBeenCalledWith(
                expect.objectContaining({ statusCode: 401 })
            );
        });

        it('should reject when no refresh token is provided', async () => {
            mockRequest = { body: {}, cookies: {} };

            await refresh(mockRequest as Request, mockResponse as Response, nextMock);

            expect(nextMock).toHaveBeenCalledWith(
                expect.objectContaining({ statusCode: 400 })
            );
        });
    });
});
