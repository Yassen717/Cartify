import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../../stores/cartStore';
import * as cartService from '../../services/cart.service';

// Mock cart service
vi.mock('../../services/cart.service', () => ({
    getCart: vi.fn(),
    addToCart: vi.fn(),
    updateCartItem: vi.fn(),
    removeFromCart: vi.fn(),
    clearCart: vi.fn(),
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    }
}));

describe('useCartStore', () => {
    beforeEach(() => {
        useCartStore.setState({ cart: null, isLoading: false, error: null });
        vi.clearAllMocks();
    });

    it('should add item to cart', async () => {
        const { result } = renderHook(() => useCartStore());

        const mockCartResponse = {
            data: {
                cart: {
                    items: [{ id: 'item1', productId: 'p1', quantity: 1 }]
                }
            }
        };

        vi.mocked(cartService.addToCart).mockResolvedValue(
            mockCartResponse as unknown as Awaited<ReturnType<typeof cartService.addToCart>>
        );

        await act(async () => {
            await result.current.addItem('p1', 1);
        });

        expect(cartService.addToCart).toHaveBeenCalledWith('p1', 1, undefined);
        expect(result.current.cart).toEqual(mockCartResponse.data.cart);
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle add item error', async () => {
        const { result } = renderHook(() => useCartStore());

        const error = { response: { data: { message: 'Out of stock' } } };
        vi.mocked(cartService.addToCart).mockRejectedValue(error);

        await act(async () => {
            try {
                await result.current.addItem('p1', 1);
            } catch {
                // Ignore error in test
            }
        });

        expect(result.current.error).toBe('Out of stock');
        expect(result.current.isLoading).toBe(false);
    });
});
