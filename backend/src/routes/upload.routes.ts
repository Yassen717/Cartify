import { Router } from 'express';
import {
    uploadProductImage,
    uploadProductImages,
    deleteUploadedImage,
} from '../controllers/upload.controller';
import { upload } from '../middleware/upload';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Upload routes - require authentication and admin role
router.post(
    '/product-image',
    authenticate,
    authorize('ADMIN'),
    upload.single('image'),
    uploadProductImage
);

router.post(
    '/product-images',
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
