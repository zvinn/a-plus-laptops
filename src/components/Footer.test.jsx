import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

// Mock dependencies
vi.mock('../context/LanguageContext', () => ({
    useLanguage: vi.fn()
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn()
}));

describe('Footer Component', () => {
    const mockT = (key) => key;
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        useLanguage.mockReturnValue({
            t: mockT
        });

        useToast.mockReturnValue({
            success: mockSuccess,
            error: mockError
        });
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
    };

    it('should render footer links and info', () => {
        renderComponent();

        expect(screen.getByText('footer.subtitle')).toBeInTheDocument();
        expect(screen.getByText('footer.quickLinks')).toBeInTheDocument();
        expect(screen.getByText('nav.home')).toBeInTheDocument();
        expect(screen.getByText('footer.shopCollection')).toBeInTheDocument();
        expect(screen.getByText('footer.contact')).toBeInTheDocument();
    });

    it('should show validation error for empty email', () => {
        renderComponent();

        const subscribeBtn = screen.getByText('footer.subscribe');
        fireEvent.click(subscribeBtn);

        expect(screen.getByText('errors.required')).toBeInTheDocument();
    });

    it('should show validation error for invalid email format', () => {
        renderComponent();

        const emailInput = screen.getByLabelText('Enter your email for newsletter');
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

        const subscribeBtn = screen.getByText('footer.subscribe');
        fireEvent.click(subscribeBtn);

        expect(screen.getByText('errors.emailInvalid')).toBeInTheDocument();
    });

    it('should handle successful subscription', async () => {
        renderComponent();

        const emailInput = screen.getByLabelText('Enter your email for newsletter');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

        const subscribeBtn = screen.getByText('footer.subscribe');
        fireEvent.click(subscribeBtn);

        // Check loading state if implemented (it is in the code)
        // Since we await a timeout in the component, we need to wait

        await waitFor(() => {
            expect(mockSuccess).toHaveBeenCalledWith('errors.successSubscribe');
        });

        expect(emailInput.value).toBe('');
    });
});
