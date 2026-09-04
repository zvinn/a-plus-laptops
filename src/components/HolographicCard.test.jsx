import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HolographicCard from './HolographicCard';

// Mock framer-motion hooks
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        useMotionValue: vi.fn(() => ({ set: vi.fn(), get: vi.fn(() => 0) })),
        useTransform: vi.fn(() => ({ get: vi.fn(() => '50%') })),
        useSpring: vi.fn(() => ({ get: vi.fn(() => 0) })),
        motion: {
            div: ({ children, ...props }) => <div {...props}>{children}</div>
        }
    };
});

describe('HolographicCard Component', () => {
    const mockProduct = {
        id: '1',
        name: 'Holo Laptop',
        brand: 'A Plus+',
        image: 'test.jpg',
        specs: { cpu: 'Intel i9', ram: '32GB' }
    };

    it('should render product info', () => {
        render(<HolographicCard product={mockProduct} />);
        expect(screen.getByText('Holo Laptop')).toBeInTheDocument();
        expect(screen.getByText(/Intel i9/)).toBeInTheDocument();
    });

    it('should handle mouse movements', () => {
        const { container } = render(<HolographicCard product={mockProduct} />);
        const element = container.querySelector('.holo-container');

        fireEvent.mouseMove(element, { clientX: 100, clientY: 100 });
        fireEvent.mouseLeave(element);
    });

    it('should return null if no product', () => {
        const { container } = render(<HolographicCard product={null} />);
        expect(container.firstChild).toBeNull();
    });
});
