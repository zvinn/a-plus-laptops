import { useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import './Cart.css';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const { t } = useLanguage();
    const cartRef = useRef(null);

    if (cart.length === 0) {
        return (
            <div className="cart-page page-container container empty-cart">
                <div className="empty-cart-icon">
                    <ShoppingBagIcon />
                </div>
                <h2>{t('cart.empty')}</h2>
                <p>{t('cart.emptyDesc')}</p>
                <Link to="/shop" className="btn btn-primary">{t('cart.goToShop')}</Link>
            </div>
        );
    }

    return (
        <div className="cart-page page-container container">
            <SEO
                title="Shopping Cart"
                description="Review your shopping cart and proceed to checkout."
                url="/cart"
                noIndex={true}
            />
            {/* STEP INDICATOR */}
            <div className="checkout-steps">
                <div className="step active">
                    <div className="step-circle">1</div>
                    <span>{t('cart.stepCart')}</span>
                </div>
                <div className="step">
                    <div className="step-circle">2</div>
                    <span>{t('cart.stepDetails')}</span>
                </div>
                <div className="step">
                    <div className="step-circle">3</div>
                    <span>{t('cart.stepDone')}</span>
                </div>
            </div>

            <div className="cart-layout">
                <div className="cart-items">
                    {cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <img src={item.image} alt={item.name} className="cart-item-img" />
                            <div className="cart-item-info">
                                <h3>{item.name}</h3>
                                <div className="cart-item-price">{item.price.toLocaleString()} {t('common.currency')}</div>
                            </div>
                            <div className="cart-item-actions">
                                <div className="quantity-controls">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease">
                                        <MinusIcon className="qty-icon" />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase">
                                        <PlusIcon className="qty-icon" />
                                    </button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="btn-remove" aria-label="Remove">
                                    <TrashIcon className="remove-icon" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-summary">
                    <h3>{t('cart.orderSummary')}</h3>
                    <div className="summary-row">
                        <span>{t('cart.subtotal')}</span>
                        <span>{getCartTotal().toLocaleString()} {t('common.currency')}</span>
                    </div>
                    <div className="summary-row">
                        <span>{t('cart.shipping')}</span>
                        <span className="free-shipping">{t('cart.free')}</span>
                    </div>
                    <div className="summary-total">
                        <span>{t('cart.total')}</span>
                        <span>{getCartTotal().toLocaleString()} {t('common.currency')}</span>
                    </div>
                    <Link to="/checkout" className="btn btn-primary checkout-btn">
                        {t('cart.checkout')}
                    </Link>
                    <Link to="/shop" className="continue-shopping">{t('cart.continueShopping')}</Link>
                </div>
            </div>

            {/* Mobile Sticky Checkout Bar */}
            <div className="mobile-checkout-bar">
                <div className="mobile-total">
                    <span className="mobile-total-label">{t('cart.total')}</span>
                    <span className="mobile-total-price">{getCartTotal().toLocaleString()} {t('common.currency')}</span>
                </div>
                <Link to="/checkout" className="btn btn-primary mobile-checkout-btn">
                    {t('cart.checkout')}
                </Link>
            </div>
        </div>
    );
};

export default Cart;
