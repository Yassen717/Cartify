import { describe, it, expect, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { fetchWithRetry, getRetryDelay, isRetryableError } from '../../utils/retry';

const axiosError = (opts: { code?: string; status?: number; hasRequest?: boolean } = {}) =>
    new AxiosError(
        'boom',
        opts.code,
        { headers: new AxiosHeaders() },
        opts.hasRequest === false ? undefined : {},
        opts.status === undefined ? undefined : ({ status: opts.status } as never)
    );

describe('isRetryableError', () => {
    it('retries network errors with no response', () => {
        expect(isRetryableError(axiosError({ code: 'ERR_NETWORK' }))).toBe(true);
        expect(isRetryableError(axiosError({ code: 'ECONNABORTED' }))).toBe(true);
    });

    it('retries 5xx responses', () => {
        expect(isRetryableError(axiosError({ status: 500 }))).toBe(true);
        expect(isRetryableError(axiosError({ status: 503 }))).toBe(true);
    });

    it('does not retry 4xx responses', () => {
        expect(isRetryableError(axiosError({ status: 400 }))).toBe(false);
        expect(isRetryableError(axiosError({ status: 404 }))).toBe(false);
    });

    it('does not retry cancellations or non-axios errors', () => {
        expect(isRetryableError(axiosError({ code: 'ERR_CANCELED' }))).toBe(false);
        expect(isRetryableError(new Error('boom'))).toBe(false);
    });
});

describe('getRetryDelay', () => {
    it('backs off exponentially and caps at 15s', () => {
        expect(getRetryDelay(0)).toBe(1000);
        expect(getRetryDelay(1)).toBe(2000);
        expect(getRetryDelay(2)).toBe(4000);
        expect(getRetryDelay(10)).toBe(15000);
    });
});

describe('fetchWithRetry', () => {
    it('retries a transient failure then resolves', async () => {
        const fn = vi.fn()
            .mockRejectedValueOnce(axiosError({ code: 'ERR_NETWORK' }))
            .mockResolvedValue('ok');
        const onRetry = vi.fn();

        await expect(fetchWithRetry(fn, onRetry)).resolves.toBe('ok');
        expect(fn).toHaveBeenCalledTimes(2);
        expect(onRetry).toHaveBeenCalledWith(1);
    });

    it('does not retry a 4xx failure', async () => {
        const fn = vi.fn().mockRejectedValue(axiosError({ status: 404 }));

        await expect(fetchWithRetry(fn)).rejects.toBeInstanceOf(AxiosError);
        expect(fn).toHaveBeenCalledTimes(1);
    });
});
