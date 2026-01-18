import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Generate access token
export const generateAccessToken = (userId: string, email: string, role: string): string => {
    return jwt.sign(
        { userId, email, role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );
};

// Verify refresh token
export const verifyRefreshToken = (token: string): { userId: string } => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
};
