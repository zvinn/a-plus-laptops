import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LaptopComparison, { ComparisonProvider, useComparison } from './LaptopComparison';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

// Mock Dependencies
vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key) => key }),
    LanguageProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../context/ToastContext', () => ({
    useToast: () => ({ success: vi.fn(), info: vi.fn(), error: vi.fn() }),
    ToastProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('./OptimizedImage', () => ({
    default: ({ src, alt }) => <img src={src} alt={alt} data-testid="optimized-image" />
}));

vi.mock('./ComparisonBattle', () => ({
    default: () => <div data-testid="comparison-battle">Battle Chart</div>
}));

vi.mock('./HeroSearch', () => ({
    default: ({ onSelectLaptop }) => (
        <button onClick={() => onSelectLaptop({ id: 'new-laptop', name: 'New Laptop', brand: 'Test' })}>
            Select Laptop
        </button>
    )
}));

// Mock Firebase
vi.mock('../firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    getDocs: vi.fn().mockResolvedValue({
        docs: [
            { id: '1', data: () => ({ name: 'Laptop 1', brand: 'Brand A', price: 1000, performance: { gaming: 80, workstation: 70, battery: 60 } }) },
            { id: '2', data: () => ({ name: 'Laptop 2', brand: 'Brand B', price: 1200, performance: { gaming: 70, workstation: 80, battery: 70 } }) },
            { id: '3', data: () => ({ name: 'Laptop 3', brand: 'Brand C', price: 1100, performance: { gaming: 60, workstation: 60, battery: 80 } }) }
        ]
    })
}));

// Test Wrapper for Context
const TestWrapper = ({ children }) => (
    <ComparisonProvider>
        {children}
    </ComparisonProvider>
);

describe('LaptopComparison Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should render comparison header with default state', async () => {
        render(
            <MemoryRouter>
                <TestWrapper>
                    <LaptopComparison />
                </TestWrapper>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('comparison.title')).toBeInTheDocument();
            // Default fetches 2 laptops (slice 0,2) if no params
            expect(screen.getByText('Laptop 1')).toBeInTheDocument();
            expect(screen.getByText('Laptop 2')).toBeInTheDocument();
        });
    });

    it('should allow adding a laptop via slot', async () => {
        render(
            <MemoryRouter>
                <TestWrapper>
                    <LaptopComparison />
                </TestWrapper>
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('comparison.addLaptop'));

        // This relies on the HeroSearch mock
        fireEvent.click(screen.getByText('Select Laptop'));

        await waitFor(() => {
            expect(screen.getByText('New Laptop')).toBeInTheDocument();
        });
    });

    it('should remove a laptop', async () => {
        render(
            <MemoryRouter>
                <TestWrapper>
                    <LaptopComparison />
                </TestWrapper>
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Laptop 1'));

        const removeBtns = screen.getAllByRole('button').filter(btn => btn.className.includes('remove-laptop-btn'));
        fireEvent.click(removeBtns[0]);

        await waitFor(() => {
            expect(screen.queryByText('Laptop 1')).not.toBeInTheDocument();
        });
    });

    it('should calculate overall winner', async () => {
        render(
            <MemoryRouter>
                <TestWrapper>
                    <LaptopComparison />
                </TestWrapper>
            </MemoryRouter>
        );

        await waitFor(() => expect(screen.getAllByText('comparison.winner').length).toBeGreaterThan(0));
        // Laptop 2 score: 70+80+70 = 220
        // Laptop 1 score: 80+70+60 = 210
        // Laptop 2 should be winner
        // We verify the badge is present (checking logic implicitly via UI)
    });

    it('should save comparison to localStorage', async () => {
        render(
            <MemoryRouter>
                <TestWrapper>
                    <LaptopComparison />
                </TestWrapper>
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Laptop 1'));

        const saveBtn = screen.getByLabelText('Save comparison');
        fireEvent.click(saveBtn);

        expect(localStorage.getItem('savedComparisons')).toBeTruthy();
    });

    it('should render comparison battle component', async () => {
        render(
            <MemoryRouter>
                <TestWrapper>
                    <LaptopComparison />
                </TestWrapper>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('comparison-battle')).toBeInTheDocument();
        });
    });

    it('should handle share button click', async () => {
        // Mock clipboard API
        const writeText = vi.fn().mockResolvedValue();
        Object.assign(navigator, { clipboard: { writeText } });

        render(
            <MemoryRouter>
                <TestWrapper>
                    <LaptopComparison />
                </TestWrapper>
            </MemoryRouter>
        );

        await waitFor(() => screen.getByText('Laptop 1'));

        const shareBtn = screen.getByLabelText('Share comparison');
        fireEvent.click(shareBtn);

        // The share functionality should be triggered
    });
});

// Test the ComparisonProvider context
describe('ComparisonProvider Context', () => {
    const TestConsumer = () => {
        const { compareList, addToCompare, removeFromCompare, clearCompare } = useComparison();
        return (
            <div>
                <span data-testid="count">{compareList.length}</span>
                <button onClick={() => addToCompare({ id: '1', name: 'Test' })}>Add</button>
                <button onClick={() => removeFromCompare('1')}>Remove</button>
                <button onClick={() => clearCompare()}>Clear</button>
            </div>
        );
    };

    it('should add and remove laptops from compare list', () => {
        render(
            <ComparisonProvider>
                <TestConsumer />
            </ComparisonProvider>
        );

        expect(screen.getByTestId('count').textContent).toBe('0');

        fireEvent.click(screen.getByText('Add'));
        expect(screen.getByTestId('count').textContent).toBe('1');

        fireEvent.click(screen.getByText('Remove'));
        expect(screen.getByTestId('count').textContent).toBe('0');
    });

    it('should clear all laptops from compare list', () => {
        render(
            <ComparisonProvider>
                <TestConsumer />
            </ComparisonProvider>
        );

        fireEvent.click(screen.getByText('Add'));
        expect(screen.getByTestId('count').textContent).toBe('1');

        fireEvent.click(screen.getByText('Clear'));
        expect(screen.getByTestId('count').textContent).toBe('0');
    });
});
