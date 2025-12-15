import { Router, Request, Response } from 'express';
import { redisClient } from '../config/redis';
import { invalidateCache } from '../middleware/cache';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Get cache statistics (Admin only)
router.get(
    '/stats',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (_req: Request, res: Response) => {
        const stats = await redisClient.getStats();

        res.json({
            success: true,
            data: stats,
        });
    })
);

// Clear all cache (Admin only)
router.delete(
    '/clear',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (_req: Request, res: Response) => {
        await invalidateCache.all();

        res.json({
            success: true,
            message: 'All cache cleared successfully',
        });
    })
);

// Clear product cache (Admin only)
router.delete(
    '/products',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (_req: Request, res: Response) => {
        await invalidateCache.products();

        res.json({
            success: true,
            message: 'Product cache cleared successfully',
        });
    })
);

// Clear category cache (Admin only)
router.delete(
    '/categories',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (_req: Request, res: Response) => {
        await invalidateCache.categories();

        res.json({
            success: true,
            message: 'Category cache cleared successfully',
        });
    })
);

export default router;
