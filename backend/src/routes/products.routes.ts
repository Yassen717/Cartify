import { Router } from 'express';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductReviews,
} from '../controllers/products.controller';
import {
    createReview,
    updateReview,
    deleteReview,
    voteReview,
} from '../controllers/reviews.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
    createReviewSchema,
    updateReviewSchema,
    voteReviewSchema,
} from '../utils/validation.schemas';

const router = Router();

// Public routes
router.get('/', validateQuery(productQuerySchema), getProducts);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);

// Review routes
router.post('/:id/reviews', authenticate, validateBody(createReviewSchema), createReview);
router.put('/reviews/:id', authenticate, validateBody(updateReviewSchema), updateReview);
router.delete('/reviews/:id', authenticate, deleteReview);
router.post('/reviews/:id/vote', authenticate, validateBody(voteReviewSchema), voteReview);

// Admin routes - require authentication and admin role
router.post('/', authenticate, authorize('ADMIN'), validateBody(createProductSchema), createProduct);
router.put('/:id', authenticate, authorize('ADMIN'), validateBody(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteProduct);

export default router;

