import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

// Mock mocks
const mocks = vi.hoisted(() => ({
    getDocs: vi.fn(),
    getDoc: vi.fn(),
}));

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    query: vi.fn(),
    limit: vi.fn(),
    getDocs: mocks.getDocs,
    doc: vi.fn(),
    getDoc: mocks.getDoc,
    orderBy: vi.fn(),
    where: vi.fn()
}));

vi.mock('../firebase', () => ({
    db: {}
}));

// Mock Contexts
const mockT = vi.fn((key) => key);
vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: mockT })
}));

// Mock Hooks
vi.mock('../hooks/useScrollReveal', () => ({
    default: vi.fn()
}));

// Mock Utils
vi.mock('../utils/recentlyViewed', () => ({
    getRecentlyViewed: vi.fn(() => [])
}));

// Mock Child Components
vi.mock('../components/ProductCard', () => ({
    default: ({ product }) => <div data-testid="product-card">{product.name}</div>
}));

vi.mock('../components/LaptopComparison', () => ({
    default: () => <div data-testid="laptop-comparison" />
}));

vi.mock('../components/HeroSearch', () => ({
    default: () => <div data-testid="hero-search" />
}));

vi.mock('../components/PolicyModal', () => ({
    default: ({ title, onClose }) => (
        <div data-testid="policy-modal">
            <h1>{title}</h1>
            <button onClick={onClose}>Close</button>
        </div>
    )
}));

vi.mock('../components/Skeleton', () => ({
    default: () => <div data-testid="skeleton" />
}));

vi.mock('../components/HolographicCard', () => ({
    default: () => <div data-testid="holographic-card" />
}));

vi.mock('../components/OptimizedImage', () => ({
    default: () => <img data-testid="optimized-image" />
}));

vi.mock('../components/SEO', () => ({
    default: () => <div data-testid="seo" />
}));

vi.mock('../components/Testimonials', () => ({
    default: () => <div data-testid="testimonials" />
}));

describe('Home Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mocks
        mocks.getDocs.mockResolvedValue({ docs: [] });
    });

    it('should render hero section', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        expect(screen.getByText('hero.title')).toBeInTheDocument();
        expect(screen.getByTestId('hero-search')).toBeInTheDocument();
        await waitFor(() => { }); // Wait for effects
    });

    it('should fetch and render featured laptops', async () => {
        const mockLaptops = [
            { id: '1', name: 'Laptop A', data: () => ({ name: 'Laptop A' }) },
            { id: '2', name: 'Laptop B', data: () => ({ name: 'Laptop B' }) }
        ];

        mocks.getDocs.mockResolvedValueOnce({ // Featured
            docs: mockLaptops
        }).mockResolvedValue({ docs: [] }); // Others

        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Laptop A')).toBeInTheDocument();
            expect(screen.getByText('Laptop B')).toBeInTheDocument();
        });
    });

    it('should open policy modal when feature clicked', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        // Click on warranty feature
        const features = screen.getAllByText('features.warranty');
        fireEvent.click(features[0]);

        expect(screen.getByTestId('policy-modal')).toBeInTheDocument();
        const headings = screen.getAllByRole('heading', { level: 1 });
        expect(headings.find(h => h.textContent === 'features.warranty')).toBeInTheDocument();

        // Close modal
        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByTestId('policy-modal')).not.toBeInTheDocument();
    });

    it('should render testimonials section', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('testimonials')).toBeInTheDocument();
        });
    });

    it('should render categories section', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('categories.title')).toBeInTheDocument();
        });
    });

    it('should handle fetch error gracefully', async () => {
        mocks.getDocs.mockRejectedValueOnce(new Error('Fetch error'));

        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );

        // Page should still render without crashing
        await waitFor(() => {
            expect(screen.getByText('hero.title')).toBeInTheDocument();
        });
    });
});
