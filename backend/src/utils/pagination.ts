const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

/**
 * Parse and clamp pagination query params.
 * `limit` is capped at MAX_LIMIT to prevent unbounded result sets.
 */
export const parsePagination = (query: {
    page?: unknown;
    limit?: unknown;
}): PaginationParams => {
    const page = Math.max(1, parseInt(String(query.page ?? ''), 10) || DEFAULT_PAGE);
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(String(query.limit ?? ''), 10) || DEFAULT_LIMIT)
    );

    return { page, limit, skip: (page - 1) * limit };
};
