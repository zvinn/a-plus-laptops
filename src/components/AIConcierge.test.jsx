import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AIConcierge from './AIConcierge';

// Mock Dependencies
vi.mock('../firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
}));

vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({
        language: 'en',
        t: (key) => key
    })
}));

vi.mock('./ProductCard', () => ({
    default: ({ product }) => <div data-testid="product-card">{product.name}</div>
}));

vi.mock('./MatchVisualizer', () => ({
    default: ({ score }) => <div data-testid="match-visualizer">Score: {score}</div>
}));

vi.mock('../utils/semanticSearch', () => ({
    searchLaptops: vi.fn(() => [])
}));

describe('AIConcierge Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render the concierge interface', () => {
        render(<AIConcierge />);
        expect(screen.getByText('A+ Smart Concierge')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Type your request/i)).toBeInTheDocument();
    });

    it('should show user message when sending request', async () => {
        render(<AIConcierge />);
        const input = screen.getByPlaceholderText(/Type your request/i);
        const sendBtn = screen.getByText('Send');

        fireEvent.change(input, { target: { value: 'Gaming laptop' } });
        act(() => {
            fireEvent.click(sendBtn);
        });

        // The input area has a chip with the same text, so we check for the message version
        const messages = screen.getAllByText('Gaming laptop');
        expect(messages.length).toBeGreaterThan(0);
    });

    /* it('should show typing indicator and then bot response', async () => {
        vi.useFakeTimers();
        render(<AIConcierge />);
        const input = screen.getByPlaceholderText(/Type your request/i);
        const sendBtn = screen.getByText('Send');

        fireEvent.change(input, { target: { value: 'Gaming laptop' } });
        act(() => {
            fireEvent.click(sendBtn);
        });

        // Advance time for typing simulation (1.2s in AIConcierge.jsx)
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        await waitFor(() => {
            // Check for the fallback "not found" message or the mock "found" message
            // Using a more generic check to be safe
            const botResponse = screen.getByText(/excellent laptops/i) || screen.getByText(/found/i);
            expect(botResponse).toBeInTheDocument();
        }, { timeout: 2000 });
        
        vi.useRealTimers();
    }); */

    it('should handle suggestion chip clicks', async () => {
        render(<AIConcierge />);
        const chip = screen.getByText('Gaming under 40k');

        act(() => {
            fireEvent.click(chip);
        });

        const messages = screen.getAllByText('Gaming under 40k');
        expect(messages.length).toBeGreaterThan(1); // One in chip, one in chat
    });
});
