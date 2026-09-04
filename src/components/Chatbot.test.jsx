import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Chatbot from './Chatbot';

// Mock Dependencies
vi.mock('lucide-react', () => ({
    MessageCircle: () => <span data-testid="message-icon">MessageCircle</span>,
    X: () => <span data-testid="close-icon">X</span>,
    Send: () => <span>Send</span>,
    RotateCcw: () => <span data-testid="reset-icon">RotateCcw</span>,
    ChevronRight: () => <span>ChevronRight</span>
}));

vi.mock('@heroicons/react/24/solid', () => ({
    SparklesIcon: () => <span data-testid="sparkles-icon">Sparkles</span>
}));

vi.mock('./OptimizedImage', () => ({
    default: ({ src, alt }) => <img src={src} alt={alt} data-testid="optimized-image" />
}));

vi.mock('../data/laptops', () => ({
    laptops: [
        {
            id: 1,
            name: 'Gaming Laptop Pro',
            brand: 'Lenovo',
            price: 45000,
            image: '/gaming.jpg',
            suitability: ['gaming', 'performance']
        },
        {
            id: 2,
            name: 'Business Workstation',
            brand: 'Dell',
            price: 35000,
            image: '/work.jpg',
            suitability: ['work', 'business']
        },
        {
            id: 3,
            name: 'Student Essentials',
            brand: 'Asus',
            price: 20000,
            image: '/student.jpg',
            suitability: ['student', 'school']
        },
        {
            id: 4,
            name: 'Budget Pick',
            brand: 'Lenovo',
            price: 18000,
            image: '/budget.jpg',
            suitability: ['general']
        },
        {
            id: 5,
            name: 'Premium MacBook',
            brand: 'Apple',
            price: 80000,
            image: '/mac.jpg',
            suitability: ['work', 'creative']
        }
    ]
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

import { MemoryRouter } from 'react-router-dom';

describe('Chatbot Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderChatbot = () => {
        return render(
            <MemoryRouter>
                <Chatbot />
            </MemoryRouter>
        );
    };

    describe('Toggle Functionality', () => {
        it('should render closed by default', () => {
            renderChatbot();
            expect(screen.getByTestId('message-icon')).toBeInTheDocument();
            // Check that the chatbot window doesn't have 'open' class
            const chatbotWindow = document.querySelector('.chatbot-window');
            expect(chatbotWindow).not.toHaveClass('open');
        });

        it('should open when toggle button is clicked', () => {
            renderChatbot();
            const toggleBtn = screen.getByLabelText(/open chat assistant/i);
            fireEvent.click(toggleBtn);

            expect(screen.getByText('A Plus Assistant')).toBeInTheDocument();
        });

        it('should close when X button is clicked', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));

            expect(screen.getByText('A Plus Assistant')).toBeInTheDocument();

            fireEvent.click(screen.getByLabelText(/close chat assistant/i));

            // Window should have closed class
            const window = document.querySelector('.chatbot-window');
            expect(window).not.toHaveClass('open');
        });

        it('should show initial greeting message', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));

            expect(screen.getByText(/I'm your A Plus Assistant/)).toBeInTheDocument();
        });
    });

    describe('Quiz Flow - Step 0 (Start)', () => {
        it('should show start button', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));

            expect(screen.getByText(/Let's Find a Laptop/i)).toBeInTheDocument();
        });

        it('should advance to step 1 when start is clicked', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));

            fireEvent.click(screen.getByText(/Let's Find a Laptop/i));

            // User message should appear
            expect(screen.getByText('Yes, please!')).toBeInTheDocument();

            // Advance timer for typing animation
            act(() => { vi.advanceTimersByTime(1500); });

            // Usage options should appear
            expect(screen.getByText(/Gaming/)).toBeInTheDocument();
            expect(screen.getByText(/Work/)).toBeInTheDocument();
            expect(screen.getByText(/Student/)).toBeInTheDocument();
        });
    });

    describe('Quiz Flow - Step 1 (Usage)', () => {
        it('should show all usage options', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));
            fireEvent.click(screen.getByText(/Let's Find a Laptop/i));
            act(() => { vi.advanceTimersByTime(1500); });

            expect(screen.getByText(/Gaming 🎮/)).toBeInTheDocument();
            expect(screen.getByText(/Work 💼/)).toBeInTheDocument();
            expect(screen.getByText(/Student 🎓/)).toBeInTheDocument();
        });

        it('should advance to budget step when usage is selected', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));
            fireEvent.click(screen.getByText(/Let's Find a Laptop/i));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/Gaming 🎮/));
            act(() => { vi.advanceTimersByTime(1500); });

            // Budget options should appear
            expect(screen.getByText(/< 25k/)).toBeInTheDocument();
            expect(screen.getByText(/25k - 60k/)).toBeInTheDocument();
            expect(screen.getByText(/60k\+/)).toBeInTheDocument();
        });
    });

    describe('Quiz Flow - Step 2 (Budget)', () => {
        it('should advance to brand step when budget is selected', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));
            fireEvent.click(screen.getByText(/Let's Find a Laptop/i));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/Gaming 🎮/));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/25k - 60k/));
            act(() => { vi.advanceTimersByTime(1500); });

            // Brand options should appear
            expect(screen.getByText(/Any Brand/)).toBeInTheDocument();
            expect(screen.getByText(/Lenovo/)).toBeInTheDocument();
            expect(screen.getByText(/Asus/)).toBeInTheDocument();
            expect(screen.getByText(/Apple/)).toBeInTheDocument();
        });
    });

    describe('Quiz Flow - Step 3 (Brand) and Results', () => {
        it('should show results after brand selection', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));
            fireEvent.click(screen.getByText(/Let's Find a Laptop/i));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/Gaming 🎮/));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/25k - 60k/));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/Any Brand/));
            act(() => { vi.advanceTimersByTime(2000); });

            // Should show result hint
            expect(screen.getByText(/Click the product above/)).toBeInTheDocument();
        });

        it('should complete full flow with specific brand', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));
            fireEvent.click(screen.getByText(/Let's Find a Laptop/i));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/Work 💼/));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/60k\+/));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/Apple/));
            act(() => { vi.advanceTimersByTime(2000); });

            // Result should mention matches
            expect(screen.getByText(/match/i)).toBeInTheDocument();
        });

        it('should handle no matching results gracefully', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));
            fireEvent.click(screen.getByText(/Let's Find a Laptop/i));
            act(() => { vi.advanceTimersByTime(1500); });

            // Select combination that might not match
            fireEvent.click(screen.getByText(/Gaming 🎮/));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/< 25k/));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/Apple/));
            act(() => { vi.advanceTimersByTime(2000); });

            // Should still show some result (fallback or no match message)
            const resultMessages = screen.getAllByText(/match|found|browse/i);
            expect(resultMessages.length).toBeGreaterThan(0);
        });
    });

    describe('Reset Functionality', () => {
        it('should reset conversation when reset button is clicked', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));

            // Go through some steps
            fireEvent.click(screen.getByText(/Let's Find a Laptop/i));
            act(() => { vi.advanceTimersByTime(1500); });

            fireEvent.click(screen.getByText(/Gaming 🎮/));
            act(() => { vi.advanceTimersByTime(1500); });

            // Reset
            const resetBtn = screen.getByLabelText(/restart conversation/i);
            fireEvent.click(resetBtn);

            // Should be back to start
            expect(screen.getByText(/Let's Find a Laptop/i)).toBeInTheDocument();
            expect(screen.getByText(/I'm your A Plus Assistant/)).toBeInTheDocument();
        });
    });

    describe('Typing Indicator', () => {
        it('should show typing indicator during bot response', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));
            fireEvent.click(screen.getByText(/Let's Find a Laptop/i));

            // During typing animation, indicator should show
            const typingIndicator = document.querySelector('.typing');
            expect(typingIndicator).toBeInTheDocument();

            // After timer, it should be gone
            act(() => { vi.advanceTimersByTime(1500); });
        });
    });

    describe('Online Status', () => {
        it('should show online status', () => {
            renderChatbot();
            fireEvent.click(screen.getByLabelText(/open chat assistant/i));

            expect(screen.getByText('Online')).toBeInTheDocument();
        });
    });
});
