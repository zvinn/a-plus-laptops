import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CouponInput from './CouponInput';
import { useCoupons } from '../context/CouponContext';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Ticket: () => <span data-testid="icon-ticket" />,
    X: () => <span data-testid="icon-x" />,
    Check: () => <span data-testid="icon-check" />,
    Loader: () => <span data-testid="icon-loader" />
}));

// Mock CouponContext
vi.mock('../context/CouponContext', () => ({
    useCoupons: vi.fn()
}));

describe('CouponInput Component', () => {
    const mockValidateCoupon = vi.fn();
    const mockOnApply = vi.fn();
    const mockOnRemove = vi.fn();
    const orderTotal = 1000;

    beforeEach(() => {
        vi.clearAllMocks();
        useCoupons.mockReturnValue({ validateCoupon: mockValidateCoupon });
    });

    it('should render initial state correctly', () => {
        render(<CouponInput orderTotal={orderTotal} onApply={mockOnApply} onRemove={mockOnRemove} />);

        expect(screen.getByPlaceholderText(/أدخل كود الخصم/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /تطبيق/ })).toBeInTheDocument();
        expect(screen.getByTestId('icon-ticket')).toBeInTheDocument();
    });

    it('should show error for empty code', async () => {
        render(<CouponInput orderTotal={orderTotal} onApply={mockOnApply} onRemove={mockOnRemove} />);

        const applyBtn = screen.getByRole('button', { name: /تطبيق/ });
        // Button should be disabled if code is trim empty based on code: disabled={isValidating || !code.trim()}
        expect(applyBtn).toBeDisabled();
    });

    it('should apply valid coupon successfully', async () => {
        const mockResult = {
            valid: true,
            message: 'تم تطبيق الخصم',
            discount: 100,
            coupon: { id: 'c1', code: 'SAVE10' }
        };
        mockValidateCoupon.mockResolvedValue(mockResult);

        render(<CouponInput orderTotal={orderTotal} onApply={mockOnApply} onRemove={mockOnRemove} />);

        const input = screen.getByPlaceholderText(/أدخل كود الخصم/);
        fireEvent.change(input, { target: { value: 'SAVE10' } });

        const applyBtn = screen.getByRole('button', { name: /تطبيق/ });
        fireEvent.click(applyBtn);

        await waitFor(() => {
            expect(mockValidateCoupon).toHaveBeenCalledWith('SAVE10', orderTotal);
            expect(mockOnApply).toHaveBeenCalledWith(100, 'c1', 'SAVE10');
            expect(screen.getByText('تم تطبيق الخصم')).toBeInTheDocument();
            // Input should be cleared on success
            expect(input.value).toBe('');
        });
    });

    it('should show error for invalid coupon', async () => {
        const mockResult = {
            valid: false,
            error: 'كود غير صالح'
        };
        mockValidateCoupon.mockResolvedValue(mockResult);

        render(<CouponInput orderTotal={orderTotal} onApply={mockOnApply} onRemove={mockOnRemove} />);

        const input = screen.getByPlaceholderText(/أدخل كود الخصم/);
        fireEvent.change(input, { target: { value: 'INVALID' } });

        const applyBtn = screen.getByRole('button', { name: /تطبيق/ });
        fireEvent.click(applyBtn);

        await waitFor(() => {
            expect(screen.getByText('كود غير صالح')).toBeInTheDocument();
            expect(mockOnApply).not.toHaveBeenCalled();
        });
    });

    it('should render applied state', () => {
        const appliedCoupon = { code: 'PROMO20', discount: 200 };
        render(
            <CouponInput
                orderTotal={orderTotal}
                onApply={mockOnApply}
                onRemove={mockOnRemove}
                appliedCoupon={appliedCoupon}
            />
        );

        expect(screen.getByText('PROMO20')).toBeInTheDocument();
        expect(screen.getByText(/-200 جنيه/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /إزالة الكوبون/i })).toBeInTheDocument();
    });

    it('should call onRemove when removal button clicked', () => {
        const appliedCoupon = { code: 'PROMO20', discount: 200 };
        render(
            <CouponInput
                orderTotal={orderTotal}
                onApply={mockOnApply}
                onRemove={mockOnRemove}
                appliedCoupon={appliedCoupon}
            />
        );

        const removeBtn = screen.getByRole('button', { name: /إزالة الكوبون/i });
        fireEvent.click(removeBtn);

        expect(mockOnRemove).toHaveBeenCalled();
    });
});
