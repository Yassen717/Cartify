import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { UnauthorizedError, NotFoundError, ConflictError } from '../utils/errors';

// Get user's wishlist
export const getWishlist = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const wishlist = await prisma.wishlist.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    include: {
                        images: {
                            where: { isPrimary: true },
                            take: 1,
                        },
                        category: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Calculate average ratings
        const wishlistWithRatings = await Promise.all(
            wishlist.map(async (item) => {
                const avgRating = await prisma.review.aggregate({
                    where: { productId: item.product.id },
                    _avg: { rating: true },
                });

                return {
                    ...item,
                    product: {
                        ...item.product,
                        averageRating: avgRating._avg.rating || 0,
                    },
                };
            })
        );

        res.json({
            success: true,
            data: {
                wishlist: wishlistWithRatings,
                count: wishlistWithRatings.length,
            },
        });
    }
);

// Add item to wishlist
export const addToWishlist = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { productId } = req.body;

        if (!productId) {
            throw new NotFoundError('Product ID is required');
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Check if already in wishlist - IDEMPOTENT: return existing instead of error
        const existing = await prisma.wishlist.findFirst({
            where: {
                userId: req.user.id,
                productId,
            },
            include: {
                product: {
                    include: {
                        images: {
                            where: { isPrimary: true },
                            take: 1,
                        },
                    },
                },
            },
        });

        if (existing) {
            // Already in wishlist - return success with existing item (idempotent)
            return res.status(200).json({
                success: true,
                message: 'Product already in wishlist',
                data: { wishlistItem: existing },
            });
        }

        // Add to wishlist
        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: req.user.id,
                productId,
            },
            include: {
                product: {
                    include: {
                        images: {
                            where: { isPrimary: true },
                            take: 1,
                        },
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Product added to wishlist',
            data: { wishlistItem },
        });
    }
);

// Remove item from wishlist
export const removeFromWishlist = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { productId } = req.params;

        // Find wishlist item
        const wishlistItem = await prisma.wishlist.findFirst({
            where: {
                userId: req.user.id,
                productId,
            },
        });

        if (!wishlistItem) {
            // IDEMPOTENT: Item not in wishlist - return success anyway
            return res.json({
                success: true,
                message: 'Product not in wishlist',
            });
        }

        // Remove from wishlist
        await prisma.wishlist.delete({
            where: { id: wishlistItem.id },
        });

        res.json({
            success: true,
            message: 'Product removed from wishlist',
        });
    }
);

// Move wishlist item to cart
export const moveToCart = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { productId } = req.params;

        await prisma.$transaction(async (tx) => {
            // Find wishlist item
            const wishlistItem = await tx.wishlist.findFirst({
                where: {
                    userId: req.user!.id,
                    productId,
                },
                include: {
                    product: true,
                },
            });

            if (!wishlistItem) {
                throw new NotFoundError('Product not in wishlist');
            }

            // Check stock
            if (wishlistItem.product.stockQty < 1) {
                throw new ConflictError('Product is out of stock');
            }

            // Find or create cart
            const cart =
                (await tx.cart.findUnique({ where: { userId: req.user!.id } })) ||
                (await tx.cart.create({ data: { userId: req.user!.id } }));

            // Merge into existing cart line when possible
            const existingItem = await tx.cartItem.findFirst({
                where: {
                    cartId: cart.id,
                    productId,
                    variantId: null,
                },
            });

            if (existingItem) {
                const newQuantity = existingItem.quantity + 1;
                if (wishlistItem.product.stockQty < newQuantity) {
                    throw new ConflictError('Insufficient stock for requested quantity');
                }

                await tx.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: newQuantity },
                });
            } else {
                await tx.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        quantity: 1,
                        priceAtAdd: wishlistItem.product.price,
                    },
                });
            }

            // Remove from wishlist
            await tx.wishlist.delete({
                where: { id: wishlistItem.id },
            });
        });

        res.json({
            success: true,
            message: 'Product moved to cart',
        });
    }
);
