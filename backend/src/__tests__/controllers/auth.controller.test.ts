import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../config/database';
import { register, login } from '../../controllers/auth.controller';
import * as jwtUtils from '../../utils/jwt';

// Mock dependencies
vi.mock('bcrypt', () => ({
    hash: vi.fn(),
    compare: vi.fn(),
}));

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

// Mock Prisma
vi.mock('../../config/database');

describe('Auth Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: any;
    let statusMock: any;
    let nextMock: NextFunction;

    beforeEach(() => {
        jsonMock = vi.fn();
        statusMock = vi.fn().mockReturnValue({ json: jsonMock });
        mockResponse = {
            status: statusMock,
            json: jsonMock,
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
        });
    });
});
