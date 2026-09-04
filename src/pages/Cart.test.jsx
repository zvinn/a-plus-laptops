import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from './Cart';
import { useCart } from '../context/CartContext';

// Mock mocks
const mockRemoveFromCart = vi.fn();
const mockUpdateQuantity = vi.fn();
const mockGetCartTotal = vi.fn();

vi.mock('../context/CartContext', () => ({
    useCart: vi.fn()
}));

const mockT = vi.fn((key) => key);
vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: mockT })
}));

vi.mock('../components/SEO', () => ({
    default: () => <div data-testid="seo" />
}));

vi.mock('../components/OptimizedImage', () => ({
    default: ({ src, alt }) => <img src={src} alt={alt} data-testid="optimized-image" />
}));

describe('Cart Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementation
        useCart.mockReturnValue({
            cart: [],
            removeFromCart: mockRemoveFromCart,
            updateQuantity: mockUpdateQuantity,
            getCartTotal: mockGetCartTotal
        });
        mockGetCartTotal.mockReturnValue(0);
    });

    it('should render empty cart state', () => {
        render(
            <MemoryRouter>
                <Cart />
            </MemoryRouter>
        );

        expect(screen.getByText('cart.empty')).toBeInTheDocument();
        expect(screen.getByText('cart.goToShop')).toBeInTheDocument();
    });

    it('should render items in cart', () => {
        const mockCart = [
            { id: 1, name: 'Laptop A', price: 1000, quantity: 1, image: 'img1.jpg' },
            { id: 2, name: 'Laptop B', price: 2000, quantity: 2, image: 'img2.jpg' }
        ];

        useCart.mockReturnValue({
            cart: mockCart,
            removeFromCart: mockRemoveFromCart,
            updateQuantity: mockUpdateQuantity,
            getCartTotal: mockGetCartTotal
        });
        mockGetCartTotal.mockReturnValue(5000);

        render(
            <MemoryRouter>
                <Cart />
            </MemoryRouter>
        );

        expect(screen.getByText('Laptop A')).toBeInTheDocument();
        expect(screen.getByText('Laptop B')).toBeInTheDocument();
        expect(screen.getAllByText('5,000 common.currency').length).toBeGreaterThan(0);
    });

    it('should update quantity', () => {
        const mockCart = [
            { id: 1, name: 'Laptop A', price: 1000, quantity: 1, image: 'img1.jpg' }
        ];

        useCart.mockReturnValue({
            cart: mockCart,
            removeFromCart: mockRemoveFromCart,
            updateQuantity: mockUpdateQuantity,
            getCartTotal: mockGetCartTotal
        });

        render(
            <MemoryRouter>
                <Cart />
            </MemoryRouter>
        );

        // Click increase
        const increaseBtns = screen.getAllByRole('button', { name: /Increase/i });
        fireEvent.click(increaseBtns[0]);

        expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 2);

        // Click decrease
        const decreaseBtns = screen.getAllByRole('button', { name: /Decrease/i });
        fireEvent.click(decreaseBtns[0]);

        expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 0);
    });

    it('should remove item', () => {
        const mockCart = [
            { id: 1, name: 'Laptop A', price: 1000, quantity: 1, image: 'img1.jpg' }
        ];

        useCart.mockReturnValue({
            cart: mockCart,
            removeFromCart: mockRemoveFromCart,
            updateQuantity: mockUpdateQuantity,
            getCartTotal: mockGetCartTotal
        });

        render(
            <MemoryRouter>
                <Cart />
            </MemoryRouter>
        );

        const removeBtn = screen.getByRole('button', { name: /Remove/i });
        fireEvent.click(removeBtn);

        expect(mockRemoveFromCart).toHaveBeenCalledWith(1);
    });
});
