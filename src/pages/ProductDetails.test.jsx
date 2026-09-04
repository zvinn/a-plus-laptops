import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductDetails from './ProductDetails';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { getDoc, getDocs } from 'firebase/firestore';

// Mock dependencies
vi.mock('../context/CartContext', () => ({
    useCart: vi.fn()
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn()
}));

vi.mock('../utils/analytics', () => ({
    trackViewItem: vi.fn(),
    trackAddToCart: vi.fn()
}));

vi.mock('../utils/recentlyViewed', () => ({
    addRecentlyViewed: vi.fn(),
    getRecentlyViewed: vi.fn().mockReturnValue([])
}));

vi.mock('../components/SEO', () => ({
    default: () => <div data-testid="seo" />
}));

vi.mock('../components/OptimizedImage', () => ({
    default: ({ src, alt }) => <img src={src} alt={alt} data-testid="optimized-image" />
}));

vi.mock('../components/ReviewList', () => ({
    default: () => <div data-testid="review-list">Reviews</div>
}));

// Mock Firebase (Auto-mock)
vi.mock('firebase/firestore');

vi.mock('../firebase', () => ({
    db: {}
}));

describe('ProductDetails Page', () => {
    const mockAddToCart = vi.fn();
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    const mockProduct = {
        id: '1',
        name: 'Test Laptop',
        brand: 'TestBrand',
        price: 10000,
        image: 'test.jpg',
        specs: { cpu: 'i7', ram: '16GB', gpu: 'RTX 3060', storage: '512GB', screen: '15.6"' },
        stockCount: 10,
        description: 'A great laptop',
        condition: 'New'
    };

    beforeEach(() => {
        vi.clearAllMocks();

        useCart.mockReturnValue({ addToCart: mockAddToCart });
        useToast.mockReturnValue({ success: mockSuccess, error: mockError });

        // Default: Found product
        vi.mocked(getDoc).mockResolvedValue({
            exists: () => true,
            id: '1',
            data: () => mockProduct
        });

        // Default: No similar items
        vi.mocked(getDocs).mockResolvedValue({
            docs: []
        });
    });

    const renderWithRouter = (initialEntry = '/product/1') => {
        return render(
            <MemoryRouter initialEntries={[initialEntry]}>
                <Routes>
                    <Route path="/product/:id" element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('should render loading state initially', async () => {
        // Delay resolution
        vi.mocked(getDoc).mockImplementation(() => new Promise(() => { }));
        renderWithRouter();
        expect(document.querySelector('.skeleton-rect')).toBeInTheDocument(); // Assuming skeleton structure
    });

    it('should render product details when loaded', async () => {
        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Test Laptop')).toBeInTheDocument();
            expect(screen.getAllByText('10,000 EGP').length).toBeGreaterThan(0);
        });
    });

    it('should handle product not found', async () => {
        vi.mocked(getDoc).mockResolvedValue({
            exists: () => false
        });

        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Product Not Found')).toBeInTheDocument();
        });
    });

    it('should handle RAM upgrade', async () => {
        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Test Laptop')).toBeInTheDocument();
        });

        const ramCheckbox = screen.getByLabelText(/Upgrade RAM/i);
        fireEvent.click(ramCheckbox);

        // Price should update (10000 + 1500 = 11500)
        expect(screen.getAllByText('11,500 EGP').length).toBeGreaterThan(0);
    });

    it('should add to cart with correct options', async () => {
        renderWithRouter();

        await waitFor(() => {
            expect(screen.getByText('Test Laptop')).toBeInTheDocument();
        });

        const ramCheckbox = screen.getByLabelText(/Upgrade RAM/i);
        fireEvent.click(ramCheckbox);

        const addToCartBtn = screen.getByRole('button', { name: /Add to Cart/i });
        fireEvent.click(addToCartBtn);

        expect(mockAddToCart).toHaveBeenCalledWith(expect.objectContaining({
            id: '1',
            price: 11500,
            selectedOptions: {
                ram: true,
                storage: false
            }
        }));
        expect(mockSuccess).toHaveBeenCalled();
    });

    it('should disable add to cart if out of stock', async () => {
        vi.mocked(getDoc).mockResolvedValue({
            exists: () => true,
            id: '1',
            data: () => ({ ...mockProduct, stockCount: 0 })
        });

        renderWithRouter();

        await waitFor(() => {
            const btn = screen.getByRole('button', { name: /Out of Stock/i });
            expect(btn).toBeInTheDocument();
            expect(btn).toBeDisabled();
        });
    });
});
