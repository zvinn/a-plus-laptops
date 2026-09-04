import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from './BottomNav';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

// Mock Contexts
vi.mock('../context/CartContext', () => ({
    useCart: vi.fn()
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
    HomeIcon: () => <div data-testid="icon-home" />,
    ShoppingBagIcon: () => <div data-testid="icon-shop" />,
    ShoppingCartIcon: () => <div data-testid="icon-cart" />,
    UserIcon: () => <div data-testid="icon-user" />,
    MagnifyingGlassIcon: () => <div data-testid="icon-search" />
}));

vi.mock('@heroicons/react/24/solid', () => ({
    HomeIcon: () => <div data-testid="icon-home-solid" />,
    ShoppingBagIcon: () => <div data-testid="icon-shop-solid" />,
    ShoppingCartIcon: () => <div data-testid="icon-cart-solid" />,
    UserIcon: () => <div data-testid="icon-user-solid" />
}));

describe('BottomNav Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useCart.mockReturnValue({ cart: [] });
        useAuth.mockReturnValue({ user: null });
    });

    const renderNav = (initialEntries = ['/']) => {
        return render(
            <MemoryRouter initialEntries={initialEntries}>
                <BottomNav />
            </MemoryRouter>
        );
    };

    it('should render all navigation items', () => {
        renderNav();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Shop')).toBeInTheDocument();
        expect(screen.getByText('Find')).toBeInTheDocument();
        expect(screen.getByText('Cart')).toBeInTheDocument();
        expect(screen.getByText('Login')).toBeInTheDocument();
    });

    it('should show cart count badge', () => {
        useCart.mockReturnValue({
            cart: [
                { id: 1, quantity: 2 },
                { id: 2, quantity: 1 }
            ]
        });
        renderNav();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should show Profile when user is logged in', () => {
        useAuth.mockReturnValue({ user: { uid: '123' } });
        renderNav();
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.queryByText('Login')).not.toBeInTheDocument();
    });

    it('should show active state icon', () => {
        renderNav(['/shop']);
        // The NavLink logic in BottomNav uses the Solid icon if active
        // Our mock returns data-testid="icon-shop-solid"
        expect(screen.getByTestId('icon-shop-solid')).toBeInTheDocument();
    });
});
