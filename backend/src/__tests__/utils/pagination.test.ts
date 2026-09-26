import { describe, it, expect } from 'vitest';
import { parsePagination } from '../../utils/pagination';

describe('parsePagination', () => {
    it('returns defaults when params are missing', () => {
        expect(parsePagination({})).toEqual({ page: 1, limit: 10, skip: 0 });
    });

    it('caps limit at 100 to prevent unbounded queries', () => {
        const result = parsePagination({ page: '1', limit: '1000000' });
        expect(result.limit).toBe(100);
        expect(result.skip).toBe(0);
    });

    it('clamps page and limit to a minimum of 1', () => {
        const result = parsePagination({ page: '-5', limit: '-3' });
        expect(result.page).toBe(1);
        expect(result.limit).toBe(1);
        expect(result.skip).toBe(0);
    });

    it('treats zero as missing and falls back to defaults', () => {
        const result = parsePagination({ page: '0', limit: '0' });
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
    });

    it('falls back to defaults for non-numeric input', () => {
        const result = parsePagination({ page: 'abc', limit: 'xyz' });
        expect(result.page).toBe(1);
        expect(result.limit).toBe(10);
    });

    it('computes skip correctly', () => {
        const result = parsePagination({ page: '3', limit: '25' });
        expect(result).toEqual({ page: 3, limit: 25, skip: 50 });
    });
});
