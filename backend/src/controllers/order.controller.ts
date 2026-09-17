import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { OrderStatus, Prisma } from '@prisma/client';
import type { AddressInput } from '../utils/validation.schemas';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';
import { BadRequestError, NotFoundError, UnauthorizedError, ConflictError } from '../utils/errors';
import { logger } from '../utils/logger';

const estimatedTaxRate = new Prisma.Decimal('0.10');
const inventoryReservationStatus = 'Inventory Reserved';

const roundMoney = (value: Prisma.Decimal) =>
    value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

const withSerializableRetry = async <T>(operation: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> => {
    for (let attempt = 0; ; attempt += 1) {
        try {
            return await prisma.$transaction(operation, {
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            });
        } catch (error) {
            if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2034') {
                throw error;
            }
            if (attempt >= 2) {
                throw new ConflictError('Concurrent order update. Please try again.');
            }
            await new Promise((resolve) => setTimeout(resolve, 10 * (attempt + 1)));
        }
    }
};

const resolveAddress = async (
    tx: Prisma.TransactionClient,
    userId: string,
    addressId: string | undefined,
    address: AddressInput | undefined
): Promise<string> => {
    if (addressId) {
        const ownedAddress = await tx.address.findFirst({
            where: { id: addressId, userId },
            select: { id: true },
        });
        if (!ownedAddress) {
            throw new BadRequestError('Address not found or not owned by user');
        }
        return ownedAddress.id;
    }
    if (!address) {
        throw new BadRequestError('Shipping and billing addresses are required');
    }
    const createdAddress = await tx.address.create({
        data: {
            type: address.type,
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isDefault: address.isDefault,
            userId,
        },
    });
    return createdAddress.id;
};

export const createOrder = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError('Not authenticated');
        }

        const userId = req.user.id;
        const {
            shippingAddressId,
            billingAddressId,
            shippingAddress,
            billingAddress,
            paymentMethod,
        } = req.body;

        const orderNumber = `ORD-${randomUUID()}`;
        const order = await withSerializableRetry(async (tx) => {
            const cart = await tx.cart.findUnique({
                where: { userId },
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

            for (const item of cart.items) {
                if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0 || item.quantity > 2147483647) {
                    throw new BadRequestError(`Invalid quantity for "${item.product.name}"`);
                }
                if ((item.variantId && (!item.variant || item.variant.id !== item.variantId || item.variant.productId !== item.productId)) ||
                    (!item.variantId && item.variant)) {
                    throw new BadRequestError('Variant does not belong to product');
                }
                const inventory = item.variant ?? item.product;
                if (inventory.stockQty < item.quantity) {
                    throw new ConflictError(
                        `Insufficient stock for "${inventory.name}". Requested: ${item.quantity}. Please refresh your cart.`
                    );
                }
            }

            const shippingAddrId = await resolveAddress(tx, userId, shippingAddressId, shippingAddress);
            const billingAddrId = await resolveAddress(tx, userId, billingAddressId, billingAddress);

            const items = cart.items.map((item) => {
                const currentPrice = new Prisma.Decimal(item.variant ? item.variant.price : item.product.price);
                if (!currentPrice.isFinite() || currentPrice.isNegative()) {
                    throw new BadRequestError('Invalid product price');
                }
                const price = roundMoney(currentPrice);
                return {
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price,
                    subtotal: roundMoney(price.times(item.quantity)),
                };
            });
            const subtotal = roundMoney(items.reduce((sum, item) => sum.plus(item.subtotal), new Prisma.Decimal(0)));

            const tax = roundMoney(subtotal.times(estimatedTaxRate));
            const shippingCost = subtotal.greaterThan(new Prisma.Decimal(50))
                ? new Prisma.Decimal(0)
                : new Prisma.Decimal('9.99');
            const total = roundMoney(subtotal.plus(tax).plus(shippingCost));

            const stockUpdates: Array<Prisma.PrismaPromise<{ count: number }>> = cart.items.map((item) =>
                item.variant
                    ? tx.productVariant.updateMany({
                          where: {
                              id: item.variant.id,
                              productId: item.productId,
                              stockQty: { gte: item.quantity },
                          },
                          data: { stockQty: { decrement: item.quantity } },
                      })
                    : tx.product.updateMany({
                          where: {
                              id: item.productId,
                              stockQty: { gte: item.quantity },
                          },
                          data: { stockQty: { decrement: item.quantity } },
                      })
            );

            const stockResults = await Promise.all(stockUpdates);
            for (let index = 0; index < cart.items.length; index += 1) {
                const item = cart.items[index];
                if (stockResults[index].count === 0) {
                    const itemName = item.variant ? item.variant.name : item.product.name;
                    throw new ConflictError(
                        `Insufficient stock for "${itemName}". Requested: ${item.quantity}. Please refresh your cart.`
                    );
                }
            }

            const createdOrder = await tx.order.create({
                data: {
                    userId,
                    orderNumber,
                    status: OrderStatus.PENDING,
                    paymentStatus: 'PENDING',
                    subtotal,
                    tax,
                    shippingCost,
                    total,
                    shippingAddressId: shippingAddrId,
                    billingAddressId: billingAddrId,
                    items: { create: items },
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

            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            await tx.orderTracking.create({
                data: {
                    orderId: createdOrder.id,
                    status: 'Order Placed',
                    notes: `Order created with payment method: ${paymentMethod}`,
                },
            });

            await tx.orderTracking.create({
                data: {
                    orderId: createdOrder.id,
                    status: inventoryReservationStatus,
                    notes: 'Stock decremented atomically at checkout',
                },
            });

            return createdOrder;
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
        if (typeof id !== 'string') {
            throw new BadRequestError('Invalid order ID');
        }

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
        if (typeof id !== 'string') {
            throw new BadRequestError('Invalid order ID');
        }
        const { status } = req.body as { status: OrderStatus };

        if (!Object.values(OrderStatus).includes(status)) {
            throw new BadRequestError('Invalid order status');
        }

        const order = await withSerializableRetry(async (tx) => {
            const existing = await tx.order.findUnique({
                where: { id },
                include: { items: true, shippingAddress: true },
            });

            if (!existing) {
                throw new NotFoundError('Order not found');
            }

            if (existing.status === status) {
                return existing;
            }
            const stages: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
            if (existing.status === OrderStatus.CANCELLED || existing.status === OrderStatus.DELIVERED ||
                (status === OrderStatus.CANCELLED && existing.status === OrderStatus.SHIPPED) ||
                (status !== OrderStatus.CANCELLED && stages.indexOf(status) < stages.indexOf(existing.status))) {
                throw new ConflictError('Invalid order status transition');
            }

            if (status === OrderStatus.CANCELLED) {
                const reservation = await tx.orderTracking.findFirst({
                    where: { orderId: id, status: inventoryReservationStatus },
                    select: { id: true },
                });
                if (!reservation) {
                    throw new ConflictError('Legacy order inventory must be reconciled before cancellation');
                }
                for (const item of existing.items) {
                    if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) {
                        throw new ConflictError('Invalid order item quantity');
                    }
                    if (item.variantId) {
                        const restored = await tx.productVariant.updateMany({
                            where: { id: item.variantId, productId: item.productId },
                            data: { stockQty: { increment: item.quantity } },
                        });
                        if (restored.count !== 1) {
                            throw new ConflictError('Invalid order variant');
                        }
                    } else {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stockQty: { increment: item.quantity } },
                        });
                    }
                }
            }

            const updated = await tx.order.update({
                where: { id },
                data: { status },
                include: {
                    items: true,
                    shippingAddress: true,
                },
            });

            await tx.orderTracking.create({
                data: {
                    orderId: updated.id,
                    status: `Status updated to ${status}`,
                    notes: 'Order status changed by admin',
                },
            });

            return updated;
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
        if (typeof id !== 'string') {
            throw new BadRequestError('Invalid order ID');
        }
        const { status, location, notes } = req.body;
        if (status === inventoryReservationStatus) {
            throw new BadRequestError('Inventory tracking is server controlled');
        }

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
