import * as dotenv from 'dotenv';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    CORS_ORIGIN: string;
    BASE_URL: string;
    REDIS_URL?: string;
}

/**
 * Validate and return environment configuration
 * Throws error if required variables are missing
 */
export const validateEnv = (): EnvConfig => {
    const requiredVars = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
    ];

    const missing: string[] = [];

    for (const varName of requiredVars) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }

    if (missing.length > 0) {
        const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    // Validate JWT secret length (should be at least 32 bytes = 64 hex chars)
    if (process.env.JWT_SECRET!.length < 64) {
        const errorMsg = 'JWT_SECRET must be at least 64 characters (32 bytes). Generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"';
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    if (process.env.JWT_REFRESH_SECRET!.length < 64) {
        const errorMsg = 'JWT_REFRESH_SECRET must be at least 64 characters (32 bytes). Generate with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"';
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    // Validate production-specific requirements
    if (process.env.NODE_ENV === 'production') {
        if (process.env.DATABASE_URL?.includes('sqlite') || process.env.DATABASE_URL?.includes('file:')) {
            logger.warn('⚠️  WARNING: SQLite is not recommended for production. Use PostgreSQL or MySQL.');
        }

        if (process.env.CORS_ORIGIN === 'http://localhost:5173' || !process.env.CORS_ORIGIN?.startsWith('https://')) {
            logger.warn('⚠️  WARNING: CORS_ORIGIN should be set to your production HTTPS domain.');
        }

        if (!process.env.REDIS_URL) {
            logger.warn('⚠️  WARNING: REDIS_URL not set. Caching will be disabled in production.');
        }
    }

    return {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: parseInt(process.env.PORT || '3000', 10),
        DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
        JWT_SECRET: process.env.JWT_SECRET!,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
        JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
        BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
        REDIS_URL: process.env.REDIS_URL,
    };
};

// Validate and export config
export const env = validateEnv();

// Log configuration (sanitized)
if (process.env.NODE_ENV !== 'test') {
    logger.info('🔧 Environment configuration loaded:');
    logger.info(`   NODE_ENV: ${env.NODE_ENV}`);
    logger.info(`   PORT: ${env.PORT}`);
    logger.info(`   DATABASE: ${env.DATABASE_URL.includes('postgresql') ? 'PostgreSQL' : env.DATABASE_URL.includes('mysql') ? 'MySQL' : 'SQLite'}`);
    logger.info(`   JWT_SECRET: ${env.JWT_SECRET.substring(0, 8)}...${env.JWT_SECRET.substring(env.JWT_SECRET.length - 8)} (${env.JWT_SECRET.length} chars)`);
    logger.info(`   CORS_ORIGIN: ${env.CORS_ORIGIN}`);
    logger.info(`   REDIS: ${env.REDIS_URL ? '✅ Enabled' : '❌ Disabled'}`);
}
