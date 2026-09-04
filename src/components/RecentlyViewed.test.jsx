import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import RecentlyViewed from './RecentlyViewed';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import * as firestore from 'firebase/firestore';

// Mock Dependencies
vi.mock('../utils/recentlyViewed', () => ({
    getRecentlyViewed: vi.fn()
}));

vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key) => key })
}));

vi.mock('./ProductCard', () => ({
    default: ({ product }) => <div data-testid="product-card">{product.name}</div>
}));

vi.mock('./Skeleton', () => ({
    default: () => <div data-testid="skeleton" />
}));

vi.mock('../firebase', () => ({ db: {} }));

vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        getDocs: vi.fn(),
        documentId: vi.fn(() => 'documentId')
    };
});

describe('RecentlyViewed Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render null when no products are recently viewed', async () => {
        getRecentlyViewed.mockReturnValue([]);
        const { container } = render(<RecentlyViewed />);

        await waitFor(() => {
            expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
        });
        expect(container.firstChild).toBeNull();
    });

    it('should render skeleton while loading', () => {
        getRecentlyViewed.mockReturnValue(['1', '2']);
        // Mock getDocs to stay pending or resolve late
        firestore.getDocs.mockReturnValue(new Promise(() => { }));

        render(<RecentlyViewed />);
        expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });

    it('should render viewed products', async () => {
        const mockIds = ['p1', 'p2'];
        const mockProducts = [
            { id: 'p1', name: 'Laptop 1' },
            { id: 'p2', name: 'Laptop 2' }
        ];

        getRecentlyViewed.mockReturnValue(mockIds);
        firestore.getDocs.mockResolvedValue({
            docs: mockProducts.map(p => ({
                id: p.id,
                data: () => p
            }))
        });

        render(<RecentlyViewed />);

        await waitFor(() => {
            expect(screen.getByText(/recentlyViewed\.title/i)).toBeInTheDocument();
            const cards = screen.getAllByTestId('product-card');
            expect(cards).toHaveLength(2);
            expect(cards[0]).toHaveTextContent('Laptop 1');
            expect(cards[1]).toHaveTextContent('Laptop 2');
        });
    });

    it('should exclude current product', async () => {
        const mockIds = ['p1', 'p2', 'p3'];
        getRecentlyViewed.mockReturnValue(mockIds);

        // Mocking getDocs to return something
        firestore.getDocs.mockResolvedValue({
            docs: [{ id: 'p1', data: () => ({ name: 'L1' }) }, { id: 'p3', data: () => ({ name: 'L3' }) }]
        });

        render(<RecentlyViewed excludeProductId="p2" />);

        await waitFor(() => {
            // where was called with 'in' and ['p1', 'p3']
            expect(firestore.where).toHaveBeenCalledWith(expect.anything(), 'in', ['p1', 'p3']);
        });
    });

    it('should limit to 4 products', async () => {
        const mockIds = ['p1', 'p2', 'p3', 'p4', 'p5'];
        getRecentlyViewed.mockReturnValue(mockIds);

        firestore.getDocs.mockResolvedValue({
            docs: mockIds.map(id => ({ id, data: () => ({ name: `L${id}` }) }))
        });

        render(<RecentlyViewed />);

        await waitFor(() => {
            // where was called with sliced ids
            expect(firestore.where).toHaveBeenCalledWith(expect.anything(), 'in', ['p1', 'p2', 'p3', 'p4']);
        });
    });
});
