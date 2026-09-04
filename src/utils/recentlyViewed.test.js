import { describe, it, expect, beforeEach } from 'vitest';
import { getRecentlyViewed, addRecentlyViewed, clearRecentlyViewed } from './recentlyViewed';

describe('recentlyViewed utility', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should start with empty array', () => {
        expect(getRecentlyViewed()).toEqual([]);
    });

    it('should add product ID to list', () => {
        addRecentlyViewed('prod1');
        expect(getRecentlyViewed()).toEqual(['prod1']);
    });

    it('should move existing product to front', () => {
        addRecentlyViewed('prod1');
        addRecentlyViewed('prod2');
        addRecentlyViewed('prod1');

        expect(getRecentlyViewed()).toEqual(['prod1', 'prod2']);
    });

    it('should limit items to MAX_ITEMS', () => {
        for (let i = 1; i <= 15; i++) {
            addRecentlyViewed(`prod${i}`);
        }

        const viewed = getRecentlyViewed();
        expect(viewed).toHaveLength(10);
        expect(viewed[0]).toBe('prod15');
    });

    it('should clear list', () => {
        addRecentlyViewed('prod1');
        clearRecentlyViewed();
        expect(getRecentlyViewed()).toEqual([]);
    });
});
