import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';
import { invalidateCache } from '../middleware/cache';

// Get all products with pagination and filters
export const getProducts = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const {
            page = '1',
            limit = '20',
            search,
            categoryId,
            minPrice,
            maxPrice,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
                { brand: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        if (categoryId) {
            where.categoryId = categoryId as string;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = parseFloat(minPrice as string);
            if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
        }

        // Get products with pagination
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { [sortBy as string]: sortOrder },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
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
            }),
            prisma.product.count({ where }),
        ]);

        // Calculate average rating for each product
        const productsWithRatings = await Promise.all(
            products.map(async (product) => {
                const avgRating = await prisma.review.aggregate({
                    where: { productId: product.id },
                    _avg: { rating: true },
                });

                return {
                    ...product,
                    averageRating: avgRating._avg.rating || 0,
                    reviewCount: product._count.reviews,
                };
            })
        );

        res.json({
            success: true,
            data: {
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

// Get single product by ID
export const getProductById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: {
                    orderBy: { position: 'asc' },
                },
                variants: true,
                attributes: true,
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        images: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Calculate average rating
        const avgRating = await prisma.review.aggregate({
            where: { productId: id },
            _avg: { rating: true },
        });

        res.json({
            success: true,
            data: {
                product: {
                    ...product,
                    averageRating: avgRating._avg.rating || 0,
                },
            },
        });
    }
);

// Create new product (Admin only)
export const createProduct = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const {
            name,
            slug,
            description,
            price,
            comparePrice,
            stockQty,
            sku,
            brand,
            categoryId,
            images,
            variants,
            attributes,
        } = req.body;

        // Validate required fields
        if (!name || !slug || !description || !price || !sku || !categoryId) {
            throw new BadRequestError(
                'Name, slug, description, price, SKU, and category are required'
            );
        }

        // Check if product with same SKU exists
        const existingProduct = await prisma.product.findUnique({
            where: { sku },
        });

        if (existingProduct) {
            throw new BadRequestError('Product with this SKU already exists');
        }

        // Create product with related data
        const product = await prisma.product.create({
            data: {
                name,
                slug,
                description,
                price,
                comparePrice: comparePrice || null,
                stockQty: stockQty || 0,
                sku,
                brand: brand || null,
                categoryId,
                images: images
                    ? {
                        create: images.map((img: any, index: number) => ({
                            url: img.url,
                            altText: img.altText || name,
                            position: index + 1,
                            isPrimary: index === 0,
                        })),
                    }
                    : undefined,
                variants: variants
                    ? {
                        create: variants,
                    }
                    : undefined,
                attributes: attributes
                    ? {
                        create: attributes,
                    }
                    : undefined,
            },
            include: {
                category: true,
                images: true,
                variants: true,
                attributes: true,
            },
        });

        logger.info(`Product created: ${product.name} (${product.sku})`);

        // Invalidate product cache
        await invalidateCache.products();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product },
        });
    }
);

// Update product (Admin only)
export const updateProduct = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { id } = req.params;
        const updateData = req.body;

        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            throw new NotFoundError('Product not found');
        }

        // Update product
        const product = await prisma.product.update({
            where: { id },
            data: {
                ...(updateData.name && { name: updateData.name }),
                ...(updateData.slug && { slug: updateData.slug }),
                ...(updateData.description && { description: updateData.description }),
                ...(updateData.price !== undefined && { price: updateData.price }),
                ...(updateData.comparePrice !== undefined && {
                    comparePrice: updateData.comparePrice,
                }),
                ...(updateData.stockQty !== undefined && { stockQty: updateData.stockQty }),
                ...(updateData.brand !== undefined && { brand: updateData.brand }),
                ...(updateData.categoryId && { categoryId: updateData.categoryId }),
            },
            include: {
                category: true,
                images: true,
                variants: true,
                attributes: true,
            },
        });

        logger.info(`Product updated: ${product.name} (${product.id})`);

        // Invalidate product cache
        await invalidateCache.product(id);

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product },
        });
    }
);

// Delete product (Admin only)
export const deleteProduct = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { id } = req.params;

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Delete product (cascades to images, variants, attributes)
        await prisma.product.delete({
            where: { id },
        });

        logger.info(`Product deleted: ${product.name} (${product.id})`);

        // Invalidate product cache
        await invalidateCache.product(id);

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    }
);

// Get product reviews
export const getProductReviews = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { id } = req.params;
        const { page = '1', limit = '10' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { productId: id },
                skip,
                take: limitNum,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    images: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.review.count({ where: { productId: id } }),
        ]);

        res.json({
            success: true,
            data: {
                reviews,
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
