import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import { Heart, ShoppingCart } from 'lucide-react';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlist, clearWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { success } = useToast();
    const { t } = useLanguage();

    const handleMoveAllToCart = () => {
        if (wishlist.length === 0) return;

        wishlist.forEach(product => {
            addToCart(product);
        });

        clearWishlist();
        success(t('wishlist.movedAllToCart') || 'All items moved to cart!');
    };

    if (wishlist.length === 0) {
        return (
            <div className="wishlist-page">
                <div className="wishlist-header">
                    <h1 className="wishlist-title">{t('wishlist.title') || 'My Wishlist'}</h1>
                </div>
                <div className="wishlist-empty">
                    <Heart size={64} className="empty-icon" />
                    <h2>{t('wishlist.empty') || 'Your wishlist is empty'}</h2>
                    <p>{t('wishlist.emptyDesc') || 'Explore our products and find something you love!'}</p>
                    <Link to="/shop" className="shop-btn">
                        {t('common.goToShop') || 'Go to Shop'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="wishlist-header">
                <div>
                    <h1 className="wishlist-title">{t('wishlist.title') || 'My Wishlist'}</h1>
                    <span className="wishlist-count">
                        {wishlist.length} {wishlist.length === 1
                            ? (t('common.item') || 'item')
                            : (t('common.items') || 'items')}
                    </span>
                </div>

                <button onClick={handleMoveAllToCart} className="move-all-btn">
                    <ShoppingCart size={20} />
                    {t('wishlist.moveAllToCart') || 'Move All to Cart'}
                </button>
            </div>

            <div className="wishlist-grid">
                {wishlist.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
