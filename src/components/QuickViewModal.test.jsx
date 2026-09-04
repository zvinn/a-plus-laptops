import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuickViewModal from './QuickViewModal';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

// Mock dependencies
vi.mock('../context/CartContext', () => ({
    useCart: vi.fn()
}));

vi.mock('../context/LanguageContext', () => ({
    useLanguage: vi.fn().mockReturnValue({ t: (s) => s })
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn()
}));

vi.mock('./OptimizedImage', () => ({
    default: ({ src, alt }) => <img src={src} alt={alt} data-testid="optimized-image" />
}));

// Mock Heroicons
vi.mock('@heroicons/react/24/solid', () => ({
    XMarkIcon: () => <span data-testid="icon-close" />,
    ShoppingCartIcon: () => <span data-testid="icon-cart" />
}));

describe('QuickViewModal Component', () => {
    const mockAddToCart = vi.fn();
    const mockSuccess = vi.fn();
    const mockOnClose = vi.fn();

    const mockProduct = {
        id: '1',
        name: 'Test Laptop',
        brand: 'TestBrand',
        price: 10000,
        oldPrice: 12000,
        image: 'test.jpg',
        specs: { cpu: 'i7', ram: '16GB' }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useCart.mockReturnValue({ addToCart: mockAddToCart });
        useToast.mockReturnValue({ success: mockSuccess });
    });

    it('should not render anything when product is null', () => {
        const { container } = render(
            <MemoryRouter>
                <QuickViewModal product={null} isOpen={true} onClose={mockOnClose} />
            </MemoryRouter>
        );
        expect(container.firstChild).toBeNull();
    });

    it('should render product details when open', () => {
        render(
            <MemoryRouter>
                <QuickViewModal product={mockProduct} isOpen={true} onClose={mockOnClose} />
            </MemoryRouter>
        );

        expect(screen.getByText('Test Laptop')).toBeInTheDocument();
        expect(screen.getByText('TestBrand')).toBeInTheDocument();
        expect(screen.getByText(/10,000/)).toBeInTheDocument();
        expect(screen.getByText(/12,000/)).toBeInTheDocument();
        expect(screen.getByText('i7')).toBeInTheDocument();
        expect(screen.getByText('16GB')).toBeInTheDocument();
    });

    it('should call addToCart and success when "Add to Cart" is clicked', async () => {
        render(
            <MemoryRouter>
                <QuickViewModal product={mockProduct} isOpen={true} onClose={mockOnClose} />
            </MemoryRouter>
        );

        // Match the translation key returned by the mock: (s) => s
        const addBtn = screen.getByRole('button', { name: /quickView\.addToCart/i });
        fireEvent.click(addBtn);

        expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
        expect(mockSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when close button is clicked', () => {
        render(
            <MemoryRouter>
                <QuickViewModal product={mockProduct} isOpen={true} onClose={mockOnClose} />
            </MemoryRouter>
        );

        const closeBtn = screen.getByLabelText(/Close quick view/i);
        fireEvent.click(closeBtn);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', () => {
        render(
            <MemoryRouter>
                <QuickViewModal product={mockProduct} isOpen={true} onClose={mockOnClose} />
            </MemoryRouter>
        );

        const backdrop = screen.getByRole('dialog').parentElement;
        fireEvent.click(backdrop);

        expect(mockOnClose).toHaveBeenCalled();
    });
});
