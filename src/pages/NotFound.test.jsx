import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    }
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Search: (props) => <svg data-testid="search-icon" {...props} />,
    Home: (props) => <svg data-testid="home-icon" {...props} />,
    ShoppingBag: (props) => <svg data-testid="shopping-icon" {...props} />,
    ArrowLeft: (props) => <svg data-testid="arrow-left-icon" {...props} />
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('NotFound Page', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    const renderNotFound = () => {
        return render(
            <MemoryRouter>
                <NotFound />
            </MemoryRouter>
        );
    };

    it('should render 404 error code', () => {
        renderNotFound();

        expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('should render error message heading', () => {
        renderNotFound();

        expect(screen.getByText('Oops! Page Not Found')).toBeInTheDocument();
    });

    it('should render error description', () => {
        renderNotFound();

        expect(screen.getByText(/ventured into uncharted digital territory/)).toBeInTheDocument();
    });

    it('should render search input', () => {
        renderNotFound();

        expect(screen.getByPlaceholderText(/Search for laptops/)).toBeInTheDocument();
    });

    it('should render search button', () => {
        renderNotFound();

        expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
    });

    it('should render Go Back button', () => {
        renderNotFound();

        expect(screen.getByText(/Go Back/)).toBeInTheDocument();
    });

    it('should render Home button', () => {
        renderNotFound();

        expect(screen.getByText(/Home/)).toBeInTheDocument();
    });

    it('should render Shop Now button', () => {
        renderNotFound();

        expect(screen.getByText(/Shop Now/)).toBeInTheDocument();
    });

    it('should navigate back when Go Back button clicked', () => {
        renderNotFound();

        const goBackBtn = screen.getByText(/Go Back/).closest('button');
        fireEvent.click(goBackBtn);

        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should navigate to home when Home button clicked', () => {
        renderNotFound();

        const homeBtn = screen.getByText(/Home/).closest('button');
        fireEvent.click(homeBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate to shop when Shop Now button clicked', () => {
        renderNotFound();

        const shopBtn = screen.getByText(/Shop Now/).closest('button');
        fireEvent.click(shopBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/shop');
    });

    it('should update search query when typing', () => {
        renderNotFound();

        const searchInput = screen.getByPlaceholderText(/Search for laptops/);
        fireEvent.change(searchInput, { target: { value: 'gaming laptop' } });

        expect(searchInput.value).toBe('gaming laptop');
    });

    it('should navigate to shop with search query on form submit', () => {
        renderNotFound();

        const searchInput = screen.getByPlaceholderText(/Search for laptops/);
        fireEvent.change(searchInput, { target: { value: 'dell xps' } });

        const searchBtn = screen.getByRole('button', { name: 'Search' });
        fireEvent.click(searchBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/shop?search=dell%20xps');
    });

    it('should not navigate if search query is empty', () => {
        renderNotFound();

        const searchBtn = screen.getByRole('button', { name: 'Search' });
        fireEvent.click(searchBtn);

        expect(mockNavigate).not.toHaveBeenCalledWith(expect.stringContaining('/shop?search='));
    });

    it('should have correct CSS classes', () => {
        renderNotFound();

        expect(document.querySelector('.not-found-container')).toBeInTheDocument();
        expect(document.querySelector('.not-found-content')).toBeInTheDocument();
        expect(document.querySelector('.error-code')).toBeInTheDocument();
    });
});
