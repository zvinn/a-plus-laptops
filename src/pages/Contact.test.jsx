import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Contact from './Contact';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

// Mock dependencies
vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn()
}));

vi.mock('../context/LanguageContext', () => ({
    useLanguage: vi.fn()
}));

vi.mock('../components/SEO', () => ({
    default: () => <div data-testid="seo" />
}));

describe('Contact Page', () => {
    const mockSuccess = vi.fn();
    const mockError = vi.fn();
    const mockT = (key) => key;

    beforeEach(() => {
        vi.clearAllMocks();

        useToast.mockReturnValue({
            success: mockSuccess,
            error: mockError
        });

        useLanguage.mockReturnValue({
            t: mockT
        });
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <Contact />
            </MemoryRouter>
        );
    };

    it('should render contact form and info', () => {
        renderComponent();

        expect(screen.getByText('Get in Touch')).toBeInTheDocument();
        expect(screen.getByText('Send a Message')).toBeInTheDocument();
        expect(screen.getByLabelText('Your Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
        expect(screen.getByLabelText('Message / Inquiry')).toBeInTheDocument();
    });

    it('should show validation errors on invalid submit', async () => {
        renderComponent();

        const submitBtn = screen.getByText('Send Message ✈️');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            // Check for error keys returned by mockT
            expect(screen.getAllByText('errors.required').length).toBeGreaterThan(0);
        });
    });

    it('should validate email format', async () => {
        renderComponent();

        const emailInput = screen.getByLabelText('Email Address');

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText('errors.emailInvalid')).toBeInTheDocument();
        });
    });

    it('should submit successfully with valid data', async () => {
        renderComponent();

        // Fill form
        fireEvent.change(screen.getByLabelText('Your Name'), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Message / Inquiry'), { target: { value: 'This is a valid test message longer than 10 chars.' } });

        const submitBtn = screen.getByText('Send Message ✈️');
        fireEvent.click(submitBtn);

        // Check loading state
        expect(screen.getByText('errors.submitting')).toBeInTheDocument();

        // Wait for success message (component has 1500ms delay)
        await waitFor(() => {
            expect(screen.getByText('Message Sent! 🎉')).toBeInTheDocument();
            expect(mockSuccess).toHaveBeenCalledWith('errors.successContact');
        }, { timeout: 3000 });
    });

    it('should reset success message after timeout', async () => {
        vi.useFakeTimers();
        renderComponent();

        // Fill and submit
        fireEvent.change(screen.getByLabelText('Your Name'), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Message / Inquiry'), { target: { value: 'Valid message body.' } });
        fireEvent.click(screen.getByText('Send Message ✈️'));

        // Advance past submission delay (1500ms)
        await vi.advanceTimersByTimeAsync(1500);

        // Assert success message appeared
        expect(screen.getByText('Message Sent! 🎉')).toBeInTheDocument();

        // Advance timer for success message reset (3000ms after success)
        await vi.advanceTimersByTimeAsync(3000);

        // Assert reset happened
        expect(screen.queryByText('Message Sent! 🎉')).not.toBeInTheDocument();
        expect(screen.getByText('Send a Message')).toBeInTheDocument();

        vi.useRealTimers();
    });
});
