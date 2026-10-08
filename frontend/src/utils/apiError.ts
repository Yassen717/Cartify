/**
 * Extract a user-facing message from an API error.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
    const message = (error as { response?: { data?: { message?: unknown } } })
        ?.response?.data?.message;
    return typeof message === 'string' && message ? message : fallback;
};
