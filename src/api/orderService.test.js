import { describe, it, expect, vi, beforeEach } from 'vitest';
import { orderService } from './orderService';
import { getDocs, updateDoc, getDoc } from 'firebase/firestore';

vi.mock('../firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    getDoc: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn()
}));

describe('orderService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getOrders', () => {
        it('should return orders list', async () => {
            getDocs.mockResolvedValueOnce({
                docs: [{ id: 'o1', data: () => ({ status: 'pending' }) }]
            });
            const result = await orderService.getOrders();
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('o1');
        });
    });

    describe('updateOrderStatus', () => {
        it('should call updateDoc', async () => {
            await orderService.updateOrderStatus('o1', 'shipped');
            expect(updateDoc).toHaveBeenCalled();
        });
    });

    describe('getOrderById', () => {
        it('should return order data if exists', async () => {
            getDoc.mockResolvedValueOnce({
                exists: () => true,
                id: 'o1',
                data: () => ({ status: 'pending' })
            });
            const result = await orderService.getOrderById('o1');
            expect(result).toEqual({ id: 'o1', status: 'pending' });
        });

        it('should return null if not exists', async () => {
            getDoc.mockResolvedValueOnce({ exists: () => false });
            const result = await orderService.getOrderById('o1');
            expect(result).toBeNull();
        });
    });
});
