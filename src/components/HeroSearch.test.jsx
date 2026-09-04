import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeroSearch from './HeroSearch';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('lucide-react', () => ({
    Search: () => <span>SearchIcon</span>,
    ArrowRight: () => <span>ArrowRight</span>,
    TrendingUp: () => <span>TrendingUp</span>,
    Sparkles: () => <span>Sparkles</span>
}));

describe('HeroSearch Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should navigate on suggestion click', async () => {
        render(
            <MemoryRouter>
                <HeroSearch />
            </MemoryRouter>
        );

        const input = screen.getByPlaceholderText(/Search any laptop/i);
        fireEvent.change(input, { target: { value: 'Asus' } });

        // Wait for suggestions to appear
        const suggestion = await screen.findByRole('option', { name: /Asus/i });
        fireEvent.click(suggestion);

        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('?compare='));
    });

    it('should call handleSelect on Enter key', async () => {
        render(
            <MemoryRouter>
                <HeroSearch />
            </MemoryRouter>
        );

        const input = screen.getByPlaceholderText(/Search any laptop/i);
        fireEvent.change(input, { target: { value: 'Asus' } });

        // Wait for suggestions
        await screen.findByRole('option', { name: /Asus/i });

        // Arrow down to select first
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('?compare='));
    });
});
