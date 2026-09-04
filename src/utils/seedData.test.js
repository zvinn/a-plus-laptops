import { describe, it, expect, vi, beforeEach } from 'vitest';
import { seedLaptops } from './seedData';
import { setDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    collection: vi.fn(() => 'laptops-collection'),
    doc: vi.fn(() => 'doc-ref'),
    setDoc: vi.fn(() => Promise.resolve())
}));

vi.mock('../firebase', () => ({
    db: {}
}));

vi.mock('../data/laptops', () => ({
    laptops: [
        { id: 1, name: 'Test Laptop 1', brand: 'Dell', price: 10000 },
        { id: 2, name: 'Test Laptop 2', brand: 'HP', price: 12000 }
    ]
}));

describe('seedData utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    it('should be a function', () => {
        expect(typeof seedLaptops).toBe('function');
    });

    it('should log starting message', async () => {
        await seedLaptops();
        expect(console.log).toHaveBeenCalledWith('Starting data seeding...');
    });

    it('should call setDoc for each laptop', async () => {
        await seedLaptops();
        expect(setDoc).toHaveBeenCalledTimes(2);
    });

    it('should log success for each laptop', async () => {
        await seedLaptops();
        expect(console.log).toHaveBeenCalledWith('Uploaded: Test Laptop 1');
        expect(console.log).toHaveBeenCalledWith('Uploaded: Test Laptop 2');
    });

    it('should log completion message', async () => {
        await seedLaptops();
        expect(console.log).toHaveBeenCalledWith('Data seeding completed successfully!');
    });

    it('should handle errors gracefully', async () => {
        const error = new Error('Firebase error');
        setDoc.mockRejectedValueOnce(error);

        await seedLaptops();

        expect(console.error).toHaveBeenCalledWith('Error seeding data:', error);
    });
});
