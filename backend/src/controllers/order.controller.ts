import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Create a new order from user's cart
 * POST /api/orders
 */
export const createOrder = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const {
            shippingAddressId,
            billingAddressId,
            shippingAddress,
            billingAddress,
            paymentMethod,
        } = req.body;

        // Get user's cart
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new BadRequestError('Cart is empty');
        }

        // Calculate totals
        let subtotal = 0;
        cart.items.forEach((item) => {
            const price = item.variant
                ? parseFloat(item.variant.price.toString())
                : parseFloat(item.product.price.toString());
            subtotal += price * item.quantity;
        });

        const tax = subtotal * 0.1; // 10% tax
        const shippingCost = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
        const total = subtotal + tax + shippingCost;

        // Handle addresses
        let shippingAddrId = shippingAddressId;
        let billingAddrId = billingAddressId;

        // Create shipping address if provided
        if (!shippingAddrId && shippingAddress) {
            const newShippingAddr = await prisma.address.create({
                data: {
                    userId: req.user.id,
                    ...shippingAddress,
                },
            });
            shippingAddrId = newShippingAddr.id;
        }

        // Create billing address if provided
        if (!billingAddrId && billingAddress) {
            const newBillingAddr = await prisma.address.create({
                data: {
                    userId: req.user.id,
                    ...billingAddress,
                },
            });
            billingAddrId = newBillingAddr.id;
        }

        // Verify addresses exist
        if (!shippingAddrId || !billingAddrId) {
            throw new BadRequestError('Shipping and billing addresses are required');
        }

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create order
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                orderNumber,
                status: 'PENDING',
                paymentStatus: 'PENDING',
                subtotal,
                tax,
                shippingCost,
                total,
                shippingAddressId: shippingAddrId,
                billingAddressId: billingAddrId,
                items: {
                    create: cart.items.map((item) => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.variant
                            ? item.variant.price
                            : item.product.price,
                        subtotal:
                            parseFloat(
                                (item.variant
                                    ? item.variant.price
                                    : item.product.price
                                ).toString()
                            ) * item.quantity,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
                shippingAddress: true,
                billingAddress: true,
            },
        });

        // Clear cart after order creation
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });

        // Create initial order tracking
        await prisma.orderTracking.create({
            data: {
                orderId: order.id,
                status: 'Order Placed',
                notes: `Order created with payment method: ${paymentMethod}`,
            },
        });

        logger.info(`Order created: ${order.orderNumber} for user ${req.user.email}`);

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { order },
        });
    }
);

/**
 * Get user's orders
 * GET /api/orders
 */
export const getOrders = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId: req.user.id },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    shippingAddress: true,
                },
            }),
            prisma.order.count({
                where: { userId: req.user.id },
            }),
        ]);

        res.json({
            success: true,
            data: {
                orders,
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

/**
 * Get single order by ID
 * GET /api/orders/:id
 */
export const getOrderById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                },
                            },
                        },
                        variant: true,
                    },
                },
                shippingAddress: true,
                billingAddress: true,
                tracking: {
                    orderBy: { timestamp: 'desc' },
                },
            },
        });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        // Verify order belongs to user (or user is admin)
        if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new UnauthorizedError('You do not have permission to view this order');
        }

        res.json({
            success: true,
            data: { order },
        });
    }
);

/**
 * Update order status (Admin only)
 * PUT /api/orders/:id/status
 */
export const updateOrderStatus = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { id } = req.params;
        const { status } = req.body;

        const order = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                items: true,
                shippingAddress: true,
            },
        });

        // Add tracking entry
        await prisma.orderTracking.create({
            data: {
                orderId: order.id,
                status: `Status updated to ${status}`,
                notes: `Order status changed by admin`,
            },
        });

        logger.info(`Order ${order.orderNumber} status updated to ${status}`);

        res.json({
            success: true,
            message: 'Order status updated successfully',
            data: { order },
        });
    }
);

/**
 * Add order tracking information
 * POST /api/orders/:id/tracking
 */
export const addOrderTracking = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { id } = req.params;
        const { status, location, notes } = req.body;

        // Verify order exists
        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        // Create tracking entry
        const tracking = await prisma.orderTracking.create({
            data: {
                orderId: id,
                status,
                location,
                notes,
            },
        });

        logger.info(`Tracking added for order ${order.orderNumber}: ${status}`);

        res.status(201).json({
            success: true,
            message: 'Tracking information added successfully',
            data: { tracking },
        });
    }
);
