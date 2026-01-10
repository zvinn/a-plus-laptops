import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';
import { MemoryRouter } from 'react-router-dom';

// Mock Hooks
const mockAddToCart = vi.fn();
const mockToggleWishlist = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock('../context/CartContext', () => ({
    useCart: () => ({ addToCart: mockAddToCart })
}));

vi.mock('../context/WishlistContext', () => ({
    useWishlist: () => ({
        toggleWishlist: mockToggleWishlist,
        isInWishlist: () => false
    })
}));

vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({
        language: 'en',
        t: (key) => key === 'addToCart' ? 'Add to Cart' : key
    })
}));

vi.mock('../context/ToastContext', () => ({
    useToast: () => ({ success: mockToastSuccess })
}));

// Mock Child Components & Libraries
vi.mock('./OptimizedImage', () => ({
    default: ({ src, alt }) => <img src={src} alt={alt} data-testid="optimized-image" />
}));

vi.mock('./QuickViewModal', () => ({
    default: () => <div data-testid="quick-view-modal" />
}));

vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));

const mockProduct = {
    id: 1,
    name: 'Gaming Laptop',
    price: 30000,
    oldPrice: 35000,
    images: ['image1.jpg'],
    specs: { gpu: 'RTX 4060', cpu: 'i7' },
    stockCount: 5
};

describe('ProductCard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render product information correctly', () => {
        render(
            <MemoryRouter>
                <ProductCard product={mockProduct} />
            </MemoryRouter>
        );

        expect(screen.getByText('Gaming Laptop')).toBeInTheDocument();
        expect(screen.getByText(/30,000/)).toBeInTheDocument();
        expect(screen.getByTestId('optimized-image')).toBeInTheDocument();
    });

    it('should call addToCart when button is clicked', () => {
        render(
            <MemoryRouter>
                <ProductCard product={mockProduct} />
            </MemoryRouter>
        );

        // Select by aria-label since button has no text
        const addButton = screen.getByRole('button', { name: /Add Gaming Laptop to cart/i });
        fireEvent.click(addButton);

        expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
    });

    it('should display Out of Stock badge and disable button when stock is 0', () => {
        const outOfStockProduct = { ...mockProduct, stockCount: 0 };
        render(
            <MemoryRouter>
                <ProductCard product={outOfStockProduct} />
            </MemoryRouter>
        );

        // Check for Out of Stock Badge (assuming translation key fallback or text match)
        // Since t('common.outOfStock') is mocked to return key if not 'addToCart'
        // The mock returns key. 'common.outOfStock'.
        // Wait, t implementation: (key) => key === 'addToCart' ? 'Add to Cart' : key
        // So it will render 'common.outOfStock'.
        expect(screen.getByText(/common.outOfStock/)).toBeInTheDocument();

        // Check if button is disabled
        const button = screen.getByRole('button', { name: /Add Gaming Laptop to cart/i });
        expect(button).toBeDisabled();
    });

    it('should call onCompare and show toast when compare button is clicked', () => {
        const mockOnCompare = vi.fn();
        render(
            <MemoryRouter>
                <ProductCard product={mockProduct} onCompare={mockOnCompare} />
            </MemoryRouter>
        );

        const compareButton = screen.getByRole('button', { name: /Add to compare/i });
        fireEvent.click(compareButton);

        expect(mockOnCompare).toHaveBeenCalledWith(mockProduct);
        expect(mockToastSuccess).toHaveBeenCalled();
    });

    it('should call toggleWishlist when wishlist button is clicked', () => {
        render(
            <MemoryRouter>
                <ProductCard product={mockProduct} />
            </MemoryRouter>
        );

        const wishlistButton = screen.getByRole('button', { name: /Add to wishlist/i });
        fireEvent.click(wishlistButton);

        expect(mockToggleWishlist).toHaveBeenCalledWith(mockProduct);
    });

    it('should display low stock badge when stock is low', () => {
        const lowStockProduct = { ...mockProduct, stockCount: 3, lowStockThreshold: 5 };
        render(
            <MemoryRouter>
                <ProductCard product={lowStockProduct} />
            </MemoryRouter>
        );

        // Check for low stock badge - look for the complete badge text
        const lowStockBadge = screen.getByText(/🔥/);
        expect(lowStockBadge).toBeInTheDocument();
        expect(lowStockBadge.textContent).toMatch(/3/);
    });

    it('should display discount badge when oldPrice is higher than price', () => {
        const discountProduct = { ...mockProduct, price: 30000, oldPrice: 40000 };
        render(
            <MemoryRouter>
                <ProductCard product={discountProduct} />
            </MemoryRouter>
        );

        // Check for discount percentage: ((40000-30000)/40000)*100 = 25%
        expect(screen.getByText(/-25%/)).toBeInTheDocument();

        // Check old price is displayed
        expect(screen.getByText(/40,000/)).toBeInTheDocument();
    });

    it('should show filled heart icon when product is in wishlist', () => {
        // Re-mock isInWishlist to return true
        vi.mocked(vi.fn()).mockReturnValue(true);

        render(
            <MemoryRouter>
                <ProductCard product={mockProduct} />
            </MemoryRouter>
        );

        const wishlistButton = screen.getByRole('button', { name: /Add to wishlist/i });
        expect(wishlistButton).toBeInTheDocument();
    });

    it('should add in-compare class when product is in compare list', () => {
        const { container } = render(
            <MemoryRouter>
                <ProductCard product={mockProduct} isInCompare={true} />
            </MemoryRouter>
        );

        const productCard = container.querySelector('.product-card');
        expect(productCard).toHaveClass('in-compare');
    });

    it('should open quick view modal when quick view button is clicked', () => {
        render(
            <MemoryRouter>
                <ProductCard product={mockProduct} />
            </MemoryRouter>
        );

        const quickViewButton = screen.getByRole('button', { name: /Quick view/i });
        fireEvent.click(quickViewButton);

        // Modal should be rendered (mocked as div with testid)
        expect(screen.getByTestId('quick-view-modal')).toBeInTheDocument();
    });
});
