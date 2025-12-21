import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError } from '../utils/errors';

// Get all categories
export const getCategories = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
        const categories = await prisma.category.findMany({
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        imageUrl: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        res.json({
            success: true,
            data: { categories },
        });
    }
);

// Get category by ID
export const getCategoryById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                parent: true,
                children: true,
                products: {
                    take: 20,
                    include: {
                        images: {
                            where: { isPrimary: true },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        res.json({
            success: true,
            data: { category },
        });
    }
);

// Get products by category slug
export const getProductsByCategory = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const identifier = req.params.slug || (req.params as any).id;
        const { page = '1', limit = '20' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const isUuid = (value: string) =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
                value
            );

        // Find category (support both slug and id)
        const category = await prisma.category.findUnique({
            where: identifier && isUuid(identifier) ? { id: identifier } : { slug: identifier },
        });

        if (!category) {
            throw new NotFoundError('Category not found');
        }

        // Get products in this category
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: { categoryId: category.id },
                skip,
                take: limitNum,
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                    },
                    _count: {
                        select: {
                            reviews: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where: { categoryId: category.id } }),
        ]);

        // Calculate average ratings
        const productsWithRatings = await Promise.all(
            products.map(async (product) => {
                const avgRating = await prisma.review.aggregate({
                    where: { productId: product.id },
                    _avg: { rating: true },
                });

                return {
                    ...product,
                    averageRating: avgRating._avg.rating || 0,
                };
            })
        );

        res.json({
            success: true,
            data: {
                category,
                products: productsWithRatings,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            },
        });
    }
);
