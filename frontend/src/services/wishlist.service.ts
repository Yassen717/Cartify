import api from './api';

export interface WishlistItem {
    id: string;
    userId: string;
    productId: string;
    product: {
        id: string;
        name: string;
        price: number;
        comparePrice?: number;
        stockQty: number;
        images?: { url: string; isPrimary: boolean }[];
    };
    createdAt: string;
}

export interface Wishlist {
    items: WishlistItem[];
    itemCount: number;
}

// Get user's wishlist
export const getWishlist = async (): Promise<{ success: boolean; data: { wishlist: Wishlist } }> => {
    const response = await api.get('/wishlist');
    return response.data;
};

// Add item to wishlist
export const addToWishlist = async (
    productId: string
): Promise<{ success: boolean; data: { wishlist: Wishlist } }> => {
    const response = await api.post('/wishlist/items', { productId });
    return response.data;
};

// Remove item from wishlist
export const removeFromWishlist = async (
    itemId: string
): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/wishlist/items/${itemId}`);
    return response.data;
};

// Move item from wishlist to cart
export const moveToCart = async (
    itemId: string,
    quantity: number = 1
): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/wishlist/items/${itemId}/move-to-cart`, { quantity });
    return response.data;
};
