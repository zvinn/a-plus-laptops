import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ContextProviders from './ContextProviders';

// Mock all providers to prevent side effects
vi.mock('react-helmet-async', () => ({
    HelmetProvider: ({ children }) => <div data-testid="helmet-provider">{children}</div>
}));

vi.mock('../context/AuthContext', () => ({
    AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
}));

vi.mock('../context/LanguageContext', () => ({
    LanguageProvider: ({ children }) => <div data-testid="language-provider">{children}</div>
}));

vi.mock('../context/ToastContext', () => ({
    ToastProvider: ({ children }) => <div data-testid="toast-provider">{children}</div>
}));

vi.mock('../context/NotificationContext', () => ({
    NotificationProvider: ({ children }) => <div data-testid="notification-provider">{children}</div>
}));

vi.mock('../context/CartContext', () => ({
    CartProvider: ({ children }) => <div data-testid="cart-provider">{children}</div>
}));

vi.mock('../context/WishlistContext', () => ({
    WishlistProvider: ({ children }) => <div data-testid="wishlist-provider">{children}</div>
}));

vi.mock('../context/ThemeContext', () => ({
    ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>
}));

vi.mock('../context/CouponContext', () => ({
    CouponProvider: ({ children }) => <div data-testid="coupon-provider">{children}</div>
}));

vi.mock('../context/ConfirmContext', () => ({
    ConfirmProvider: ({ children }) => <div data-testid="confirm-provider">{children}</div>
}));

vi.mock('./AnalyticsListener', () => ({
    default: () => <div data-testid="analytics-listener" />
}));

describe('ContextProviders', () => {
    it('should render children with all providers', () => {
        render(
            <ContextProviders>
                <div data-testid="child-content">Test Content</div>
            </ContextProviders>
        );

        expect(screen.getByTestId('child-content')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should wrap children in HelmetProvider', () => {
        render(
            <ContextProviders>
                <div>Child</div>
            </ContextProviders>
        );

        expect(screen.getByTestId('helmet-provider')).toBeInTheDocument();
    });

    it('should include AnalyticsListener', () => {
        render(
            <ContextProviders>
                <div>Child</div>
            </ContextProviders>
        );

        expect(screen.getByTestId('analytics-listener')).toBeInTheDocument();
    });

    it('should nest all providers correctly', () => {
        render(
            <ContextProviders>
                <div data-testid="nested-child">Nested</div>
            </ContextProviders>
        );

        // All providers should be present in the tree
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
        expect(screen.getByTestId('language-provider')).toBeInTheDocument();
        expect(screen.getByTestId('toast-provider')).toBeInTheDocument();
        expect(screen.getByTestId('notification-provider')).toBeInTheDocument();
        expect(screen.getByTestId('cart-provider')).toBeInTheDocument();
        expect(screen.getByTestId('wishlist-provider')).toBeInTheDocument();
        expect(screen.getByTestId('coupon-provider')).toBeInTheDocument();
        expect(screen.getByTestId('confirm-provider')).toBeInTheDocument();
    });
});
