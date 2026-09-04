import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OfflineFallback from './OfflineFallback';

// Mock LanguageContext
vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key) => {
            const translations = {
                'offline.title': "You're Offline",
                'offline.message': 'Check your connection and try again.',
                'offline.retry': 'Try Again'
            };
            return translations[key] || key;
        }
    })
}));

// Mock heroicons
vi.mock('@heroicons/react/24/outline', () => ({
    WifiIcon: (props) => <svg data-testid="wifi-icon" {...props} />
}));

describe('OfflineFallback', () => {
    beforeEach(() => {
        // Mock window.location.reload
        delete window.location;
        window.location = { reload: vi.fn() };
    });

    it('should render offline title', () => {
        render(<OfflineFallback />);

        expect(screen.getByText("You're Offline")).toBeInTheDocument();
    });

    it('should render offline message', () => {
        render(<OfflineFallback />);

        expect(screen.getByText('Check your connection and try again.')).toBeInTheDocument();
    });

    it('should render wifi icon', () => {
        render(<OfflineFallback />);

        expect(screen.getByTestId('wifi-icon')).toBeInTheDocument();
    });

    it('should render try again button', () => {
        render(<OfflineFallback />);

        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should reload page when try again button is clicked', () => {
        render(<OfflineFallback />);

        const button = screen.getByRole('button', { name: /try again/i });
        fireEvent.click(button);

        expect(window.location.reload).toHaveBeenCalled();
    });

    it('should have correct styling classes', () => {
        render(<OfflineFallback />);

        const button = screen.getByRole('button', { name: /try again/i });
        expect(button).toHaveClass('btn', 'btn-primary');
    });
});
