/**
 * Image CDN Utility
 * Transforms image URLs to use CDN optimization
 * 
 * Supports:
 * - Unsplash image optimization
 * - Firebase Storage URL optimization
 * - Generic CDN transformation via Cloudinary free tier
 */

// Cloudinary free tier - 25GB bandwidth/month, auto-format, auto-quality
// Replace with your Cloudinary cloud name if you have one
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';

/**
 * Optimize image URL for better performance
 * @param {string} url - Original image URL
 * @param {object} options - Transform options
 * @returns {string} - Optimized URL
 */
export const optimizeImageUrl = (url, options = {}) => {
    if (!url) return url;

    const {
        width = null,
        height = null,
        quality = 'auto',
        format = 'auto', // auto, webp, avif
        fit = 'crop'
    } = options;

    // Already optimized or local file
    if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:')) {
        return url;
    }

    // Unsplash images - use their native optimization
    if (url.includes('unsplash.com')) {
        const unsplashParams = new URLSearchParams();
        if (width) unsplashParams.set('w', width);
        if (height) unsplashParams.set('h', height);
        unsplashParams.set('q', typeof quality === 'number' ? quality : 80);
        unsplashParams.set('fm', format === 'auto' ? 'webp' : format);
        unsplashParams.set('fit', fit === 'contain' ? 'max' : 'crop');
        unsplashParams.set('auto', 'format,compress');

        // Parse existing URL and add params
        const [baseUrl] = url.split('?');
        return `${baseUrl}?${unsplashParams.toString()}`;
    }

    // Firebase Storage - add alt media type for WebP if supported
    if (url.includes('firebasestorage.googleapis.com')) {
        // Firebase Storage doesn't support transforms, return as-is
        return url;
    }

    // Use Cloudinary free tier for other URLs (if configured)
    if (CLOUDINARY_CLOUD_NAME) {
        const transforms = [];

        if (width) transforms.push(`w_${width}`);
        if (height) transforms.push(`h_${height}`);
        transforms.push(`q_${quality}`);
        transforms.push(`f_${format}`);
        transforms.push(`c_${fit === 'contain' ? 'fit' : 'fill'}`);

        const encodedUrl = encodeURIComponent(url);
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transforms.join(',')}/${encodedUrl}`;
    }

    // No optimizations available, return original
    return url;
};

/**
 * Generate responsive image srcset
 * @param {string} url - Original image URL
 * @param {number[]} widths - Array of widths to generate
 * @returns {string} - srcset string
 */
export const generateSrcSet = (url, widths = [320, 640, 768, 1024, 1280]) => {
    if (!url || url.startsWith('data:') || url.startsWith('/')) {
        return '';
    }

    return widths
        .map(w => `${optimizeImageUrl(url, { width: w })} ${w}w`)
        .join(', ');
};

/**
 * Get optimized image sizes attribute
 * @param {string} type - Type of image (card, hero, thumbnail)
 * @returns {string} - sizes attribute
 */
export const getImageSizes = (type = 'card') => {
    switch (type) {
        case 'hero':
            return '100vw';
        case 'thumbnail':
            return '100px';
        case 'card':
        default:
            return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    }
};

export default {
    optimizeImageUrl,
    generateSrcSet,
    getImageSizes
};
