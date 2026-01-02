import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';
import { vi, beforeEach } from 'vitest';

// Mock Prisma Client
vi.mock('../config/database', () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}));

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
