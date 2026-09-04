import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Mock dependencies
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../context/CartContext', () => ({
    useCart: vi.fn()
}));

vi.mock('../context/WishlistContext', () => ({
    useWishlist: vi.fn()
}));

vi.mock('../context/LanguageContext', () => ({
    useLanguage: vi.fn()
}));

vi.mock('../context/ThemeContext', () => ({
    useTheme: vi.fn()
}));

// Mock sub-components
vi.mock('./NotificationBell', () => ({
    default: () => <div data-testid="notification-bell" />
}));

vi.mock('./ThemeToggle', () => ({
    default: () => <div data-testid="theme-toggle" />
}));

describe('Navbar Component', () => {
    const mockLogout = vi.fn();
    const mockGetCartCount = vi.fn();
    const mockToggleLanguage = vi.fn();
    const mockT = (key) => key;

    const defaultMocks = () => {
        useAuth.mockReturnValue({
            currentUser: null,
            logout: mockLogout
        });

        useCart.mockReturnValue({
            getCartCount: mockGetCartCount
        });

        useWishlist.mockReturnValue({
            wishlist: []
        });

        useLanguage.mockReturnValue({
            language: 'en',
            toggleLanguage: mockToggleLanguage,
            t: mockT
        });

        useTheme.mockReturnValue({
            theme: 'light'
        });

        mockGetCartCount.mockReturnValue(0);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        defaultMocks();
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
    };

    it('should render navigation links for guest', () => {
        renderComponent();

        expect(screen.getByText('nav.home')).toBeInTheDocument();
        expect(screen.getByText('nav.shop')).toBeInTheDocument();
        expect(screen.getByText('nav.login')).toBeInTheDocument();
        expect(screen.queryByText('nav.admin')).not.toBeInTheDocument();
        expect(screen.queryByText('common.profile')).not.toBeInTheDocument();
    });

    it('should render navigation links for logged-in user', () => {
        useAuth.mockReturnValue({
            currentUser: { displayName: 'John Doe', email: 'john@example.com' },
            logout: mockLogout
        });

        renderComponent();

        expect(screen.getByText('John')).toBeInTheDocument(); // First name
        expect(screen.queryByText('nav.login')).not.toBeInTheDocument();
        expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    });

    it('should render navigation links for admin', () => {
        useAuth.mockReturnValue({
            currentUser: { email: 'mhamed.saad.ibrahim@gmail.com', displayName: 'Admin' },
            logout: mockLogout
        });

        renderComponent();

        expect(screen.getByText('nav.admin')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should show cart count when items exist', () => {
        mockGetCartCount.mockReturnValue(5);
        renderComponent();

        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should show wishlist count when items exist', () => {
        useWishlist.mockReturnValue({
            wishlist: [1, 2, 3]
        });
        renderComponent();

        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should toggle mobile menu', () => {
        renderComponent();

        const menuBtn = screen.getByLabelText('Open menu');

        // Initial state
        expect(menuBtn).toHaveAttribute('aria-expanded', 'false');

        // Open menu
        fireEvent.click(menuBtn);
        expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('menubar')).toHaveClass('active');

        // Close menu
        fireEvent.click(menuBtn);
        expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    });

    it('should call logout when logout button clicked', async () => {
        useAuth.mockReturnValue({
            currentUser: { email: 'mhamed.saad.ibrahim@gmail.com' }, // Admin has logout button directly
            logout: mockLogout
        });

        renderComponent();

        const logoutBtn = screen.getByText('Logout');
        fireEvent.click(logoutBtn);

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });
    });

    it('should toggle language', () => {
        renderComponent();

        const langBtn = screen.getByLabelText('Switch to Arabic');
        fireEvent.click(langBtn);

        expect(mockToggleLanguage).toHaveBeenCalled();
    });
});
