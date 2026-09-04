import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from './productService';
import { getDocs, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

vi.mock('../firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    deleteDoc: vi.fn(),
    updateDoc: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    serverTimestamp: vi.fn()
}));

describe('productService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getProducts', () => {
        it('should return products list', async () => {
            getDocs.mockResolvedValueOnce({
                docs: [{ id: '1', data: () => ({ name: 'Laptop' }) }]
            });
            const result = await productService.getProducts();
            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Laptop');
        });
    });

    describe('addProduct', () => {
        it('should add product and return it with ID', async () => {
            const newProduct = { name: 'New Laptop', price: '1000' };
            addDoc.mockResolvedValueOnce({ id: 'new-id' });

            const result = await productService.addProduct(newProduct);
            expect(result.id).toBe('new-id');
            expect(result.price).toBe(1000);
            expect(addDoc).toHaveBeenCalled();
        });
    });

    describe('deleteProduct', () => {
        it('should call deleteDoc', async () => {
            await productService.deleteProduct('1');
            expect(deleteDoc).toHaveBeenCalled();
        });
    });

    describe('updateProduct', () => {
        it('should call updateDoc', async () => {
            await productService.updateProduct('1', { name: 'Updated' });
            expect(updateDoc).toHaveBeenCalled();
        });
    });
});
