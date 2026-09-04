import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

// Test component to trigger toasts
const TestComponent = () => {
    const { addToast, success, error, info } = useToast();
    return (
        <div>
            <button onClick={() => success('Success Message')}>Show Success</button>
            <button onClick={() => error('Error Message')}>Show Error</button>
            <button onClick={() => info('Info Message')}>Show Info</button>
            <button onClick={() => addToast('Custom Message', 'custom', 'Custom Title')}>Show Custom</button>
        </div>
    );
};

describe('ToastContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render children', () => {
        render(
            <ToastProvider>
                <div>Test Child</div>
            </ToastProvider>
        );
        expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should show success toast', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Success'));

        expect(screen.getByText('Success Message')).toBeInTheDocument();
        expect(screen.getByText('Success')).toBeInTheDocument(); // Title
    });

    it('should show error toast', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Error'));

        expect(screen.getByText('Error Message')).toBeInTheDocument();
        expect(screen.getByText('Error')).toBeInTheDocument(); // Title
    });

    it('should show info toast', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Info'));

        expect(screen.getByText('Info Message')).toBeInTheDocument();
        expect(screen.getByText('Info')).toBeInTheDocument(); // Title
    });

    it('should remove toast after timeout', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Success'));
        expect(screen.getByText('Success Message')).toBeInTheDocument();

        // Advance timer by 4 seconds (timeout is 4000ms)
        act(() => {
            vi.advanceTimersByTime(4000);
        });

        expect(screen.queryByText('Success Message')).not.toBeInTheDocument();
    });

    it('should remove toast when close button is clicked', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Success'));
        const closeButton = screen.getByRole('button', { name: /Dismiss notification/i });

        fireEvent.click(closeButton);

        expect(screen.queryByText('Success Message')).not.toBeInTheDocument();
    });
});
