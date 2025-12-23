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
    pendingOperations: Set<string>; // Track pending productIds

    // Actions
    fetchWishlist: () => Promise<void>;
    addItem: (productId: string) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    moveToCart: (productId: string, quantity?: number) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlist: null,
    isLoading: false,
    error: null,
    pendingOperations: new Set<string>(),

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
        // Prevent duplicate concurrent requests for the same product
        const { pendingOperations, wishlist } = get();

        if (pendingOperations.has(productId)) {
            return; // Already processing this product
        }

        // Check if already in wishlist
        if (wishlist?.items?.some(item => item.productId === productId)) {
            toast.error('Already in wishlist');
            return;
        }

        // Add to pending operations
        set({
            pendingOperations: new Set(pendingOperations).add(productId),
            error: null
        });

        try {
            await wishlistService.addToWishlist(productId);
            // Refetch wishlist to get updated data
            const response = await wishlistService.getWishlist();
            set({ wishlist: normalizeWishlist(response.data) });
            toast.success('Added to wishlist');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to add to wishlist';
            set({ error: errorMsg });
            toast.error(errorMsg);
            throw error;
        } finally {
            // Remove from pending operations
            const newPending = new Set(get().pendingOperations);
            newPending.delete(productId);
            set({ pendingOperations: newPending });
        }
    },

    removeItem: async (productId: string) => {
        // Prevent duplicate concurrent requests for the same product
        const { pendingOperations, wishlist } = get();

        if (pendingOperations.has(productId)) {
            return; // Already processing this product
        }

        // Check if actually in wishlist
        if (!wishlist?.items?.some(item => item.productId === productId)) {
            toast.error('Not in wishlist');
            return;
        }

        // Add to pending operations
        set({
            pendingOperations: new Set(pendingOperations).add(productId),
            error: null
        });

        try {
            await wishlistService.removeFromWishlist(productId);
            // Refetch wishlist
            const response = await wishlistService.getWishlist();
            set({ wishlist: normalizeWishlist(response.data) });
            toast.success('Removed from wishlist');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to remove item';
            set({ error: errorMsg });
            toast.error(errorMsg);
            throw error;
        } finally {
            // Remove from pending operations
            const newPending = new Set(get().pendingOperations);
            newPending.delete(productId);
            set({ pendingOperations: newPending });
        }
    },

    moveToCart: async (productId: string, quantity = 1) => {
        const { pendingOperations } = get();

        if (pendingOperations.has(productId)) {
            return; // Already processing this product
        }

        set({
            pendingOperations: new Set(pendingOperations).add(productId),
            error: null
        });

        try {
            await wishlistService.moveToCart(productId, quantity);
            // Refetch wishlist
            const response = await wishlistService.getWishlist();
            set({ wishlist: normalizeWishlist(response.data) });
            toast.success('Moved to cart');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to move to cart';
            set({ error: errorMsg });
            toast.error(errorMsg);
            throw error;
        } finally {
            // Remove from pending operations
            const newPending = new Set(get().pendingOperations);
            newPending.delete(productId);
            set({ pendingOperations: newPending });
        }
    },
}));
