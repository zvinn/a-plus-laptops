import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LaptopFinder from './LaptopFinder';
import { useLanguage } from '../context/LanguageContext';
import * as firestore from 'firebase/firestore';
import * as semanticSearch from '../utils/semanticSearch';

// Mock dependencies
vi.mock('../context/LanguageContext', () => ({
    useLanguage: vi.fn()
}));

vi.mock('../components/SEO', () => ({
    default: () => <div data-testid="seo" />
}));

vi.mock('../components/ProductCard', () => ({
    default: ({ product }) => <div data-testid="product-card">{product.name}</div>
}));

vi.mock('../components/AIConcierge', () => ({
    default: () => <div data-testid="ai-concierge">AI Concierge</div>
}));

vi.mock('../components/MatchVisualizer', () => ({
    default: () => <div data-testid="match-visualizer">Match Visualizer</div>
}));

vi.mock('../utils/analytics', () => ({
    trackEvent: vi.fn()
}));

vi.mock('../utils/semanticSearch', () => ({
    searchLaptops: vi.fn()
}));

// Mock Firebase
vi.mock('firebase/firestore', () => {
    const original = vi.importActual('firebase/firestore');
    return {
        ...original,
        getDocs: vi.fn(),
        collection: vi.fn(),
    };
});

vi.mock('../firebase', () => ({
    db: {}
}));

describe('LaptopFinder Page', () => {
    const mockT = (key) => key;

    const mockLaptops = [
        { id: '1', name: 'Gaming Laptop', brand: 'Alienware', price: 50000, specs: { cpu: 'i9', ram: '32GB' } },
        { id: '2', name: 'Work Laptop', brand: 'Dell', price: 20000, specs: { cpu: 'i7', ram: '16GB' } },
        { id: '3', name: 'Student Laptop', brand: 'HP', price: 10000, specs: { cpu: 'i5', ram: '8GB' } }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useLanguage.mockReturnValue({ t: mockT });

        firestore.getDocs.mockResolvedValue({
            docs: mockLaptops.map(laptop => ({
                id: laptop.id,
                data: () => laptop
            }))
        });

        // Mock search results
        semanticSearch.searchLaptops.mockReturnValue([
            { ...mockLaptops[0], matchScore: 95 },
            { ...mockLaptops[1], matchScore: 80 }
        ]);
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <LaptopFinder />
            </MemoryRouter>
        );
    };

    it('should render welcome screen initially', () => {
        renderComponent();
        expect(screen.getByText('finder.title')).toBeInTheDocument();
        expect(screen.getByText('finder.start')).toBeInTheDocument();
    });

    it('should navigate through quiz steps', async () => {
        renderComponent();

        // Start Quiz
        fireEvent.click(screen.getByText('finder.start'));

        // Step 1: Use
        expect(screen.getByText('finder.useTitle')).toBeInTheDocument();
        fireEvent.click(screen.getByText('finder.gaming'));

        // Step 2: Budget
        expect(screen.getByText('finder.budgetTitle')).toBeInTheDocument();
        fireEvent.click(screen.getByText('finder.budget1')); // Budget Friendly

        // Step 3: Priority
        expect(screen.getByText('finder.priorityTitle')).toBeInTheDocument();
        fireEvent.click(screen.getByText('finder.performance'));

        // Calculation Screen should appear
        expect(screen.getByText('finder.calculating')).toBeInTheDocument();

        // Wait for results
        await waitFor(() => {
            expect(screen.getByText('finder.resultsTitle')).toBeInTheDocument();
            expect(screen.getByText('Gaming Laptop')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('should handle AI Concierge toggle', () => {
        renderComponent();

        const aiBtn = screen.getByText('Try AI Chat Concierge');
        fireEvent.click(aiBtn);

        expect(screen.getByTestId('ai-concierge')).toBeInTheDocument();

        const backBtn = screen.getByText('Back to Quiz');
        fireEvent.click(backBtn);

        expect(screen.queryByTestId('ai-concierge')).not.toBeInTheDocument();
        expect(screen.getByText('finder.title')).toBeInTheDocument();
    });

    it('should allow going back to previous steps', () => {
        renderComponent();

        // Start -> Step 1
        fireEvent.click(screen.getByText('finder.start'));

        // Go Back -> Welcome
        fireEvent.click(screen.getByText('finder.back'));
        expect(screen.getByText('finder.title')).toBeInTheDocument();

        // Start -> Step 1 -> Answer -> Step 2
        fireEvent.click(screen.getByText('finder.start'));
        fireEvent.click(screen.getByText('finder.gaming'));
        expect(screen.getByText('finder.budgetTitle')).toBeInTheDocument();

        // Go Back -> Step 1
        fireEvent.click(screen.getByText('finder.back'));
        expect(screen.getByText('finder.useTitle')).toBeInTheDocument();
    });

    it('should show no results message if nothing found', async () => {
        semanticSearch.searchLaptops.mockReturnValue([]);

        renderComponent();

        // Navigate to end
        fireEvent.click(screen.getByText('finder.start'));
        fireEvent.click(screen.getByText('finder.gaming'));
        fireEvent.click(screen.getByText('finder.budget1'));
        fireEvent.click(screen.getByText('finder.performance'));

        await waitFor(() => {
            expect(screen.getByText('finder.noResults')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
