import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

// Mock ThemeContext
vi.mock('../context/ThemeContext', () => ({
    useTheme: vi.fn()
}));

describe('ThemeToggle Component', () => {
    const mockToggleTheme = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render light mode correctly', () => {
        useTheme.mockReturnValue({
            isDark: false,
            toggleTheme: mockToggleTheme,
            isTransitioning: false
        });

        render(<ThemeToggle />);

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
        expect(button).toHaveClass('light');
        expect(button).not.toHaveClass('dark');
    });

    it('should render dark mode correctly', () => {
        useTheme.mockReturnValue({
            isDark: true,
            toggleTheme: mockToggleTheme,
            isTransitioning: false
        });

        render(<ThemeToggle />);

        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
        expect(button).toHaveClass('dark');
        expect(button).not.toHaveClass('light');
    });

    it('should call toggleTheme when clicked', () => {
        useTheme.mockReturnValue({
            isDark: false,
            toggleTheme: mockToggleTheme,
            isTransitioning: false
        });

        render(<ThemeToggle />);
        fireEvent.click(screen.getByRole('button'));
        expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should show label when showLabel prop is true', () => {
        useTheme.mockReturnValue({
            isDark: true,
            toggleTheme: mockToggleTheme,
            isTransitioning: false
        });

        render(<ThemeToggle showLabel={true} />);
        expect(screen.getByText('Dark')).toBeInTheDocument();

        useTheme.mockReturnValue({
            isDark: false,
            toggleTheme: mockToggleTheme,
            isTransitioning: false
        });
        const { rerender } = render(<ThemeToggle showLabel={true} />);
        rerender(<ThemeToggle showLabel={true} />);
        expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('should apply transitioning class', () => {
        useTheme.mockReturnValue({
            isDark: false,
            toggleTheme: mockToggleTheme,
            isTransitioning: true
        });

        render(<ThemeToggle />);
        expect(screen.getByRole('button')).toHaveClass('transitioning');
    });
});
