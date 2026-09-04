import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WishlistProvider, useWishlist } from './WishlistContext';

// Mock useToast
const mockSuccess = vi.fn();
const mockInfo = vi.fn();

vi.mock('./ToastContext', () => ({
    useToast: () => ({
        success: mockSuccess,
        info: mockInfo
    })
}));

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

describe('WishlistContext', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
    });

    it('should start with an empty wishlist', () => {
        const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
        expect(result.current.wishlist).toEqual([]);
    });

    it('should add item to wishlist and show success toast', () => {
        const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
        const product = { id: 1, name: 'Product 1' };

        act(() => {
            result.current.toggleWishlist(product);
        });

        expect(result.current.wishlist).toContainEqual(product);
        expect(mockSuccess).toHaveBeenCalledWith(expect.stringContaining('Product 1'));
    });

    it('should remove item from wishlist if already exists and show info toast', () => {
        const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
        const product = { id: 1, name: 'Product 1' };

        // Add first
        act(() => {
            result.current.toggleWishlist(product);
        });

        // Remove
        act(() => {
            result.current.toggleWishlist(product);
        });

        expect(result.current.wishlist).not.toContainEqual(product);
        expect(mockInfo).toHaveBeenCalledWith(expect.stringContaining('Product 1'));
    });

    it('should check if item is in wishlist', () => {
        const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
        const product = { id: 1, name: 'Product 1' };

        act(() => {
            result.current.toggleWishlist(product);
        });

        expect(result.current.isInWishlist(1)).toBe(true);
        expect(result.current.isInWishlist(2)).toBe(false);
    });

    it('should clear wishlist', () => {
        const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
        const product = { id: 1, name: 'Product 1' };

        act(() => {
            result.current.toggleWishlist(product);
            result.current.clearWishlist();
        });

        expect(result.current.wishlist).toEqual([]);
    });

    it('should persist to localStorage', () => {
        const { result } = renderHook(() => useWishlist(), { wrapper: WishlistProvider });
        const product = { id: 1, name: 'Product 1' };

        act(() => {
            result.current.toggleWishlist(product);
        });

        expect(window.localStorage.setItem).toHaveBeenCalledWith('wishlist', expect.stringContaining('"id":1'));
    });
});
