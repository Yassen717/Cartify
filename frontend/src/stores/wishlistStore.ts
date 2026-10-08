import { create } from 'zustand';
import * as wishlistService from '../services/wishlist.service';
import type { Wishlist, WishlistItem } from '../services/wishlist.service';
import { getApiErrorMessage } from '../utils/apiError';
import toast from 'react-hot-toast';

const normalizeWishlist = (payload: unknown): Wishlist => {
    const wishlistPayload = (payload as { wishlist?: unknown })?.wishlist ?? payload;

    if (Array.isArray(wishlistPayload)) {
        return {
            items: wishlistPayload,
            itemCount: wishlistPayload.length,
        };
    }

    const container = wishlistPayload as {
        items?: WishlistItem[];
        itemCount?: number;
        data?: { wishlist?: WishlistItem[] };
    } | null | undefined;

    if (container && Array.isArray(container.items)) {
        return {
            items: container.items,
            itemCount: typeof container.itemCount === 'number'
                ? container.itemCount
                : container.items.length,
        };
    }

    const items = Array.isArray(container?.data?.wishlist)
        ? container.data.wishlist
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
        } catch (error) {
            set({
                error: getApiErrorMessage(error, 'Failed to fetch wishlist'),
                isLoading: false,
            });
        }
    },

    addItem: async (productId: string) => {
        // Prevent duplicate concurrent requests for the same product
        const { pendingOperations } = get();

        if (pendingOperations.has(productId)) {
            return; // Already processing this product
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
        } catch (error) {
            const errorMsg = getApiErrorMessage(error, 'Failed to add to wishlist');
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
        const { pendingOperations } = get();

        if (pendingOperations.has(productId)) {
            return; // Already processing this product
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
        } catch (error) {
            const errorMsg = getApiErrorMessage(error, 'Failed to remove item');
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
        } catch (error) {
            const errorMsg = getApiErrorMessage(error, 'Failed to move to cart');
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
