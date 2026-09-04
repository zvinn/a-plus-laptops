import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PolicyModal from './PolicyModal';

describe('PolicyModal Component', () => {
    it('should render title and content', () => {
        const onClose = vi.fn();
        render(<PolicyModal title="Terms" content="Accept our terms" onClose={onClose} />);

        expect(screen.getByText('Terms')).toBeInTheDocument();
        expect(screen.getByText('Accept our terms')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(<PolicyModal title="Terms" content="Accept our terms" onClose={onClose} />);

        const closeBtn = screen.getByRole('button');
        fireEvent.click(closeBtn);

        expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when overlay is clicked', () => {
        const onClose = vi.fn();
        const { container } = render(<PolicyModal title="Terms" content="Accept our terms" onClose={onClose} />);

        const overlay = container.querySelector('.policy-modal-overlay');
        fireEvent.click(overlay);

        expect(onClose).toHaveBeenCalled();
    });
});
