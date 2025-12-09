import api from './api';

export interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    priceAtAdd: number;
    product: {
        id: string;
        name: string;
        price: number;
        images?: { url: string; isPrimary: boolean }[];
    };
    variant?: {
        id: string;
        name: string;
        price: number;
    };
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    subtotal: number;
    itemCount: number;
}

// Get user's cart
export const getCart = async (): Promise<{ success: boolean; data: { cart: Cart } }> => {
    const response = await api.get('/cart');
    return response.data;
};

// Add item to cart
export const addToCart = async (
    productId: string,
    quantity: number = 1,
    variantId?: string
): Promise<{ success: boolean; data: { cart: Cart } }> => {
    const response = await api.post('/cart/items', {
        productId,
        quantity,
        variantId,
    });
    return response.data;
};

// Update cart item quantity
export const updateCartItem = async (
    itemId: string,
    quantity: number
): Promise<{ success: boolean; message: string }> => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
};

// Remove item from cart
export const removeFromCart = async (
    itemId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
};

// Clear entire cart
export const clearCart = async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete('/cart');
    return response.data;
};
