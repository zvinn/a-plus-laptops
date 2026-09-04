import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BackToTop from './BackToTop';

describe('BackToTop Component', () => {
    it('should not be visible initially', () => {
        render(<BackToTop />);
        expect(screen.queryByLabelText(/Back to top/i)).not.toBeInTheDocument();
    });

    it('should become visible after scrolling down', () => {
        render(<BackToTop />);

        // Mock scroll
        window.scrollY = 600;
        fireEvent.scroll(window);

        expect(screen.getByLabelText(/Back to top/i)).toBeInTheDocument();
    });

    it('should scroll to top when clicked', () => {
        const scrollToMock = vi.fn();
        window.scrollTo = scrollToMock;

        render(<BackToTop />);

        window.scrollY = 600;
        fireEvent.scroll(window);

        const button = screen.getByLabelText(/Back to top/i);
        fireEvent.click(button);

        expect(scrollToMock).toHaveBeenCalledWith({
            top: 0,
            behavior: 'smooth'
        });
    });
});
