import { create } from 'zustand';
import * as wishlistService from '../services/wishlist.service';
import type { Wishlist } from '../services/wishlist.service';
import toast from 'react-hot-toast';

const normalizeWishlist = (payload: any): Wishlist => {
    const wishlistPayload = payload?.wishlist ?? payload;

    if (Array.isArray(wishlistPayload)) {
        return {
            items: wishlistPayload,
            itemCount: wishlistPayload.length,
        };
    }

    if (wishlistPayload && Array.isArray(wishlistPayload.items)) {
        return {
            items: wishlistPayload.items,
            itemCount: typeof wishlistPayload.itemCount === 'number'
                ? wishlistPayload.itemCount
                : wishlistPayload.items.length,
        };
    }

    const items = Array.isArray(wishlistPayload?.data?.wishlist)
        ? wishlistPayload.data.wishlist
        : [];

    return {
        items,
        itemCount: items.length,
    };
};

interface WishlistState {
    wishlist: Wishlist | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchWishlist: () => Promise<void>;
    addItem: (productId: string) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    moveToCart: (productId: string, quantity?: number) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set) => ({
    wishlist: null,
    isLoading: false,
    error: null,

    fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await wishlistService.getWishlist();
            set({ wishlist: normalizeWishlist(response.data), isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch wishlist',
                isLoading: false,
            });
        }
    },

    addItem: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
            await wishlistService.addToWishlist(productId);
            // Refetch wishlist to get updated data
            const response = await wishlistService.getWishlist();
            set({ wishlist: normalizeWishlist(response.data), isLoading: false });
            toast.success('Added to wishlist');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to add to wishlist';
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },

    removeItem: async (productId: string) => {
        set({ isLoading: true, error: null });
        try {
            await wishlistService.removeFromWishlist(productId);
            // Refetch wishlist
            const response = await wishlistService.getWishlist();
            set({ wishlist: normalizeWishlist(response.data), isLoading: false });
            toast.success('Removed from wishlist');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to remove item';
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },

    moveToCart: async (productId: string, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
            await wishlistService.moveToCart(productId, quantity);
            // Refetch wishlist
            const response = await wishlistService.getWishlist();
            set({ wishlist: normalizeWishlist(response.data), isLoading: false });
            toast.success('Moved to cart');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to move to cart';
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },
}));
