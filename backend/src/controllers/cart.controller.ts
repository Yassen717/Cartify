import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { UnauthorizedError, NotFoundError, BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

// Get user's cart
export const getCart = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        // Find or create cart for user
        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1,
                                },
                            },
                        },
                        variant: true,
                    },
                },
            },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: {
                    userId: req.user.id,
                },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: {
                                        where: { isPrimary: true },
                                        take: 1,
                                    },
                                },
                            },
                            variant: true,
                        },
                    },
                },
            });
        }

        // Calculate totals
        const subtotal = cart.items.reduce((sum, item) => {
            const price = item.variant ? item.variant.price : item.product.price;
            return sum + Number(price) * item.quantity;
        }, 0);

        res.json({
            success: true,
            data: {
                cart: {
                    ...cart,
                    subtotal,
                    itemCount: cart.items.length,
                },
            },
        });
    }
);

// Add item to cart
export const addToCart = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { productId, variantId, quantity = 1 } = req.body;

        if (!productId) {
            throw new BadRequestError('Product ID is required');
        }

        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundError('Product not found');
        }

        // Check stock
        const availableStock = variantId
            ? (await prisma.productVariant.findUnique({ where: { id: variantId } }))?.stockQty || 0
            : product.stockQty;

        if (availableStock < quantity) {
            throw new BadRequestError('Insufficient stock');
        }

        // Find or create cart
        let cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: req.user.id },
            });
        }

        // Check if item already in cart
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
                variantId: variantId || null,
            },
        });

        if (existingItem) {
            // Update quantity
            const newQuantity = existingItem.quantity + quantity;

            if (availableStock < newQuantity) {
                throw new BadRequestError('Insufficient stock for requested quantity');
            }

            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQuantity },
            });
        } else {
            // Add new item
            const price = variantId
                ? (await prisma.productVariant.findUnique({ where: { id: variantId } }))?.price || product.price
                : product.price;

            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    variantId: variantId || null,
                    quantity,
                    priceAtAdd: price,
                },
            });
        }

        logger.info(`Item added to cart for user: ${req.user.email}`);

        // Return updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1,
                                },
                            },
                        },
                        variant: true,
                    },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Item added to cart',
            data: { cart: updatedCart },
        });
    }
);

// Update cart item quantity
export const updateCartItem = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            throw new BadRequestError('Valid quantity is required');
        }

        // Find cart item
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                cart: true,
                product: true,
                variant: true,
            },
        });

        if (!cartItem) {
            throw new NotFoundError('Cart item not found');
        }

        // Verify ownership
        if (cartItem.cart.userId !== req.user.id) {
            throw new UnauthorizedError('Not authorized to update this cart item');
        }

        // Check stock
        const availableStock = cartItem.variant
            ? cartItem.variant.stockQty
            : cartItem.product.stockQty;

        if (availableStock < quantity) {
            throw new BadRequestError('Insufficient stock');
        }

        // Update quantity
        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });

        res.json({
            success: true,
            message: 'Cart item updated',
        });
    }
);

// Remove item from cart
export const removeFromCart = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { itemId } = req.params;

        // Find cart item
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true },
        });

        if (!cartItem) {
            throw new NotFoundError('Cart item not found');
        }

        // Verify ownership
        if (cartItem.cart.userId !== req.user.id) {
            throw new UnauthorizedError('Not authorized to remove this cart item');
        }

        // Delete item
        await prisma.cartItem.delete({
            where: { id: itemId },
        });

        res.json({
            success: true,
            message: 'Item removed from cart',
        });
    }
);

// Clear entire cart
export const clearCart = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
        });

        if (cart) {
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }

        res.json({
            success: true,
            message: 'Cart cleared',
        });
    }
);
