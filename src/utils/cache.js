/**
 * Cache Utility for Firebase Data
 * Reduces Firestore reads by caching data in memory and localStorage
 */

// Memory cache with TTL
const memoryCache = new Map();

// Default cache duration: 5 minutes
const DEFAULT_TTL = 5 * 60 * 1000;

/**
 * Get data from cache or fetch it
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function to fetch data if cache miss
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<any>} - Cached or fresh data
 */
export const getCachedData = async (key, fetchFn, ttl = DEFAULT_TTL) => {
    // Check memory cache first
    const memCached = memoryCache.get(key);
    if (memCached && Date.now() - memCached.timestamp < ttl) {
        console.log('✅ Memory Cache HIT:', key);
        return memCached.data;
    }

    // Check localStorage cache
    try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Date.now() - parsed.timestamp < ttl) {
                console.log('✅ Storage Cache HIT:', key);
                // Update memory cache
                memoryCache.set(key, parsed);
                return parsed.data;
            }
        }
    } catch (e) {
        console.warn('Cache read error:', e);
    }

    // Cache miss - fetch fresh data
    console.log('🔄 Cache MISS:', key);
    const data = await fetchFn();

    // Store in both caches
    const cacheEntry = { data, timestamp: Date.now() };
    memoryCache.set(key, cacheEntry);

    try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
    } catch (e) {
        console.warn('Cache write error:', e);
    }

    return data;
};

/**
 * Invalidate cache for a specific key
 * @param {string} key - Cache key to invalidate
 */
export const invalidateCache = (key) => {
    memoryCache.delete(key);
    try {
        localStorage.removeItem(`cache_${key}`);
    } catch (e) {
        console.warn('Cache invalidation error:', e);
    }
    console.log('🗑️ Cache invalidated:', key);
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
    memoryCache.clear();
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        });
    } catch (e) {
        console.warn('Cache clear error:', e);
    }
    console.log('🗑️ All cache cleared');
};

/**
 * Get cache stats for debugging
 */
export const getCacheStats = () => {
    const memoryKeys = Array.from(memoryCache.keys());
    let storageKeys = [];
    try {
        storageKeys = Object.keys(localStorage).filter(k => k.startsWith('cache_'));
    } catch (e) { }

    return {
        memoryEntries: memoryKeys.length,
        storageEntries: storageKeys.length,
        memoryKeys,
        storageKeys
    };
};

// Pre-defined cache keys for consistency
export const CACHE_KEYS = {
    LAPTOPS: 'laptops_all',
    LAPTOP_BY_ID: (id) => `laptop_${id}`,
    USER_ORDERS: (userId) => `orders_${userId}`,
    BRANDS: 'brands_all'
};

export default {
    getCachedData,
    invalidateCache,
    clearAllCache,
    getCacheStats,
    CACHE_KEYS
};
