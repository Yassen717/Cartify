import api from './api';

export interface Review {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    title: string;
    comment: string;
    verifiedPurchase: boolean;
    helpfulCount: number;
    unhelpfulCount: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
    };
    images?: Array<{ id: string; url: string }>;
}

export interface CreateReviewData {
    rating: number;
    title: string;
    comment: string;
    images?: string[];
}

/**
 * Create a product review
 */
export const createReview = async (productId: string, data: CreateReviewData) => {
    const response = await api.post<{ success: boolean; data: { review: Review } }>(
        `/products/${productId}/reviews`,
        data
    );
    return response.data.data.review;
};

/**
 * Update a review
 */
export const updateReview = async (id: string, data: Partial<CreateReviewData>) => {
    const response = await api.put<{ success: boolean; data: { review: Review } }>(
        `/products/reviews/${id}`,
        data
    );
    return response.data.data.review;
};

/**
 * Delete a review
 */
export const deleteReview = async (id: string) => {
    await api.delete(`/products/reviews/${id}`);
};

/**
 * Vote on a review
 */
export const voteReview = async (id: string, voteType: 'HELPFUL' | 'UNHELPFUL') => {
    const response = await api.post<{
        success: boolean;
        data: { helpfulCount: number; unhelpfulCount: number };
    }>(`/products/reviews/${id}/vote`, { voteType });
    return response.data.data;
};
