import { useState, useEffect } from 'react';
import Skeleton from './Skeleton';

/**
 * OptimizedImage Component
 * Handles lazy loading, skeleton state, and priority loading for LCP improvement.
 */
const OptimizedImage = ({
    src,
    alt,
    className = '',
    priority = false,
    style = {},
    skeletonHeight = '100%',
    onLoad = () => { }
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // For priority images, we want to ensure they start loading immediately
        if (priority && src) {
            const img = new Image();
            img.src = src;
        }
    }, [src, priority]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad();
    };

    const handleError = () => {
        setHasError(true);
        setIsLoaded(true); // Stop showing skeleton on error
    };

    return (
        <div className={`optimized-image-container ${className}`} style={{ position: 'relative', overflow: 'hidden', ...style }}>
            {!isLoaded && !hasError && (
                <Skeleton
                    type="rect"
                    height={skeletonHeight}
                    style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                />
            )}

            <img
                src={src}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                fetchpriority={priority ? 'high' : 'auto'}
                onLoad={handleLoad}
                onError={handleError}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.4s ease-in-out',
                }}
                className={isLoaded ? 'image-loaded' : 'image-loading'}
            />

            {hasError && (
                <div className="image-error-placeholder" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                }}>
                    📷 Error Loading Image
                </div>
            )}
        </div>
    );
};

export default OptimizedImage;
