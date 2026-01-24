import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

// Generate access token
export const generateAccessToken = (userId: string, email: string, role: string): string => {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
    return jwt.sign(
        { userId, email, role },
        env.JWT_SECRET,
        options
    );
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
    const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };
    return jwt.sign(
        { userId },
        env.JWT_REFRESH_SECRET,
        options
    );
};

// Verify refresh token
export const verifyRefreshToken = (token: string): { userId: string } => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
};
