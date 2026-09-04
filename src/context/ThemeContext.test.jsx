import React, { useContext } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ThemeContext, { ThemeProvider, useTheme } from './ThemeContext';

// Test component to consume context
const TestComponent = () => {
    const { theme, toggleTheme, setTheme, isDark } = useTheme();
    return (
        <div>
            <span data-testid="theme-val">{theme}</span>
            <span data-testid="is-dark">{isDark.toString()}</span>
            <button onClick={toggleTheme}>Toggle</button>
            <button onClick={() => setTheme('dark')}>Set Dark</button>
        </div>
    );
};

describe('ThemeContext', () => {
    beforeEach(() => {
        // Clear mocks and localStorage
        vi.clearAllMocks();
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        document.body.className = '';

        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(), // deprecated
                removeListener: vi.fn(), // deprecated
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderWithProvider = () => {
        return render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>
        );
    };

    it('should default to light theme if no preference', () => {
        renderWithProvider();
        expect(screen.getByTestId('theme-val')).toHaveTextContent('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(document.body.classList.contains('light-mode')).toBe(true);
    });

    it('should load theme from localStorage', () => {
        localStorage.setItem('theme', 'dark');
        renderWithProvider();
        expect(screen.getByTestId('theme-val')).toHaveTextContent('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should toggle theme', async () => {
        vi.useFakeTimers();
        renderWithProvider();

        expect(screen.getByTestId('theme-val')).toHaveTextContent('light');

        const toggleBtn = screen.getByText('Toggle');

        act(() => {
            fireEvent.click(toggleBtn);
        });

        // 1. First timeout (50ms) triggers setTheme
        await vi.advanceTimersByTimeAsync(100);

        // Assert intermediate state if needed, or just wait for final
        // 2. Second timeout (300ms) resets transition
        await vi.advanceTimersByTimeAsync(300);

        expect(screen.getByTestId('theme-val')).toHaveTextContent('dark');
        expect(localStorage.getItem('theme')).toBe('dark');
        expect(document.body.classList.contains('dark-mode')).toBe(true);

        vi.useRealTimers();
    });

    it('should respect system preference if no localStorage', () => {
        window.matchMedia.mockImplementation(query => ({
            matches: true, // prefers dark
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));

        renderWithProvider();
        expect(screen.getByTestId('theme-val')).toHaveTextContent('dark');
    });

    it('should allow setting specific theme', () => {
        renderWithProvider();
        const setDarkBtn = screen.getByText('Set Dark');

        act(() => {
            fireEvent.click(setDarkBtn);
        });

        expect(screen.getByTestId('theme-val')).toHaveTextContent('dark');
    });
});
