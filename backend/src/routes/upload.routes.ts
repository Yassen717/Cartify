import { Router } from 'express';
import {
    uploadProductImage,
    uploadProductImages,
    deleteUploadedImage,
} from '../controllers/upload.controller';
import { upload, uploadLimiter } from '../middleware/upload';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Upload routes - require authentication, admin role, and rate limiting
router.post(
    '/product-image',
    uploadLimiter,
    authenticate,
    authorize('ADMIN'),
    upload.single('image'),
    uploadProductImage
);

router.post(
    '/product-images',
    uploadLimiter,
    authenticate,
    authorize('ADMIN'),
    upload.array('images', 5),
    uploadProductImages
);

router.delete(
    '/:filename',
    authenticate,
    authorize('ADMIN'),
    deleteUploadedImage
);

export default router;
