import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LiveActivityToast from './LiveActivityToast';

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));

describe('LiveActivityToast Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should show notification after delay and hide it', () => {
        render(<LiveActivityToast />);

        // Advance 5s (initial timer in component)
        act(() => {
            vi.advanceTimersByTime(5500);
        });

        // Search for text that appears in a random notification
        // Since it's random, we look for static parts or use regex
        expect(screen.getByText(/purchased/i)).toBeInTheDocument();

        // Advance 6s more (hide timer)
        act(() => {
            vi.advanceTimersByTime(6500);
        });

        expect(screen.queryByText(/purchased/i)).not.toBeInTheDocument();
    });

    it('should dismiss when close button is clicked', () => {
        render(<LiveActivityToast />);

        act(() => {
            vi.advanceTimersByTime(5500);
        });

        const closeBtn = screen.getByRole('button');
        fireEvent.click(closeBtn);

        expect(screen.queryByText(/purchased/i)).not.toBeInTheDocument();
    });
});
