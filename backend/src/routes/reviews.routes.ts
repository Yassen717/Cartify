import { Router } from 'express';
import { createReview, updateReview, deleteReview, voteReview } from '../controllers/reviews.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createReviewSchema, updateReviewSchema, voteReviewSchema } from '../utils/validation.schemas';

const router = Router();

// Create review - must be authenticated
router.post('/:productId/reviews', authenticate, validateBody(createReviewSchema), createReview);

// Update review - must own the review
router.put('/:id', authenticate, validateBody(updateReviewSchema), updateReview);

// Delete review - must own the review or be admin
router.delete('/:id', authenticate, deleteReview);

// Vote on review - must be authenticated
router.post('/:id/vote', authenticate, validateBody(voteReviewSchema), voteReview);

export default router;
