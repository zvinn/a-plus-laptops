import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';
import * as errorLogger from '../utils/errorLogger';

// Mock Utils
vi.mock('../utils/errorLogger', () => ({
    logError: vi.fn(() => ({ id: 'log1' })),
    generateWhatsAppReport: vi.fn(() => 'whatsapp://send?text=err'),
    isRetryableError: vi.fn(() => false),
    getLastError: vi.fn()
}));

vi.mock('../utils/analytics', () => ({
    trackException: vi.fn()
}));

vi.mock('./OfflineFallback', () => ({
    default: () => <div data-testid="offline-fallback">Offline</div>
}));

// Component that throws
const ThrowError = ({ shouldThrow }) => {
    if (shouldThrow) {
        throw new Error('Test Error');
    }
    return <div>Normal Content</div>;
};

// Silence console.error for expected test errors
const originalError = console.error;

describe('ErrorBoundary Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        console.error = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        console.error = originalError;
        vi.clearAllMocks();
    });

    it('should render children when no error', () => {
        render(
            <ErrorBoundary>
                <div data-testid="child">Safe</div>
            </ErrorBoundary>
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should catch error and render fallback UI', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText(/حدث خطأ غير متوقع/)).toBeInTheDocument();
        expect(errorLogger.logError).toHaveBeenCalled();
    });

    it('should retry automatically for retryable errors', () => {
        errorLogger.isRetryableError.mockReturnValue(true);

        const { rerender } = render(
            <ErrorBoundary enableAutoRetry={true}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        // Should show "Retrying" spinner
        expect(screen.getByText(/جاري إعادة المحاولة/)).toBeInTheDocument();

        // Advance timer for first retry (1000ms)
        act(() => {
            vi.advanceTimersByTime(1100);
        });

        // After retry, it should try to render children again (which will throw again)
        // Check if retry count increased (it's in the text)
        expect(screen.getByText(/Attempt 2 of 3/)).toBeInTheDocument();
    });

    it('should reset error state on reload click', () => {
        // Ensure NOT a network error to show default fallback
        errorLogger.isRetryableError.mockReturnValue(false);

        // Disable auto-retry to get to the static fallback UI
        render(
            <ErrorBoundary enableAutoRetry={false}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        // When auto-retry is disabled, button should say "إعادة التحميل / Reload"
        const resetBtn = screen.getByText(/Reload/i);
        expect(resetBtn).toBeInTheDocument();

        fireEvent.click(resetBtn);
    });

    it('should show offline fallback for network errors when retries exhausted', async () => {
        errorLogger.isRetryableError.mockReturnValue(true);

        render(
            <ErrorBoundary enableAutoRetry={false}>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        // When auto-retry is disabled, it should show OfflineFallback if it's a retryable error
        expect(screen.getByTestId('offline-fallback')).toBeInTheDocument();
    });
});
