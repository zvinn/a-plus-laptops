import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Testimonials from './Testimonials';

// Mock Dependencies
vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key) => key })
}));

vi.mock('@heroicons/react/24/solid', () => ({
    StarIcon: ({ className }) => <span data-testid="icon-star" className={className} />
}));

vi.mock('@heroicons/react/24/outline', () => ({
    ChevronLeftIcon: () => <span data-testid="icon-prev" />,
    ChevronRightIcon: () => <span data-testid="icon-next" />
}));

describe('Testimonials Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    it('should render testimonials section', () => {
        render(<Testimonials />);
        expect(screen.getByText('What Our Customers Say')).toBeInTheDocument();
        expect(screen.getByText(/Ahmed Hassan/)).toBeInTheDocument();
    });

    it('should change testimonial when next/prev clicked', () => {
        render(<Testimonials />);

        const nextBtn = screen.getByLabelText('Next Review');
        const prevBtn = screen.getByLabelText('Previous Review');

        // Initial: Ahmed Hassan
        expect(screen.getByText(/Ahmed Hassan/)).toBeInTheDocument();

        // Click Next -> Sarah Mahmoud
        fireEvent.click(nextBtn);
        expect(screen.getByText(/Sarah Mahmoud/)).toBeInTheDocument();

        // Click Prev -> Back to Ahmed Hassan
        fireEvent.click(prevBtn);
        expect(screen.getByText(/Ahmed Hassan/)).toBeInTheDocument();

        // Click Prev again -> Wraps to last: Laila Youssef
        fireEvent.click(prevBtn);
        expect(screen.getByText(/Laila Youssef/)).toBeInTheDocument();
    });

    it('should transition automatically after delay', () => {
        render(<Testimonials />);

        expect(screen.getByText(/Ahmed Hassan/)).toBeInTheDocument();

        // Advance time by 5s
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.getByText(/Sarah Mahmoud/)).toBeInTheDocument();
    });

    it('should pause auto-transition on mouse enter', () => {
        render(<Testimonials />);

        // Find by text directly to ensure we have the correct element
        const ahmedText = screen.getByText(/Ahmed Hassan/);
        const wrapper = ahmedText.closest('.testimonials-carousel-wrapper');

        fireEvent.mouseEnter(wrapper);

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        // Still Ahmed Hassan
        expect(screen.getByText(/Ahmed Hassan/)).toBeInTheDocument();

        fireEvent.mouseLeave(wrapper);

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        // Now Sarah Mahmoud
        expect(screen.getByText(/Sarah Mahmoud/)).toBeInTheDocument();
    });

    it('should change testimonial when dot is clicked', () => {
        const { container } = render(<Testimonials />);

        const dots = container.querySelectorAll('.dot');
        expect(dots).toHaveLength(4);

        // Click 3rd dot -> Omar Khaled
        fireEvent.click(dots[2]);
        expect(screen.getByText(/Omar Khaled/)).toBeInTheDocument();

        // Click 1st dot -> Ahmed Hassan
        fireEvent.click(dots[0]);
        expect(screen.getByText(/Ahmed Hassan/)).toBeInTheDocument();
    });
});
