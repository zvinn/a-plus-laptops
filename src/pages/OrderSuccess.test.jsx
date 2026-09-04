import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrderSuccess from './OrderSuccess';

// Mock SEO component
vi.mock('../components/SEO', () => ({
    default: ({ title, description, noIndex }) => (
        <div
            data-testid="seo"
            data-title={title}
            data-description={description}
            data-noindex={noIndex}
        />
    )
}));

describe('OrderSuccess Page', () => {
    const renderOrderSuccess = () => {
        return render(
            <MemoryRouter>
                <OrderSuccess />
            </MemoryRouter>
        );
    };

    it('should render SEO component with correct props', () => {
        renderOrderSuccess();

        const seo = screen.getByTestId('seo');
        expect(seo).toHaveAttribute('data-title', 'Order Confirmed');
        expect(seo).toHaveAttribute('data-description', 'Your order has been placed successfully.');
        expect(seo).toHaveAttribute('data-noindex', 'true');
    });

    it('should render success heading', () => {
        renderOrderSuccess();

        expect(screen.getByText('Order Placed Successfully!')).toBeInTheDocument();
    });

    it('should render thank you message', () => {
        renderOrderSuccess();

        expect(screen.getByText(/Thank you for your purchase/)).toBeInTheDocument();
    });

    it('should render confirmation message about contact', () => {
        renderOrderSuccess();

        expect(screen.getByText(/We have received your order/)).toBeInTheDocument();
    });

    it('should render continue shopping button', () => {
        renderOrderSuccess();

        const link = screen.getByRole('link', { name: /Continue Shopping/i });
        expect(link).toBeInTheDocument();
    });

    it('should link to shop page', () => {
        renderOrderSuccess();

        const link = screen.getByRole('link', { name: /Continue Shopping/i });
        expect(link).toHaveAttribute('href', '/shop');
    });

    it('should render success checkmark icon', () => {
        renderOrderSuccess();

        const svg = document.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('stroke', '#10b981');
    });

    it('should have correct page container class', () => {
        renderOrderSuccess();

        const container = document.querySelector('.page-container');
        expect(container).toBeInTheDocument();
    });

    it('should have btn-primary class on continue button', () => {
        renderOrderSuccess();

        const link = screen.getByRole('link', { name: /Continue Shopping/i });
        expect(link).toHaveClass('btn', 'btn-primary');
    });
});
