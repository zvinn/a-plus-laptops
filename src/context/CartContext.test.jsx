import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CartContext', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('should start with an empty cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        expect(result.current.cart).toEqual([]);
    });

    it('should add a product to the cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = { id: 1, name: 'Laptop', price: 1000 };

        act(() => {
            result.current.addToCart(product);
        });

        expect(result.current.cart).toHaveLength(1);
        expect(result.current.cart[0]).toMatchObject({ ...product, quantity: 1 });
    });

    it('should increase quantity if product already exists', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = { id: 1, name: 'Laptop', price: 1000 };

        act(() => {
            result.current.addToCart(product);
            result.current.addToCart(product);
        });

        expect(result.current.cart).toHaveLength(1);
        expect(result.current.cart[0].quantity).toBe(2);
    });

    it('should remove a product from the cart', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = { id: 1, name: 'Laptop', price: 1000 };

        act(() => {
            result.current.addToCart(product);
            result.current.removeFromCart(1);
        });

        expect(result.current.cart).toEqual([]);
    });

    it('should update quantity manually', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });
        const product = { id: 1, name: 'Laptop', price: 1000 };

        act(() => {
            result.current.addToCart(product);
            result.current.updateQuantity(1, 5);
        });

        expect(result.current.cart[0].quantity).toBe(5);
    });

    it('should calculate subtotal correctly', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

        act(() => {
            result.current.addToCart({ id: 1, price: 1000 });
            result.current.addToCart({ id: 2, price: 500 });
            result.current.updateQuantity(2, 2); // 500 * 2 = 1000
        });

        // Total = 1000 (item 1) + 1000 (item 2 * 2) = 2000
        expect(result.current.getCartTotal()).toBe(2000);
    });

    it('should persist to localStorage', () => {
        const { result } = renderHook(() => useCart(), { wrapper: CartProvider });

        act(() => {
            result.current.addToCart({ id: 1, price: 1000 });
        });

        expect(window.localStorage.setItem).toHaveBeenCalled();
        expect(window.localStorage.getItem('cart')).toContain('"id":1');
    });
});
