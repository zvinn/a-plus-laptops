import { describe, it, expect } from 'vitest';
import { searchLaptops } from './semanticSearch';

const mockLaptops = [
    {
        id: '1',
        name: 'Gaming Pro X',
        brand: 'Asus',
        price: 45000,
        performance: { gaming: 95, workstation: 80, battery: 50 },
        specs: { screen: '15.6" OLED 4K' }
    },
    {
        id: '2',
        name: 'MacBook Air',
        brand: 'Apple',
        price: 35000,
        performance: { gaming: 30, workstation: 70, battery: 95 },
        specs: { screen: '13.3" Retina' }
    },
    {
        id: '3',
        name: 'Student Slim',
        brand: 'Lenovo',
        price: 18000,
        performance: { gaming: 20, workstation: 50, battery: 80 },
        specs: { screen: '14" FHD' }
    }
];

describe('semanticSearch utility', () => {
    it('should find gaming laptops', () => {
        const results = searchLaptops('I want a gaming laptop', mockLaptops);
        expect(results[0].name).toBe('Gaming Pro X');
        expect(results[0].matchReasons).toContain('Top-tier Gaming Performance');
    });

    it('should find Apple laptops when requested', () => {
        const results = searchLaptops('Show me macbooks or apple laptops', mockLaptops);
        expect(results).toHaveLength(1);
        expect(results[0].brand).toBe('Apple');
    });

    it('should recommend student laptops for "study"', () => {
        const results = searchLaptops('laptop for study', mockLaptops);
        expect(results[0].name).toBe('Student Slim');
    });

    it('should handle budget constraints', () => {
        const results = searchLaptops('laptop under 20000', mockLaptops);
        expect(results[0].name).toBe('Student Slim');
    });

    it('should fallback to name match for generic queries', () => {
        const results = searchLaptops('Asus', mockLaptops);
        expect(results[0].name).toBe('Gaming Pro X');
    });

    it('should return empty array for empty query', () => {
        expect(searchLaptops('', mockLaptops)).toEqual([]);
    });
});
