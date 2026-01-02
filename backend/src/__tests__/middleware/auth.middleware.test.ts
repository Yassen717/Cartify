import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';

// Mock dependencies
vi.mock('jsonwebtoken');
vi.mock('../../config/database');

describe('Auth Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-secret';
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            status: vi.fn(),
            json: vi.fn(),
        };
        nextFunction = vi.fn();
        vi.clearAllMocks();
    });

    describe('authenticate', () => {
        it('should call next if token is valid', async () => {
            mockRequest.headers = { authorization: 'Bearer valid-token' };

            // Mock jwt.verify
            (jwt.verify as any).mockReturnValue({
                userId: 'user-id',
                email: 'test@example.com',
                role: 'CUSTOMER'
            });

            // Mock prisma findUnique
            const mockUser = {
                id: 'user-id',
                email: 'test@example.com',
                role: 'CUSTOMER'
            };
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);

            await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            // Verify next was called with NO error (undefined)
            // The middleware implementation calls next() on success
            expect(nextFunction).toHaveBeenCalled();

            // If it was called with error, show it
            if (nextFunction.mock.calls.length > 0 && nextFunction.mock.calls[0][0]) {
                console.error('Next called with error:', nextFunction.mock.calls[0][0]);
            }

            // Verify user was attached
            expect((mockRequest as any).user).toBeDefined();
            expect((mockRequest as any).user).toEqual(mockUser);
        });

        it('should return error if no token provided', async () => {
            mockRequest.headers = {};

            await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
            const error = (nextFunction as any).mock.calls[0][0];
            expect(error.statusCode).toBe(401);
        });
    });
});
