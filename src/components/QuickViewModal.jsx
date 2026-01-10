import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import OptimizedImage from './OptimizedImage';
import './QuickViewModal.css';

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 50
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300
        }
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        y: 50,
        transition: {
            duration: 0.2
        }
    }
};

const QuickViewModal = ({ product, isOpen, onClose }) => {
    const { addToCart } = useCart();
    const { t } = useLanguage();
    const { success } = useToast();

    // Handle escape key
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    const handleAddToCart = () => {
        addToCart(product);
        success(t('cart.addedToCart') || 'Added to cart!');
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!product) return null;

    const specs = product.specs || {};
    const discountPercent = product.oldPrice && product.oldPrice > product.price
        ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
        : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="quickview-backdrop"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        className="quickview-modal"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="quickview-title"
                    >
                        {/* Close Button */}
                        <button
                            className="quickview-close"
                            onClick={onClose}
                            aria-label="Close quick view"
                        >
                            <XMarkIcon />
                        </button>

                        {/* Product Image */}
                        <div className="quickview-image">
                            <OptimizedImage
                                src={product.image}
                                alt={product.name}
                                priority
                            />
                            {discountPercent > 0 && (
                                <span className="quickview-discount">-{discountPercent}%</span>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="quickview-details">
                            <span className="quickview-brand">{product.brand}</span>
                            <h2 id="quickview-title" className="quickview-title">{product.name}</h2>

                            {/* Price */}
                            <div className="quickview-price-wrapper">
                                {product.oldPrice && (
                                    <span className="quickview-old-price">
                                        {product.oldPrice.toLocaleString()} {t('common.currency')}
                                    </span>
                                )}
                                <span className="quickview-price">
                                    {product.price.toLocaleString()}
                                    <small>{t('common.currency')}</small>
                                </span>
                            </div>

                            {/* Key Specs */}
                            <div className="quickview-specs">
                                <h3>{t('quickView.specifications') || 'Key Specifications'}</h3>
                                <div className="quickview-specs-grid">
                                    {specs.cpu && (
                                        <div className="quickview-spec-item">
                                            <span className="spec-label">{t('product.processor') || 'Processor'}</span>
                                            <span className="spec-value">{specs.cpu}</span>
                                        </div>
                                    )}
                                    {specs.gpu && (
                                        <div className="quickview-spec-item">
                                            <span className="spec-label">{t('product.graphics') || 'Graphics'}</span>
                                            <span className="spec-value">{specs.gpu}</span>
                                        </div>
                                    )}
                                    {specs.ram && (
                                        <div className="quickview-spec-item">
                                            <span className="spec-label">{t('product.memory') || 'Memory'}</span>
                                            <span className="spec-value">{specs.ram}</span>
                                        </div>
                                    )}
                                    {specs.storage && (
                                        <div className="quickview-spec-item">
                                            <span className="spec-label">{t('product.storage') || 'Storage'}</span>
                                            <span className="spec-value">{specs.storage}</span>
                                        </div>
                                    )}
                                    {specs.screen && (
                                        <div className="quickview-spec-item">
                                            <span className="spec-label">{t('product.screen') || 'Screen'}</span>
                                            <span className="spec-value">{specs.screen}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="quickview-actions">
                                <button
                                    className="quickview-add-cart"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCartIcon />
                                    {t('quickView.addToCart') || 'Add to Cart'}
                                </button>
                                <Link
                                    to={`/product/${product.id}`}
                                    className="quickview-view-details"
                                    onClick={onClose}
                                >
                                    {t('quickView.viewDetails') || 'View Full Details'}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default QuickViewModal;
