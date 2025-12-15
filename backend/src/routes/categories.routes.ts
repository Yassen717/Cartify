import { Router } from 'express';
import {
    getCategories,
    getCategoryById,
    getProductsByCategory,
} from '../controllers/categories.controller';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// Public routes with caching
router.get('/', cacheMiddleware(1800), getCategories); // 30 min cache
router.get('/:id', cacheMiddleware(1800), getCategoryById); // 30 min cache
router.get('/:slug/products', cacheMiddleware(300), getProductsByCategory); // 5 min cache

export default router;
