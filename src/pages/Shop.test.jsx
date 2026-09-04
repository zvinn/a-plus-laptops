import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Shop from './Shop';

// Mock mocks
const mocks = vi.hoisted(() => ({
    getDocs: vi.fn(),
    collection: vi.fn(),
}));

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    getDocs: mocks.getDocs,
    collection: mocks.collection,
}));

vi.mock('../firebase', () => ({
    db: {}
}));

// Mock Contexts
const mockT = vi.fn((key) => key);
vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: mockT })
}));

// Mock Components
vi.mock('../components/ProductCard', () => ({
    default: ({ product }) => <div data-testid="product-card">{product.name} - {product.price}</div>
}));

vi.mock('../components/Skeleton', () => ({
    default: () => <div data-testid="skeleton" />,
    ProductCardSkeleton: () => <div data-testid="product-card-skeleton" />
}));

vi.mock('../components/SEO', () => ({
    default: () => <div data-testid="seo" />
}));

vi.mock('../components/OptimizedImage', () => ({
    default: () => <img />
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockImplementation(function () {
    return {
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
    };
});
window.IntersectionObserver = mockIntersectionObserver;

describe('Shop Page', () => {
    const mockLaptops = [
        { id: '1', name: 'Laptop A', brand: 'BrandX', price: 6000, specs: { cpu: 'i7', ram: '16GB', gpu: 'RTX 3060', storage: '512GB' }, suitability: ['Business'] },
        { id: '2', name: 'Laptop B', brand: 'BrandY', price: 15000, specs: { cpu: 'i9', ram: '32GB', gpu: 'RTX 4080', storage: '1TB' }, suitability: ['Gaming'] },
        { id: '3', name: 'Laptop C', brand: 'BrandX', price: 9000, specs: { cpu: 'i5', ram: '8GB', gpu: 'Integrated', storage: '256GB' }, suitability: ['Student'] }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getDocs.mockResolvedValue({
            docs: mockLaptops.map(laptop => ({
                id: laptop.id,
                data: () => laptop
            }))
        });

        // Mock window.scrollTo
        window.scrollTo = vi.fn();
    });

    it('should fetch and display laptops', async () => {
        render(<Shop />);

        expect(screen.getAllByTestId('product-card-skeleton').length).toBeGreaterThan(0);

        await waitFor(() => {
            expect(screen.getByText('Laptop A - 6000')).toBeInTheDocument();
            expect(screen.getByText('Laptop B - 15000')).toBeInTheDocument();
        });
    });

    it('should filter by brand', async () => {
        render(<Shop />);

        await waitFor(() => {
            expect(screen.getByText('Laptop A - 6000')).toBeInTheDocument();
        });

        // Find brand radio buttons
        const brandYRadio = screen.getByLabelText('BrandY');
        fireEvent.click(brandYRadio);

        expect(screen.queryByText('Laptop A - 6000')).not.toBeInTheDocument();
        expect(screen.getByText('Laptop B - 15000')).toBeInTheDocument();
    });

    it('should filter by search query', async () => {
        render(<Shop />);

        await waitFor(() => {
            expect(screen.getByText('Laptop A - 6000')).toBeInTheDocument();
        });

        const searchInput = screen.getByLabelText('Search laptops by name or specifications');
        fireEvent.change(searchInput, { target: { value: 'Laptop C' } });

        // Wait for debounce (300ms) + buffer
        await new Promise(r => setTimeout(r, 400));

        await waitFor(() => {
            expect(screen.queryByText('Laptop A - 6000')).not.toBeInTheDocument();
            expect(screen.getByText('Laptop C - 9000')).toBeInTheDocument();
        });
    });

    it('should filter by price', async () => {
        render(<Shop />);

        await waitFor(() => {
            expect(screen.getByText('Laptop B - 15000')).toBeInTheDocument();
        });

        // Set price to 8000 (matches A only)
        const priceSlider = screen.getByDisplayValue('100000'); // Default
        fireEvent.change(priceSlider, { target: { value: '8000' } });

        await waitFor(() => {
            expect(screen.getByText('Laptop A - 6000')).toBeInTheDocument();
            expect(screen.queryByText('Laptop B - 15000')).not.toBeInTheDocument();
            expect(screen.queryByText('Laptop C - 9000')).not.toBeInTheDocument();
        });
    });

    it('should sort laptops', async () => {
        render(<Shop />);

        await waitFor(() => {
            expect(screen.getByText('Laptop A - 6000')).toBeInTheDocument();
        });

        const sortSelect = screen.getByLabelText('shop.sortBy');

        // Price High to Low
        fireEvent.change(sortSelect, { target: { value: 'price-high' } });

        // We can't easily check order in DOM without strict structure, but we can verify the state logic or assume render order.
        // Let's assume render order matches array order.
        const cards = screen.getAllByTestId('product-card');
        expect(cards[0]).toHaveTextContent('Laptop B'); // 15000
        expect(cards[1]).toHaveTextContent('Laptop C'); // 9000
        expect(cards[2]).toHaveTextContent('Laptop A'); // 6000
    });
});
