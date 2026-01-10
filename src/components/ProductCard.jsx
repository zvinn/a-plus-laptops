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
    ArrowTopRightOnSquareIcon,
    ScaleIcon,
    EyeIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, ScaleIcon as ScaleOutline } from '@heroicons/react/24/outline';
import OptimizedImage from './OptimizedImage';
import QuickViewModal from './QuickViewModal';
import './ProductCard.css';

// ProductCard Component
const ProductCard = memo(({ product, onCompare, isInCompare }) => {
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { t } = useLanguage();
    const { success } = useToast();
    const isWishlisted = isInWishlist(product.id);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

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

    const handleAddToCart = useCallback(() => {
        addToCart(product);
    }, [addToCart, product]);

    const handleQuickView = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsQuickViewOpen(true);
    }, []);

    return (
        <div className={`product-card ${isInCompare ? 'in-compare' : ''}`}>
            {/* Badges Container */}
            <div className="badge-container">
                {/* Use Case Badge */}
                <span className={`badge badge-usecase badge-${useCase.color}`}>
                    {useCase.icon} {t(`useCase.${useCase.key}`) || useCase.key}
                </span>

                {/* Dynamic Badges */}
                {product.stockCount === 0 && (
                    <span className="badge badge-stock" style={{ background: '#ef4444', color: 'white' }}>
                        🚫 {t('common.outOfStock') || 'Out of Stock'}
                    </span>
                )}
                {isLowStock && (
                    <span className="badge badge-stock">
                        🔥 {t('common.onlyLeft')} {product.stockCount}
                    </span>
                )}
                {discountPercent > 0 && <span className="badge badge-sale">-{discountPercent}%</span>}
            </div>

            {/* Wishlist Button */}
            <button
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistClick}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                {isWishlisted ? (
                    <HeartIcon className="heart-icon filled" />
                ) : (
                    <HeartOutline className="heart-icon" />
                )}
            </button>

            {/* Compare Button */}
            <button
                className={`compare-btn ${isInCompare ? 'active' : ''}`}
                onClick={handleCompare}
                aria-label="Add to compare"
            >
                {isInCompare ? (
                    <ScaleIcon className="compare-icon" />
                ) : (
                    <ScaleOutline className="compare-icon" />
                )}
            </button>

            {/* Quick View Button */}
            <button
                className="quickview-btn"
                onClick={handleQuickView}
                aria-label="Quick view"
            >
                <EyeIcon />
            </button>

            {/* Product Image */}
            <Link to={`/product/${product.id}`} className="card-image">
                <div className="image-glow"></div>
                <OptimizedImage
                    src={product.image}
                    alt={product.name}
                    skeletonHeight="100%"
                />
                <span className="brand-tag">{product.brand}</span>
            </Link>

            {/* Product Info */}
            <div className="card-info">
                {/* Rating & Social Proof */}
                <div className="card-social-proof">
                    <div className="rating-wrapper">
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <StarIcon
                                    key={s}
                                    className={`star-icon ${s <= Math.floor(rating) ? 'filled' : 'empty'}`}
                                />
                            ))}
                        </div>
                        <span className="rating-score">{rating}</span>
                        <span className="review-count">({reviewCount})</span>
                    </div>
                    <div className="sold-count">
                        <span className="sold-icon">📦</span>
                        <span>{soldCount}+ {t('common.sold') || 'sold'}</span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="card-title">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                </h3>

                {/* Specs - Progressive Disclosure */}
                <div className="card-specs">
                    <span className="spec-badge">{product.specs.cpu?.split(' ').slice(0, 2).join(' ')}</span>
                    <span className="spec-badge">{product.specs.gpu?.split(' ')[0]}</span>
                    <span className="spec-badge">{product.specs.ram}</span>
                </div>

                {/* Footer */}
                <div className="card-footer">
                    <div className="price-wrapper">
                        {oldPrice && (
                            <span className="old-price">{oldPrice.toLocaleString()} {t('common.currency')}</span>
                        )}
                        <span className="price">
                            {product.price.toLocaleString()}
                            <small>{t('common.currency')}</small>
                        </span>
                        {discountPercent > 0 && (
                            <span className="save-badge">{t('common.save')} {discountPercent}%</span>
                        )}
                    </div>

                    <div className="card-actions">
                        <Link to={`/product/${product.id}`} className="action-btn btn-view" title="View Details" aria-label={`View details for ${product.name}`}>
                            <ArrowTopRightOnSquareIcon />
                        </Link>
                        <button
                            onClick={handleAddToCart}
                            className="action-btn btn-cart"
                            title="Add to Cart"
                            aria-label={`Add ${product.name} to cart`}
                            disabled={product.stockCount === 0}
                        >
                            <ShoppingCartIcon />
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={product}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </div>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

