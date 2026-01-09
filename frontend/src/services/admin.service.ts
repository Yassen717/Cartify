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

export interface DashboardStats {
    counts: {
        users: number;
        products: number;
        orders: number;
    };
    revenue: number;
    recentOrders: any[];
    lowStockProducts: Partial<Product>[];
}

export interface AdminOrder {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    _count: {
        items: number;
    };
}

export interface AdminUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    createdAt: string;
    _count: {
        orders: number;
    };
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<{ success: boolean; data: DashboardStats }> => {
    const response = await api.get('/admin/stats');
    return response.data;
};

// Get all orders
export const getAllOrders = async (
    page = 1,
    limit = 10,
    status?: string
): Promise<{ success: boolean; data: { orders: AdminOrder[]; pagination: any } }> => {
    const params: any = { page, limit };
    if (status) params.status = status;

    const response = await api.get('/admin/orders', { params });
    return response.data;
};

// Get all users
export const getAllUsers = async (
    page = 1,
    limit = 10,
    search?: string
): Promise<{ success: boolean; data: { users: AdminUser[]; pagination: any } }> => {
    const params: any = { page, limit };
    if (search) params.search = search;

    const response = await api.get('/admin/users', { params });
    return response.data;
};
