import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CouponManager from './CouponManager';
import { useCoupons } from '../../context/CouponContext';

// Mock Context
vi.mock('../../context/CouponContext', () => ({
    useCoupons: vi.fn()
}));

vi.mock('../../context/ConfirmContext', () => ({
    useConfirm: vi.fn(() => ({
        confirm: vi.fn(() => Promise.resolve(true))
    }))
}));

describe('CouponManager Page', () => {
    const mockCreate = vi.fn();
    const mockUpdate = vi.fn();
    const mockDelete = vi.fn();
    const mockToggle = vi.fn();

    const mockCoupons = [
        {
            id: 'c1',
            code: 'TEST10',
            type: 'percentage',
            value: 10,
            usageCount: 0,
            isActive: true,
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString()
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        useCoupons.mockReturnValue({
            coupons: mockCoupons,
            loading: false,
            createCoupon: mockCreate,
            updateCoupon: mockUpdate,
            deleteCoupon: mockDelete,
            toggleCouponStatus: mockToggle
        });
    });

    const renderComponent = () => {
        return render(<CouponManager />);
    };

    it('should render coupon list', () => {
        renderComponent();
        expect(screen.getByText('إدارة الكوبونات')).toBeInTheDocument();
        expect(screen.getByText('TEST10')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument(); // Value
    });

    it('should filter coupons', () => {
        renderComponent();

        const searchInput = screen.getByPlaceholderText('البحث بكود الكوبون...');
        fireEvent.change(searchInput, { target: { value: 'XYZ' } });

        expect(screen.queryByText('TEST10')).not.toBeInTheDocument();
        expect(screen.getByText('لم يتم العثور على نتائج')).toBeInTheDocument();
    });

    it('should open create modal', () => {
        renderComponent();

        fireEvent.click(screen.getByText('إضافة كوبون جديد'));
        expect(screen.getByText('إضافة كوبون جديد', { selector: 'h3' })).toBeInTheDocument();
    });

    it('should submit new coupon form', async () => {
        renderComponent();

        // Open Modal
        fireEvent.click(screen.getByText('إضافة كوبون جديد'));

        // Fill form
        fireEvent.change(screen.getByPlaceholderText('مثال: WINTER25'), { target: { value: 'NEW20' } });
        fireEvent.change(screen.getByPlaceholderText('25'), { target: { value: '20' } });

        // Submit
        fireEvent.click(screen.getByText('إنشاء الكوبون'));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
                code: 'NEW20',
                value: 20
            }));
        });
    });

    it('should handle edit', () => {
        renderComponent();

        // Find edit button (assuming layout, using class or title is better)
        const editBtn = screen.getByTitle('تعديل');
        fireEvent.click(editBtn);

        expect(screen.getByText('تعديل الكوبون')).toBeInTheDocument();

        // Check pre-fill
        expect(screen.getByDisplayValue('TEST10')).toBeInTheDocument();
    });

    it('should handle delete', async () => {
        renderComponent();

        const deleteBtn = screen.getByTitle('حذف');
        fireEvent.click(deleteBtn);

        // useConfirm is mocked to return true, so delete should proceed
        await waitFor(() => {
            expect(mockDelete).toHaveBeenCalledWith('c1');
        });
    });
});
