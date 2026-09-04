import { memo, useMemo, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUseCase, getMockSoldCount, getMockRating, getMockReviewCount } from '../utils/productUtils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import {
    StarIcon,
    HeartIcon,
    ShoppingCartIcon,
    EyeIcon,
    CpuChipIcon,
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, ScaleIcon as ScaleOutline } from '@heroicons/react/24/outline';
import OptimizedImage from './OptimizedImage';
import QuickViewModal from './QuickViewModal';
import './ProductCardPremium.css';

/**
 * Premium Product Card - Dark Theme with Visible Specs
 * Optimized for high-ticket laptop sales (15,000+ EGP)
 */
const ProductCardPremium = memo(({ product, onCompare, isInCompare }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { t } = useLanguage();
    const { success } = useToast();
    const isWishlisted = isInWishlist(product.id);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Memoize derived values
    const useCase = useMemo(() => getUseCase(product), [product]);
    const soldCount = useMemo(() => getMockSoldCount(product.id), [product.id]);
    const rating = useMemo(() => getMockRating(product.id), [product.id]);
    const reviewCount = useMemo(() => getMockReviewCount(product.id), [product.id]);

    // Memoize computed values
    const { isLowStock, discountPercent, oldPrice } = useMemo(() => {
        const stock = product.stockCount !== undefined ? product.stockCount : 50;
        const threshold = product.lowStockThreshold || 5;
        const lowStock = stock <= threshold && stock > 0;

        const hasDiscount = product.oldPrice && product.oldPrice > product.price;
        const discount = hasDiscount
            ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
            : 0;

        return { isLowStock: lowStock, discountPercent: discount, oldPrice: product.oldPrice };
    }, [product.stockCount, product.lowStockThreshold, product.oldPrice, product.price]);

    // Badge color mapping
    const getBadgeClass = () => {
        switch (useCase.key) {
            case 'gaming': return 'badge-gaming';
            case 'work': return 'badge-work';
            case 'student': return 'badge-student';
            default: return 'badge-default';
        }
    };

    // Memoize handlers
    const handleCompare = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onCompare) {
            onCompare(product);
            success(t('comparison.addedToCompare') || 'Added to compare!');
        }
    }, [onCompare, product, success, t]);

    const handleWishlistClick = useCallback((e) => {
        e.preventDefault();
        toggleWishlist(product);
    }, [toggleWishlist, product]);

    const handleAddToCart = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        success(t('cart.addedToCart') || 'Added to cart!');
    }, [addToCart, product, success, t]);

    const handleQuickView = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsQuickViewOpen(true);
    }, []);

    return (
        <article
            className={`premium-card ${isInCompare ? 'in-compare' : ''} ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ═══════════ BADGE SECTION ═══════════ */}
            <div className="premium-badges">
                {/* Use Case Badge */}
                <span className={`premium-badge ${getBadgeClass()}`}>
                    {useCase.icon} {t(`useCase.${useCase.key}`) || useCase.key}
                </span>

                {/* Discount Badge */}
                {discountPercent > 0 && (
                    <span className="premium-badge badge-discount">
                        -{discountPercent}%
                    </span>
                )}

                {/* Low Stock Warning */}
                {isLowStock && (
                    <span className="premium-badge badge-lowstock">
                        🔥 {product.stockCount} left
                    </span>
                )}

                {/* Out of Stock */}
                {product.stockCount === 0 && (
                    <span className="premium-badge badge-outofstock">
                        {t('common.outOfStock') || 'Out of Stock'}
                    </span>
                )}
            </div>

            {/* ═══════════ ACTION BUTTONS (Right Side) ═══════════ */}
            <div className="premium-actions-right">
                {/* Wishlist Button */}
                <button
                    className={`premium-action-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={handleWishlistClick}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    {isWishlisted ? (
                        <HeartIcon className="icon-heart filled" />
                    ) : (
                        <HeartOutline className="icon-heart" />
                    )}
                </button>

                {/* Compare Button */}
                <button
                    className={`premium-action-btn ${isInCompare ? 'active-compare' : ''}`}
                    onClick={handleCompare}
                    aria-label="Add to compare"
                >
                    <ScaleOutline className="icon-compare" />
                </button>

                {/* Quick View Button */}
                <button
                    className="premium-action-btn btn-quickview"
                    onClick={handleQuickView}
                    aria-label="Quick view"
                >
                    <EyeIcon className="icon-eye" />
                </button>
            </div>

            {/* ═══════════ IMAGE SECTION ═══════════ */}
            <Link to={`/product/${product.id}`} className="premium-image-container">
                {/* Tech Grid Pattern */}
                <div className="premium-grid-pattern" />

                {/* Hover Glow Effect */}
                <div className={`premium-glow ${isHovered ? 'visible' : ''}`} />

                {/* Product Image */}
                <div className="premium-image-wrapper">
                    <OptimizedImage
                        src={product.image}
                        alt={product.name}
                        skeletonHeight="100%"
                    />
                </div>

                {/* Brand Tag */}
                <span className="premium-brand-tag">
                    {product.brand}
                </span>
            </Link>

            {/* ═══════════ CONTENT SECTION ═══════════ */}
            <div className="premium-content">
                {/* Product Title */}
                <h3 className="premium-title">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>

                {/* ═══════════ SPECS ROW (Critical for Laptops) ═══════════ */}
                <div className="premium-specs">
                    {/* CPU */}
                    <div className="spec-item spec-cpu">
                        <CpuChipIcon className="spec-icon" />
                        <span className="spec-text">
                            {product.specs?.cpu?.split(' ').slice(0, 2).join(' ') || 'Intel i7'}
                        </span>
                    </div>

                    {/* GPU */}
                    <div className="spec-item spec-gpu">
                        <svg className="spec-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 4h12v2H4V4zm0 4h12v8H4V8zm2 2v4h8v-4H6zm2 1h4v2H8v-2z" />
                        </svg>
                        <span className="spec-text">
                            {product.specs?.gpu?.split(' ').slice(0, 2).join(' ') || 'RTX 4060'}
                        </span>
                    </div>

                    {/* RAM */}
                    <div className="spec-item spec-ram">
                        <svg className="spec-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm2 0v10h10V5H5zm2 2h2v2H7V7zm4 0h2v2h-2V7zm-4 4h2v2H7v-2zm4 0h2v2h-2v-2z" />
                        </svg>
                        <span className="spec-text">
                            {product.specs?.ram || '16GB'}
                        </span>
                    </div>
                </div>

                {/* Rating Row */}
                <div className="premium-rating">
                    <div className="stars-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon
                                key={star}
                                className={`star-icon ${star <= Math.floor(rating) ? 'filled' : 'empty'}`}
                            />
                        ))}
                    </div>
                    <span className="rating-score">{rating}</span>
                    <span className="review-count">({reviewCount})</span>
                    <span className="sold-info">
                        📦 {soldCount}+ {t('common.sold') || 'sold'}
                    </span>
                </div>

                {/* ═══════════ FOOTER: PRICE + CTA ═══════════ */}
                <div className="premium-footer">
                    {/* Price Section */}
                    <div className="premium-price-wrapper">
                        {oldPrice && (
                            <span className="premium-old-price">
                                {oldPrice.toLocaleString()} {t('common.currency')}
                            </span>
                        )}
                        <span className="premium-price">
                            {product.price.toLocaleString()}
                            <small>{t('common.currency')}</small>
                        </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="premium-add-to-cart"
                        disabled={product.stockCount === 0}
                        aria-label={`Add ${product.name} to cart`}
                    >
                        <ShoppingCartIcon className="cart-icon" />
                        <span>{t('cart.addToCart') || 'Add to Cart'}</span>
                    </button>
                </div>
            </div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={product}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </article>
    );
});

ProductCardPremium.displayName = 'ProductCardPremium';

export default ProductCardPremium;
