import api from './api';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    comparePrice?: number;
    stockQty: number;
    sku: string;
    brand?: string;
    categoryId: string;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
    images?: {
        id: string;
        url: string;
        altText: string;
        isPrimary: boolean;
    }[];
    averageRating?: number;
    reviewCount?: number;
}

export interface ProductsResponse {
    success: boolean;
    data: {
        products: Product[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

export interface ProductFilters {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Get all products with filters
export const getProducts = async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const params = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, value.toString());
            }
        });
    }

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
};

// Get single product by ID
export const getProductById = async (id: string): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

// Get product reviews
export const getProductReviews = async (
    id: string,
    page = 1,
    limit = 10
): Promise<any> => {
    const response = await api.get(`/products/${id}/reviews`, {
        params: { page, limit },
    });
    return response.data;
};
