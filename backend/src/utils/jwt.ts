import jwt from 'jsonwebtoken';

// Generate access token
export const generateAccessToken = (userId: string, email: string, role: string): string => {
    return jwt.sign(
        { userId, email, role },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
    );
};

// Verify refresh token
export const verifyRefreshToken = (token: string): { userId: string } => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
};
