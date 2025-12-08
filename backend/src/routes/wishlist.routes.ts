import { Router } from 'express';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
} from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.post('/:productId/move-to-cart', moveToCart);

export default router;
