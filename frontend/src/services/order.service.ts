import api from './api';

// ============================================================================
// TYPES
// ============================================================================

export interface Order {
    id: string;
    orderNumber: string;
    status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    shippingAddress?: Address;
    billingAddress?: Address;
    tracking?: OrderTracking[];
}

export interface OrderItem {
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    subtotal: number;
    product: {
        id: string;
        name: string;
        slug: string;
        images?: Array<{ url: string }>;
    };
    variant?: {
        name: string;
        attributes: any;
    };
}

export interface Address {
    id?: string;
    type: 'SHIPPING' | 'BILLING' | 'BOTH';
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
}

export interface OrderTracking {
    id: string;
    status: string;
    location?: string;
    notes?: string;
    timestamp: string;
}

export interface CreateOrderData {
    shippingAddressId?: string;
    billingAddressId?: string;
    shippingAddress?: Omit<Address, 'id'>;
    billingAddress?: Omit<Address, 'id'>;
    paymentMethod: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Create a new order from cart
 */
export const createOrder = async (data: CreateOrderData) => {
    const response = await api.post<{ success: boolean; data: { order: Order } }>(
        '/orders',
        data
    );
    return response.data.data.order;
};

/**
 * Get user's orders
 */
export const getOrders = async (page = 1, limit = 10) => {
    const response = await api.get<{
        success: boolean;
        data: {
            orders: Order[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
            };
        };
    }>('/orders', {
        params: { page, limit },
    });
    return response.data.data;
};

/**
 * Get single order by ID
 */
export const getOrderById = async (id: string) => {
    const response = await api.get<{ success: boolean; data: { order: Order } }>(
        `/orders/${id}`
    );
    return response.data.data.order;
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (
    id: string,
    status: Order['status']
) => {
    const response = await api.put<{ success: boolean; data: { order: Order } }>(
        `/orders/${id}/status`,
        { status }
    );
    return response.data.data.order;
};

/**
 * Add order tracking (Admin only)
 */
export const addOrderTracking = async (
    id: string,
    data: { status: string; location?: string; notes?: string }
) => {
    const response = await api.post<{
        success: boolean;
        data: { tracking: OrderTracking };
    }>(`/orders/${id}/tracking`, data);
    return response.data.data.tracking;
};
