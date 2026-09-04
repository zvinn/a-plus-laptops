import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Wishlist from './Wishlist';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

// Mock dependencies
vi.mock('../context/WishlistContext', () => ({
    useWishlist: vi.fn()
}));

vi.mock('../context/CartContext', () => ({
    useCart: vi.fn()
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn()
}));

vi.mock('../context/LanguageContext', () => ({
    useLanguage: vi.fn()
}));

vi.mock('../components/ProductCard', () => ({
    default: ({ product }) => <div data-testid="product-card">{product.name}</div>
}));

describe('Wishlist Page', () => {
    const mockWishlist = [
        { id: '1', name: 'Laptop 1', price: 1000 },
        { id: '2', name: 'Laptop 2', price: 2000 }
    ];

    const mockAddToCart = vi.fn();
    const mockClearWishlist = vi.fn();
    const mockSuccess = vi.fn();
    const mockT = (key) => key;

    beforeEach(() => {
        vi.clearAllMocks();

        useWishlist.mockReturnValue({
            wishlist: mockWishlist,
            clearWishlist: mockClearWishlist
        });

        useCart.mockReturnValue({
            addToCart: mockAddToCart
        });

        useToast.mockReturnValue({
            success: mockSuccess
        });

        useLanguage.mockReturnValue({
            t: mockT
        });
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <Wishlist />
            </MemoryRouter>
        );
    };

    it('should render populated wishlist', () => {
        renderComponent();

        expect(screen.getByText('wishlist.title')).toBeInTheDocument();
        expect(screen.getByText('Laptop 1')).toBeInTheDocument();
        expect(screen.getByText('Laptop 2')).toBeInTheDocument();
        expect(screen.getByText('2 common.items')).toBeInTheDocument();
    });

    it('should render empty state', () => {
        useWishlist.mockReturnValue({ wishlist: [], clearWishlist: mockClearWishlist });
        renderComponent();

        expect(screen.getByText('wishlist.empty')).toBeInTheDocument();
        expect(screen.getByText('common.goToShop')).toBeInTheDocument();
        expect(screen.queryByText('Laptop 1')).not.toBeInTheDocument();
    });

    it('should move all items to cart', () => {
        renderComponent();

        const moveAllBtn = screen.getByText('wishlist.moveAllToCart');
        fireEvent.click(moveAllBtn);

        expect(mockAddToCart).toHaveBeenCalledTimes(2);
        expect(mockAddToCart).toHaveBeenCalledWith(mockWishlist[0]);
        expect(mockAddToCart).toHaveBeenCalledWith(mockWishlist[1]);
        expect(mockClearWishlist).toHaveBeenCalled();
        expect(mockSuccess).toHaveBeenCalledWith('wishlist.movedAllToCart');
    });

    it('should not move items if wishlist is empty (logic check)', () => {
        // Theoretically UI doesn't show button if empty, but checking function logic
        // logic is inside handleMoveAllToCart.
        // However, in the current UI, the empty state REPLACES the main content, 
        // so the button isn't even in the DOM to click. 
        // We can skip this test or just rely on the empty state test above.
        // Let's verify the button is NOT there in empty state.
        useWishlist.mockReturnValue({ wishlist: [], clearWishlist: mockClearWishlist });
        renderComponent();

        expect(screen.queryByText('wishlist.moveAllToCart')).not.toBeInTheDocument();
    });
});
