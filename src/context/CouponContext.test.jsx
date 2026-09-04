import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { CouponProvider, useCoupons } from './CouponContext';

// Mock Firebase
const mocks = vi.hoisted(() => ({
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    doc: vi.fn(),
    collection: vi.fn(),
}));

vi.mock('../firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: mocks.collection,
    getDocs: mocks.getDocs,
    addDoc: mocks.addDoc,
    updateDoc: mocks.updateDoc,
    deleteDoc: mocks.deleteDoc,
    doc: mocks.doc,
    query: vi.fn(),
    where: vi.fn()
}));

const mockCoupons = [
    {
        id: 'coupon1',
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
        minOrderAmount: 1000,
        isActive: true,
        startDate: new Date(Date.now() - 86400000), // yesterday
        endDate: new Date(Date.now() + 86400000), // tomorrow
        usageCount: 0,
        usageLimit: 100
    },
    {
        id: 'coupon2',
        code: 'FIXED500',
        type: 'fixed',
        value: 500,
        minOrderAmount: 5000,
        isActive: true,
        startDate: new Date(Date.now() - 86400000),
        endDate: new Date(Date.now() + 86400000),
        usageCount: 0
    },
    {
        id: 'expired',
        code: 'EXPIRED',
        type: 'fixed',
        value: 100,
        isActive: true,
        startDate: new Date(Date.now() - 172800000),
        endDate: new Date(Date.now() - 86400000)
    }
];

describe('CouponContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.getDocs.mockResolvedValue({
            docs: mockCoupons.map(c => ({
                id: c.id,
                data: () => ({
                    ...c,
                    startDate: { toDate: () => c.startDate },
                    endDate: { toDate: () => c.endDate },
                    createdAt: { toDate: () => new Date() }
                })
            }))
        });
    });

    it('should provide coupons context', async () => {
        const { result } = renderHook(() => useCoupons(), {
            wrapper: CouponProvider
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.coupons).toHaveLength(3);
    });

    it('should validate valid percentage coupon', async () => {
        const { result } = renderHook(() => useCoupons(), {
            wrapper: CouponProvider
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        const validation = await result.current.validateCoupon('SAVE10', 2000);
        expect(validation.valid).toBe(true);
        expect(validation.discount).toBe(200); // 10% of 2000
    });

    it('should validate valid fixed coupon', async () => {
        const { result } = renderHook(() => useCoupons(), {
            wrapper: CouponProvider
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        const validation = await result.current.validateCoupon('FIXED500', 6000);
        expect(validation.valid).toBe(true);
        expect(validation.discount).toBe(500);
    });

    it('should fail for non-existent coupon', async () => {
        const { result } = renderHook(() => useCoupons(), {
            wrapper: CouponProvider
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        const validation = await result.current.validateCoupon('INVALID', 2000);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('غير صحيح');
    });

    it('should fail for expired coupon', async () => {
        const { result } = renderHook(() => useCoupons(), {
            wrapper: CouponProvider
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        const validation = await result.current.validateCoupon('EXPIRED', 2000);
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('انتهت صلاحية');
    });

    it('should fail for order below minimum amount', async () => {
        const { result } = renderHook(() => useCoupons(), {
            wrapper: CouponProvider
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        const validation = await result.current.validateCoupon('SAVE10', 500); // min is 1000
        expect(validation.valid).toBe(false);
        expect(validation.error).toContain('الحد الأدنى');
    });

    it('should create a new coupon', async () => {
        mocks.addDoc.mockResolvedValue({ id: 'new-id' });

        const { result } = renderHook(() => useCoupons(), {
            wrapper: CouponProvider
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        const newCouponData = {
            code: 'NEWYEAR',
            type: 'percentage',
            value: 20
        };

        let createResult;
        await act(async () => {
            createResult = await result.current.createCoupon(newCouponData);
        });

        expect(createResult.success).toBe(true);
        expect(mocks.addDoc).toHaveBeenCalled();
        expect(result.current.coupons).toContainEqual(expect.objectContaining({ code: 'NEWYEAR' }));
    });

    it('should delete a coupon', async () => {
        mocks.deleteDoc.mockResolvedValue();

        const { result } = renderHook(() => useCoupons(), {
            wrapper: CouponProvider
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.deleteCoupon('coupon1');
        });

        expect(mocks.deleteDoc).toHaveBeenCalled();
        expect(result.current.coupons.find(c => c.id === 'coupon1')).toBeUndefined();
    });

    it('should handle errors in fetchCoupons', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        mocks.getDocs.mockRejectedValue(new Error('Fetch failed'));

        const { result } = renderHook(() => useCoupons(), {
            wrapper: CouponProvider
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Fetch failed');
        consoleSpy.mockRestore();
    });
});
