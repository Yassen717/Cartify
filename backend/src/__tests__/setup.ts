import type { PrismaClient } from '@prisma/client';
import { vi, beforeEach } from 'vitest';

// Mock Prisma Client
vi.mock('../config/database', async () => {
    const { mockDeep } = await import('vitest-mock-extended');
    return {
        __esModule: true,
        default: mockDeep<PrismaClient>(),
    };
});

// Mock logger to avoid cluttering test output
vi.mock('../utils/logger', () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});
