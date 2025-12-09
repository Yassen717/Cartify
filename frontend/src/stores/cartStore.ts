import { create } from 'zustand';
import * as cartService from '../services/cart.service';
import type { Cart, CartItem } from '../services/cart.service';
import toast from 'react-hot-toast';

interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchCart: () => Promise<void>;
    addItem: (productId: string, quantity?: number, variantId?: string) => Promise<void>;
    updateItem: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
    cart: null,
    isLoading: false,
    error: null,

    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await cartService.getCart();
            set({ cart: response.data.cart, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch cart',
                isLoading: false,
            });
        }
    },

    addItem: async (productId: string, quantity = 1, variantId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await cartService.addToCart(productId, quantity, variantId);
            set({ cart: response.data.cart, isLoading: false });
            toast.success('Item added to cart');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to add item to cart';
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },

    updateItem: async (itemId: string, quantity: number) => {
        set({ isLoading: true, error: null });
        try {
            await cartService.updateCartItem(itemId, quantity);
            // Refetch cart to get updated data
            const response = await cartService.getCart();
            set({ cart: response.data.cart, isLoading: false });
            toast.success('Cart updated');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to update cart';
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },

    removeItem: async (itemId: string) => {
        set({ isLoading: true, error: null });
        try {
            await cartService.removeFromCart(itemId);
            // Refetch cart to get updated data
            const response = await cartService.getCart();
            set({ cart: response.data.cart, isLoading: false });
            toast.success('Item removed from cart');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to remove item';
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },

    clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
            await cartService.clearCart();
            set({ cart: null, isLoading: false });
            toast.success('Cart cleared');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to clear cart';
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            throw error;
        }
    },
}));
