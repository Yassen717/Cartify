import axios from 'axios';

/** Retries allowed after the initial attempt for a failed read request. */
export const MAX_READ_RETRIES = 3;

/** Exponential backoff: 1s, 2s, 4s, ... capped at 15s. */
export const getRetryDelay = (attempt: number): number =>
    Math.min(1000 * 2 ** attempt, 15000);

export const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Only transient failures are worth retrying: network errors (no response
 * received, including timeouts) and 5xx responses. 4xx responses and
 * cancelled requests are never retried.
 */
export const isRetryableError = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) return false;
    if (error.code === 'ERR_CANCELED') return false;
    if (error.response) return error.response.status >= 500;
    return Boolean(error.request);
};

/**
 * Retry an async read with exponential backoff. Used for requests that do
 * not go through the shared axios instance (e.g. the CSRF warm-up call).
 */
export const fetchWithRetry = async <T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number) => void
): Promise<T> => {
    for (let attempt = 0; ; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt >= MAX_READ_RETRIES || !isRetryableError(error)) {
                throw error;
            }
            onRetry?.(attempt + 1);
            await sleep(getRetryDelay(attempt));
        }
    }
};
