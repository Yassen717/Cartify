import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
export const getDashboardStats = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
        const [
            usersCount,
            productsCount,
            ordersCount,
            totalRevenue,
            recentOrders,
            lowStockProducts
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'CUSTOMER' } }),
            prisma.product.count(),
            prisma.order.count(),
            prisma.order.aggregate({
                _sum: {
                    total: true
                },
                where: {
                    status: {
                        not: 'CANCELLED'
                    },
                    paymentStatus: 'PAID'
                }
            }),
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.product.findMany({
                where: {
                    stockQty: {
                        lte: 5
                    }
                },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    stockQty: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    }
                }
            })
        ]);

        res.json({
            success: true,
            data: {
                counts: {
                    users: usersCount,
                    products: productsCount,
                    orders: ordersCount
                },
                revenue: totalRevenue._sum.total || 0,
                recentOrders,
                lowStockProducts
            }
        });
    }
);

/**
 * Get all orders (Admin)
 * GET /api/admin/orders
 */
export const getAllOrders = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { page = '1', limit = '10', status } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status) {
            where.status = status as string;
        }

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    _count: {
                        select: { items: true }
                    }
                }
            }),
            prisma.order.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        });
    }
);

/**
 * Get all users (Admin)
 * GET /api/admin/users
 */
export const getAllUsers = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { page = '1', limit = '10', search } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (search) {
            where.OR = [
                { email: { contains: search as string } },
                { firstName: { contains: search as string } },
                { lastName: { contains: search as string } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: { orders: true }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
        });
    }
);
