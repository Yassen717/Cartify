import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { getProducts, getProductById } from '../../controllers/products.controller';

// Mock dependencies
vi.mock('../../config/database');
vi.mock('../../middleware/cache', () => ({
    invalidateCache: {
        products: vi.fn(),
        product: vi.fn(),
    },
}));
vi.mock('../../utils/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
    }
}));

describe('Products Controller', () => {
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

    describe('getProducts', () => {
        it('should return products with pagination', async () => {
            mockRequest = {
                query: { page: '1', limit: '10' }
            };

            const mockProducts = [
                {
                    id: 'p1',
                    name: 'Product 1',
                    price: 100,
                    _count: { reviews: 5 }
                }
            ];

            (prisma.product.findMany as any).mockResolvedValue(mockProducts);
            (prisma.product.count as any).mockResolvedValue(1);
            (prisma.review.groupBy as any).mockResolvedValue([
                { productId: 'p1', _avg: { rating: 4.5 } }
            ]);

            await getProducts(mockRequest as Request, mockResponse as Response, nextMock);

            expect(prisma.product.findMany).toHaveBeenCalled();
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    products: expect.arrayContaining([
                        expect.objectContaining({
                            id: 'p1',
                            averageRating: 4.5
                        })
                    ]),
                    pagination: expect.objectContaining({
                        total: 1
                    })
                })
            }));
        });
    });

    describe('getProductById', () => {
        it('should return single product', async () => {
            mockRequest = {
                params: { id: 'p1' }
            };

            const mockProduct = { id: 'p1', name: 'Product 1' };
            (prisma.product.findUnique as any).mockResolvedValue(mockProduct);
            (prisma.review.aggregate as any).mockResolvedValue({ _avg: { rating: 4.5 } });

            await getProductById(mockRequest as Request, mockResponse as Response, nextMock);

            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    product: expect.objectContaining({
                        id: 'p1',
                        averageRating: 4.5
                    })
                })
            }));
        });

        it('should return 404 if product not found', async () => {
            mockRequest = {
                params: { id: 'non-existent' }
            };

            (prisma.product.findUnique as any).mockResolvedValue(null);

            await getProductById(mockRequest as Request, mockResponse as Response, nextMock);

            expect(nextMock).toHaveBeenCalledWith(expect.any(Error));
            const error = (nextMock as any).mock.calls[0][0];
            expect(error.statusCode).toBe(404);
        });
    });
});
