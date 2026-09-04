import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CookieConsent from './CookieConsent';
import { initGA } from '../utils/analytics';

// Mock analytics
vi.mock('../utils/analytics', () => ({
    initGA: vi.fn()
}));

describe('CookieConsent Component', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should render if no consent is stored', () => {
        render(<CookieConsent />);
        expect(screen.getByText(/We use cookies/i)).toBeInTheDocument();
    });

    it('should not render if consent is already stored', () => {
        localStorage.setItem('cookieConsent', 'true');
        render(<CookieConsent />);
        expect(screen.queryByText(/We use cookies/i)).not.toBeInTheDocument();
    });

    it('should store true and init GA when accepted', () => {
        render(<CookieConsent />);
        const acceptBtn = screen.getByRole('button', { name: /Accept/i });

        fireEvent.click(acceptBtn);

        expect(localStorage.getItem('cookieConsent')).toBe('true');
        expect(initGA).toHaveBeenCalled();
        expect(screen.queryByText(/We use cookies/i)).not.toBeInTheDocument();
    });

    it('should store false when declined', () => {
        render(<CookieConsent />);
        const declineBtn = screen.getByText(/Decline/i);

        fireEvent.click(declineBtn);

        expect(localStorage.getItem('cookieConsent')).toBe('false');
        expect(initGA).not.toHaveBeenCalled();
    });
});
