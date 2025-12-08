import { Router } from 'express';
import {
    getCategories,
    getCategoryById,
    getProductsByCategory,
} from '../controllers/categories.controller';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.get('/:slug/products', getProductsByCategory);

export default router;
