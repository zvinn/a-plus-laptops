import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard navigation for power users
 * 
 * Shortcuts:
 * - Alt + H: Go to Home
 * - Alt + S: Go to Shop
 * - Alt + F: Go to AI Finder
 * - Alt + C: Go to Cart
 * - Alt + A: Go to Admin (if authorized)
 * - Alt + D: Toggle Dark Mode
 * - Escape: Close modals/overlays
 * - /: Focus search (on Shop page)
 */

const useKeyboardShortcuts = ({ onToggleTheme, isAdmin = false } = {}) => {
    const navigate = useNavigate();

    const handleKeyDown = useCallback((event) => {
        // Ignore if typing in an input
        const activeElement = document.activeElement;
        const isInputFocused = activeElement?.tagName === 'INPUT' ||
            activeElement?.tagName === 'TEXTAREA' ||
            activeElement?.isContentEditable;

        // Allow Escape even in inputs
        if (event.key === 'Escape') {
            // Close any open modals by clicking overlay
            const overlay = document.querySelector('.modal-overlay');
            if (overlay) {
                overlay.click();
                return;
            }
            // Blur current input
            if (isInputFocused) {
                activeElement.blur();
                return;
            }
        }

        // Don't handle shortcuts when typing
        if (isInputFocused) return;

        // Focus search with /
        if (event.key === '/') {
            event.preventDefault();
            const searchInput = document.querySelector('.search-input, input[type="search"], input[placeholder*="Search"]');
            if (searchInput) {
                searchInput.focus();
            }
            return;
        }

        // Alt + Key shortcuts
        if (event.altKey) {
            switch (event.key.toLowerCase()) {
                case 'h':
                    event.preventDefault();
                    navigate('/');
                    break;
                case 's':
                    event.preventDefault();
                    navigate('/shop');
                    break;
                case 'f':
                    event.preventDefault();
                    navigate('/finder');
                    break;
                case 'c':
                    event.preventDefault();
                    navigate('/cart');
                    break;
                case 'a':
                    if (isAdmin) {
                        event.preventDefault();
                        navigate('/admin');
                    }
                    break;
                case 'd':
                    event.preventDefault();
                    onToggleTheme?.();
                    break;
                default:
                    break;
            }
        }
    }, [navigate, onToggleTheme, isAdmin]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return null;
};



export default useKeyboardShortcuts;
