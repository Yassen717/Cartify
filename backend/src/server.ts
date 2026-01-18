import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';
import cookieParser from 'cookie-parser';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger, logger } from './utils/logger';
import { setCsrfToken, verifyCsrfToken } from './middleware/csrf';
import prisma from './config/database';
import { redisClient } from './config/redis';
import { warmCache } from './middleware/cache';
import { env } from './config/env'; // Validates environment variables on import

const app: Application = express();
const PORT = env.PORT;

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet - Security headers with Content Security Policy
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", env.CORS_ORIGIN],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: env.NODE_ENV === 'production' ? [] : null,
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    },
    frameguard: {
        action: 'deny',
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
    },
}));

// CORS Configuration
const corsOptions = {
    origin: env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ============================================================================
// LOGGING & PARSING MIDDLEWARE
// ============================================================================

// Morgan - HTTP request logger (only in development)
if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Custom request logger
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CSRF token endpoint (MUST be before rate limiting)
app.get('/api/csrf-token', setCsrfToken, (_req, res) => {
    res.json({ success: true, csrfToken: res.locals.csrfToken });
});

// Rate limiting - General API (disabled in development for easier testing)
if (env.NODE_ENV === 'production') {
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use('/api/', limiter);
    logger.info('⚡ Rate limiting enabled for production');
} else {
    logger.info('⚡ Rate limiting disabled for development');
}

// Rate limiting - Auth endpoints (strict in production)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === 'production' ? 5 : 10000,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
});

// ============================================================================
// STATIC FILES
// ============================================================================

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// HTTPS enforcement in production
if (env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(301, `https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
    logger.info('🔒 HTTPS enforcement enabled');
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/health', async (_req, res) => {
    const redisStatus = redisClient.isReady() ? 'connected' : 'disconnected';

    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: 'connected',
            redis: redisStatus,
        },
    });
});

// API Info endpoint
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Cartify API Server',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            api: '/api',
        },
    });
});

// ============================================================================
// API ROUTES
// ============================================================================

import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import categoriesRoutes from './routes/categories.routes';
import cartRoutes from './routes/cart.routes';
import wishlistRoutes from './routes/wishlist.routes';
import uploadRoutes from './routes/upload.routes';
import orderRoutes from './routes/order.routes';

// Auth routes with strict rate limiting and CSRF protection
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', verifyCsrfToken, authRoutes);

// Product routes
app.use('/api/products', productsRoutes);

// Category routes
app.use('/api/categories', categoriesRoutes);

// Cart routes with CSRF protection
app.use('/api/cart', verifyCsrfToken, cartRoutes);

// Wishlist routes with CSRF protection
app.use('/api/wishlist', verifyCsrfToken, wishlistRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);

// Order routes with CSRF protection
app.use('/api/orders', verifyCsrfToken, orderRoutes);

import adminRoutes from './routes/admin.routes';
app.use('/api/admin', verifyCsrfToken, adminRoutes);

// Cache management routes
import cacheRoutes from './routes/cache.routes';
app.use('/api/cache', cacheRoutes);

// API Routes will be added here
// etc...

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Graceful shutdown
const gracefulShutdown = async () => {
    logger.info('Starting graceful shutdown...');

    try {
        await redisClient.disconnect();
        logger.info('Redis connection closed');

        await prisma.$disconnect();
        logger.info('Database connection closed');

        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const server = app.listen(PORT, async () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`📍 Health check: http://localhost:${PORT}/health`);
    logger.info(`🌍 Environment: ${env.NODE_ENV}`);
    logger.info(`🔒 CORS enabled for: ${env.CORS_ORIGIN}`);

    // Connect to Redis
    await redisClient.connect();

    // Warm cache if Redis is connected
    if (redisClient.isReady()) {
        await warmCache();
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Rejection:', reason);
    server.close(() => {
        process.exit(1);
    });
});

export default app;
