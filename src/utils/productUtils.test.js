import { describe, it, expect } from 'vitest';
import { getUseCase, calculateDiscount, getMockRating } from './productUtils';

describe('Product Utils', () => {
    describe('getUseCase', () => {
        it('should return gaming for RTX GPUs', () => {
            const product = { specs: { gpu: 'NVIDIA GeForce RTX 4060', cpu: 'Intel i5' } };
            const result = getUseCase(product);
            expect(result.key).toBe('gaming');
        });

        it('should return work for i9 processors', () => {
            const product = { specs: { gpu: 'Integrated', cpu: 'Intel Core i9' } };
            const result = getUseCase(product);
            expect(result.key).toBe('work');
        });

        it('should return student for cheap laptops', () => {
            const product = { price: 15000, specs: {} };
            const result = getUseCase(product);
            expect(result.key).toBe('student');
        });
    });

    describe('calculateDiscount', () => {
        it('should calculate correct discount percentage', () => {
            expect(calculateDiscount(80, 100)).toBe(20); // 20% off
            expect(calculateDiscount(50, 100)).toBe(50); // 50% off
        });

        it('should return 0 if no discount', () => {
            expect(calculateDiscount(100, 100)).toBe(0);
            expect(calculateDiscount(120, 100)).toBe(0);
        });
    });

    describe('Using Mock Data (Deterministic)', () => {
        it('should return consistent rating for same product ID', () => {
            const rating1 = getMockRating("123");
            const rating2 = getMockRating("123");
            expect(rating1).toBe(rating2);
        });
    });
});
