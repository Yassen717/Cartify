import api from './api';

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parentId?: string;
    productCount?: number;
}

export interface CategoriesResponse {
    success: boolean;
    data: {
        categories: Category[];
    };
}

// Get all categories
export const getCategories = async (): Promise<CategoriesResponse> => {
    const response = await api.get('/categories');
    return response.data;
};

// Get single category by ID
export const getCategoryById = async (id: string): Promise<{ success: boolean; data: { category: Category } }> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
};

// Get products by category
export const getProductsByCategory = async (
    categoryId: string,
    page = 1,
    limit = 12
): Promise<any> => {
    const response = await api.get(`/categories/${categoryId}/products`, {
        params: { page, limit },
    });
    return response.data;
};
