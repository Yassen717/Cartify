import { create } from 'zustand';
import * as wishlistService from '../services/wishlist.service';
import type { Wishlist } from '../services/wishlist.service';
import toast from 'react-hot-toast';

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
            // Backend returns array directly, convert to expected format
            const wishlistArray = Array.isArray(response.data.wishlist) 
                ? response.data.wishlist 
                : response.data.wishlist?.items || [];
            set({ 
                wishlist: {
                    items: wishlistArray,
                    itemCount: wishlistArray.length
                }, 
                isLoading: false 
            });
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
            const wishlistArray = Array.isArray(response.data.wishlist) 
                ? response.data.wishlist 
                : response.data.wishlist?.items || [];
            set({ 
                wishlist: {
                    items: wishlistArray,
                    itemCount: wishlistArray.length
                }, 
                isLoading: false 
            });
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
            set({ wishlist: response.data.wishlist, isLoading: false });
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
            set({ wishlist: response.data.wishlist, isLoading: false });
            toast.success('Moved to cart');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to move to cart';
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },
}));
