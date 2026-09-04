import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PWAInstallPrompt from './PWAInstallPrompt';
import { LanguageProvider } from '../context/LanguageContext';

// Mock language context
vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key) => key }),
    LanguageProvider: ({ children }) => <div>{children}</div>
}));

describe('PWAInstallPrompt Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should not be visible initially', () => {
        render(<PWAInstallPrompt />);
        expect(screen.queryByText('pwa.installTitle')).not.toBeInTheDocument();
    });

    it('should become visible when beforeinstallprompt event is fired', async () => {
        render(<PWAInstallPrompt />);

        // Simulate event
        const event = new Event('beforeinstallprompt');
        event.preventDefault = vi.fn();
        event.prompt = vi.fn();
        event.userChoice = Promise.resolve({ outcome: 'accepted' });

        act(() => {
            window.dispatchEvent(event);
        });

        await waitFor(() => {
            expect(screen.getByText('pwa.installTitle')).toBeInTheDocument();
        });

        // Test install click
        const installBtn = screen.getByText('common.install');
        await act(async () => {
            fireEvent.click(installBtn);
        });

        expect(event.prompt).toHaveBeenCalled();
        expect(screen.queryByText('pwa.installTitle')).not.toBeInTheDocument();
    });

    it('should close when X is clicked', async () => {
        render(<PWAInstallPrompt />);

        const event = new Event('beforeinstallprompt');
        act(() => { window.dispatchEvent(event); });

        const closeBtn = screen.getByRole('button', { name: '' }); // The X button doesn't have text
        // Find by icon or specific style if possible, or just the second button
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[1]);

        expect(screen.queryByText('pwa.installTitle')).not.toBeInTheDocument();
    });
});
