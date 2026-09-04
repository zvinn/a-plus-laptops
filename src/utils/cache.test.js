import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCachedData, invalidateCache, clearAllCache, getCacheStats } from './cache';

describe('cache utility', () => {
    beforeEach(() => {
        clearAllCache();
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should fetch data on cache miss and store it', async () => {
        const fetchFn = vi.fn().mockResolvedValue({ foo: 'bar' });
        const data = await getCachedData('test_key', fetchFn);

        expect(data).toEqual({ foo: 'bar' });
        expect(fetchFn).toHaveBeenCalledTimes(1);

        const stats = getCacheStats();
        expect(stats.memoryEntries).toBe(1);
        expect(stats.storageEntries).toBe(1);
    });

    it('should return cached data on second call (memory HIT)', async () => {
        const fetchFn = vi.fn().mockResolvedValue({ foo: 'bar' });
        await getCachedData('test_key', fetchFn);
        const data = await getCachedData('test_key', fetchFn);

        expect(data).toEqual({ foo: 'bar' });
        expect(fetchFn).toHaveBeenCalledTimes(1); // Only once
    });

    it('should return data from localStorage on memory miss but storage hit', async () => {
        const fetchFn = vi.fn().mockResolvedValue({ foo: 'bar' });

        // Populate storage manually
        const cacheEntry = { data: { foo: 'bar' }, timestamp: Date.now() };
        localStorage.setItem('cache_test_key', JSON.stringify(cacheEntry));

        // Memory is clear due to beforeEach (wait, clearAllCache clears memory too)

        const data = await getCachedData('test_key', fetchFn);
        expect(data).toEqual({ foo: 'bar' });
        expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should invalidate specific key', async () => {
        const fetchFn = vi.fn().mockResolvedValue({ foo: 'bar' });
        await getCachedData('test_key', fetchFn);

        invalidateCache('test_key');

        await getCachedData('test_key', fetchFn);
        expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should respect TTL', async () => {
        const fetchFn = vi.fn().mockResolvedValue({ foo: 'bar' });
        const shortTTL = 100; // 100ms

        await getCachedData('test_key', fetchFn, shortTTL);

        // Wait for TTL to expire
        await new Promise(resolve => setTimeout(resolve, 150));

        await getCachedData('test_key', fetchFn, shortTTL);
        expect(fetchFn).toHaveBeenCalledTimes(2);
    });
});
