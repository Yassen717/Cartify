import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

// Cache key generation
export const generateCacheKey = (req: Request): string => {
    const { path, query, params } = req;
    const queryString = JSON.stringify(query);
    const paramsString = JSON.stringify(params);
    return `cache:${path}:${queryString}:${paramsString}`;
};

// Cache middleware factory
export const cacheMiddleware = (ttl: number = 300) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Skip if Redis is not ready
        if (!redisClient.isReady()) {
            return next();
        }

        const cacheKey = generateCacheKey(req);

        try {
            // Try to get cached response
            const cachedData = await redisClient.get(cacheKey);

            if (cachedData) {
                logger.debug(`Cache HIT: ${cacheKey}`);
                const data = JSON.parse(cachedData);
                return res.json(data);
            }

            logger.debug(`Cache MISS: ${cacheKey}`);

            // Store original res.json function
            const originalJson = res.json.bind(res);

            // Override res.json to cache the response
            res.json = function (data: any) {
                // Cache the response
                redisClient.set(cacheKey, JSON.stringify(data), ttl).catch((err) => {
                    logger.error('Failed to cache response:', err);
                });

                // Call original json function
                return originalJson(data);
            };

            next();
        } catch (error) {
            logger.error('Cache middleware error:', error);
            next();
        }
    };
};

// Cache invalidation helpers
export const invalidateCache = {
    // Invalidate all product-related cache
    products: async (): Promise<void> => {
        try {
            const deleted = await redisClient.delPattern('cache:/api/products*');
            logger.info(`Invalidated ${deleted} product cache entries`);
        } catch (error) {
            logger.error('Failed to invalidate product cache:', error);
        }
    },

    // Invalidate specific product cache
    product: async (productId: string): Promise<void> => {
        try {
            await redisClient.delPattern(`cache:/api/products/${productId}*`);
            await redisClient.delPattern('cache:/api/products?*');
            logger.info(`Invalidated cache for product ${productId}`);
        } catch (error) {
            logger.error('Failed to invalidate product cache:', error);
        }
    },

    // Invalidate category cache
    categories: async (): Promise<void> => {
        try {
            const deleted = await redisClient.delPattern('cache:/api/categories*');
            logger.info(`Invalidated ${deleted} category cache entries`);
        } catch (error) {
            logger.error('Failed to invalidate category cache:', error);
        }
    },

    // Invalidate cart cache for a user
    cart: async (userId: string): Promise<void> => {
        try {
            await redisClient.del(`cache:/api/cart:${userId}`);
            logger.info(`Invalidated cart cache for user ${userId}`);
        } catch (error) {
            logger.error('Failed to invalidate cart cache:', error);
        }
    },

    // Invalidate all cache
    all: async (): Promise<void> => {
        try {
            await redisClient.flushAll();
            logger.info('Invalidated all cache');
        } catch (error) {
            logger.error('Failed to invalidate all cache:', error);
        }
    },
};

// Cache warming - preload frequently accessed data
export const warmCache = async (): Promise<void> => {
    if (!redisClient.isReady()) {
        logger.warn('Redis not ready, skipping cache warming');
        return;
    }

    logger.info('Starting cache warming...');
    
    try {
        // Add cache warming logic here
        // For example: preload popular products, categories, etc.
        logger.info('Cache warming completed');
    } catch (error) {
        logger.error('Cache warming failed:', error);
    }
};
