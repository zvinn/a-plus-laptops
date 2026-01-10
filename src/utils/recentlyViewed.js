/**
 * Recently Viewed Products Utility
 * Manages a list of recently viewed product IDs in localStorage
 */

const STORAGE_KEY = 'recentlyViewedProducts';
const MAX_ITEMS = 10;

/**
 * Get the list of recently viewed product IDs
 * @returns {string[]} Array of product IDs, most recent first
 */
export const getRecentlyViewed = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (error) {
        console.error('Error reading recently viewed products:', error);
        return [];
    }
};

/**
 * Add a product ID to the recently viewed list
 * @param {string} productId - The product ID to add
 */
export const addRecentlyViewed = (productId) => {
    try {
        if (!productId) return;

        let viewed = getRecentlyViewed();

        // Remove if already exists (to move to front)
        viewed = viewed.filter(id => id !== productId);

        // Add to front of array
        viewed.unshift(productId);

        // Limit to MAX_ITEMS
        viewed = viewed.slice(0, MAX_ITEMS);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
    } catch (error) {
        console.error('Error saving recently viewed product:', error);
    }
};

/**
 * Clear all recently viewed products
 */
export const clearRecentlyViewed = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing recently viewed products:', error);
    }
};
