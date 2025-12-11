import { Router } from 'express';
import {
    register,
    login,
    refresh,
    logout,
    getProfile,
    updateProfile,
    changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    updateProfileSchema,
    changePasswordSchema,
} from '../utils/validation.schemas';

const router = Router();

// Public routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshTokenSchema), refresh);
router.post('/logout', logout);

// Protected routes - require authentication
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);
router.put('/change-password', authenticate, validateBody(changePasswordSchema), changePassword);

export default router;

