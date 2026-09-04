import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc, updateDoc, runTransaction } from 'firebase/firestore';
import { ShoppingBagIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { trackBeginCheckout, trackPurchase } from '../utils/analytics';
import emailjs from '@emailjs/browser';
import CouponInput from '../components/CouponInput';
import './Checkout.css';

const STORAGE_KEY = 'checkout_form_data';
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const EGYPT_GOVERNORATES = [
    "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum",
    "Gharbiya", "Ismailia", "Menofia", "Minya", "Qaliubiya", "New Valley", "Suez",
    "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta", "Sharkia", "South Sinai",
    "Kafr Al Sheikh", "Matrouh", "Luxor", "Qena", "North Sinai", "Sohag"
].sort();

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const { t } = useLanguage();
    const { success, error: toastError } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Coupon State
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discount, setDiscount] = useState(0);

    // Calculate final total with discount
    const getFinalTotal = () => {
        return Math.max(0, getCartTotal() - discount);
    };

    // Coupon handlers
    const handleCouponApply = (discountAmount, couponId, couponCode) => {
        setDiscount(discountAmount);
        setAppliedCoupon({ id: couponId, code: couponCode, discount: discountAmount });
    };

    const handleCouponRemove = () => {
        setDiscount(0);
        setAppliedCoupon(null);
    };

    // Initialize form with saved data or defaults
    const getInitialFormData = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    fullName: parsed.fullName || '',
                    email: currentUser?.email || parsed.email || '',
                    address: parsed.address || '',
                    city: parsed.city || '',
                    phone: parsed.phone || ''
                };
            }
        } catch (e) {
            console.warn('Failed to load saved form data');
        }
        return {
            fullName: '',
            email: currentUser ? currentUser.email : '',
            address: '',
            city: '',
            phone: ''
        };
    };

    const [formData, setFormData] = useState(getInitialFormData);

    // Auto-save form data to localStorage (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [formData]);

    useEffect(() => {
        if (cart.length > 0) {
            trackBeginCheckout(getCartTotal());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Format phone number as user types
    const formatPhoneNumber = (value) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');

        // Limit to 11 digits
        const limited = digits.slice(0, 11);

        // Format: 010 1234 5678
        if (limited.length <= 3) {
            return limited;
        } else if (limited.length <= 7) {
            return `${limited.slice(0, 3)} ${limited.slice(3)}`;
        } else {
            return `${limited.slice(0, 3)} ${limited.slice(3, 7)} ${limited.slice(7)}`;
        }
    };

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateEgyptianPhone = (phone) => {
        const phoneRegex = /^01[0125][0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = t('errors.required');
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = t('errors.nameMin');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('errors.required');
        } else if (!validateEmail(formData.email)) {
            newErrors.email = t('errors.emailInvalid');
        }

        if (!formData.phone.trim()) {
            newErrors.phone = t('errors.required');
        } else if (!validateEgyptianPhone(formData.phone)) {
            newErrors.phone = t('errors.phoneInvalid');
        }

        if (!formData.city.trim()) {
            newErrors.city = t('errors.required');
        }

        if (!formData.address.trim()) {
            newErrors.address = t('errors.required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Debounced validation
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const debouncedValidation = useCallback(
        debounce((field, value) => {
            let error = null;

            if (field === 'fullName') {
                if (!value.trim()) error = t('errors.required');
                else if (value.trim().length < 2) error = t('errors.nameMin');
            } else if (field === 'email') {
                if (!value.trim()) error = t('errors.required');
                else if (!validateEmail(value)) error = t('errors.emailInvalid');
            } else if (field === 'phone') {
                if (!value.trim()) error = t('errors.required');
                else if (!validateEgyptianPhone(value)) error = t('errors.phoneInvalid');
            } else if (field === 'city' || field === 'address') {
                if (!value.trim()) error = t('errors.required');
            }

            setErrors(prev => ({ ...prev, [field]: error }));
        }, 500),
        [t]
    );

    // Real-time validation on blur
    const handleBlur = (field) => {
        const value = formData[field];
        let error = null;

        if (field === 'fullName') {
            if (!value.trim()) error = t('errors.required');
            else if (value.trim().length < 2) error = t('errors.nameMin');
        } else if (field === 'email') {
            if (!value.trim()) error = t('errors.required');
            else if (!validateEmail(value)) error = t('errors.emailInvalid');
        } else if (field === 'phone') {
            if (!value.trim()) error = t('errors.required');
            else if (!validateEgyptianPhone(value)) error = t('errors.phoneInvalid');
        } else if (field === 'city' || field === 'address') {
            if (!value.trim()) error = t('errors.required');
        }

        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Apply phone formatting
        const processedValue = name === 'phone' ? formatPhoneNumber(value) : value;

        setFormData(prev => ({ ...prev, [name]: processedValue }));

        // Debounced validation if field has error
        if (errors[name]) {
            debouncedValidation(name, processedValue);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const cleanPhone = formData.phone.replace(/\s/g, '');

            const orderData = {
                userId: currentUser ? currentUser.uid : 'guest',
                customerName: formData.fullName,
                customerEmail: formData.email,
                shippingDetails: {
                    address: formData.address,
                    city: formData.city,
                    phone: cleanPhone
                },
                items: cart,
                subtotal: getCartTotal(),
                discount: discount,
                couponId: appliedCoupon?.id || null,
                couponCode: appliedCoupon?.code || null,
                totalAmount: getFinalTotal(),
                status: 'pending_whatsapp',
                createdAt: serverTimestamp()
            };


            // 1. & 2. & 3. Atomic Transaction for Stock Check & Order Creation
            const orderId = await runTransaction(db, async (transaction) => {
                const stockUpdates = [];

                // Read all current stock levels FIRST
                for (const item of cart) {
                    const itemRef = doc(db, "laptops", item.id);
                    const itemSnap = await transaction.get(itemRef);

                    if (!itemSnap.exists()) {
                        throw new Error(`Product ${item.name} no longer exists.`);
                    }

                    const currentStock = itemSnap.data().stockCount || 0;
                    if (currentStock < item.quantity) {
                        throw new Error(`Sorry, ${item.name} is out of stock (Only ${currentStock} left).`);
                    }

                    // Queue update for later in transaction
                    stockUpdates.push({ ref: itemRef, newStock: currentStock - item.quantity });
                }

                // If we get here, all stock is available. Now Perform Writes.

                // A. Create Order
                const newOrderRef = doc(collection(db, "orders"));
                transaction.set(newOrderRef, orderData);

                // B. Update Stock
                stockUpdates.forEach(update => {
                    transaction.update(update.ref, { stockCount: update.newStock });
                });

                return newOrderRef.id;
            });

            // Note: docRef was used in original code, now we have orderId from transaction
            const docRef = { id: orderId };

            // Clear saved form data on successful order
            localStorage.removeItem(STORAGE_KEY);

            const ownerNumber = import.meta.env.VITE_OWNER_PHONE_NUMBER;
            let message = `*New Order from A+ Website* 🛒\n\n`;
            message += `*Customer:* ${formData.fullName}\n`;
            message += `*Phone:* ${cleanPhone}\n`;
            message += `*Address:* ${formData.city}, ${formData.address}\n\n`;
            message += `*Order Details:*\n`;

            cart.forEach(item => {
                message += `- ${item.name} (x${item.quantity}): ${(item.price * item.quantity).toLocaleString()} EGP\n`;
            });

            if (discount > 0) {
                message += `\n*Discount (${appliedCoupon?.code}): -${discount.toLocaleString()} EGP*`;
            }
            message += `\n*Total: ${getFinalTotal().toLocaleString()} EGP*`;

            clearCart();
            trackPurchase(docRef.id, getFinalTotal(), cart);
            setShowSuccess(true);
            success("Order placed successfully!");

            // Send Confirmation Emails (Non-blocking)
            const sendOrderEmails = async () => {
                try {
                    // Email to Admin
                    await emailjs.send(
                        EMAILJS_SERVICE_ID,
                        EMAILJS_TEMPLATE_ID,
                        {
                            to_name: "Admin",
                            message: `New Order detected! Customer: ${formData.fullName}, Total: ${getCartTotal().toLocaleString()} EGP`,
                            reply_to: formData.email,
                        },
                        EMAILJS_PUBLIC_KEY
                    );

                    // Email to Customer
                    await emailjs.send(
                        EMAILJS_SERVICE_ID,
                        EMAILJS_TEMPLATE_ID, // Using same template for simplicity as requested, or could be different
                        {
                            to_name: formData.fullName,
                            message: "Thanks for your order at A Plus+! We've received your request.",
                            reply_to: "support@aplus.com", // Example support email
                            to_email: formData.email
                        },
                        EMAILJS_PUBLIC_KEY
                    );
                    console.log("Order confirmation emails sent successfully.");
                } catch (emailError) {
                    console.error("Failed to send order confirmation emails:", emailError);
                    // We don't block the user flow if email fails
                }
            };

            // Trigger email sending
            sendOrderEmails();

            // Redirect to WhatsApp after showing success animation
            setTimeout(() => {
                const whatsappUrl = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(message)}`;
                window.location.href = whatsappUrl;
            }, 1500);

        } catch (error) {
            console.error("Error placing order: ", error);
            // Show the specific error message from the transaction (e.g., "Out of stock")
            toastError(error.message || t('errors.orderFailed'));
            setLoading(false);
        }
    };

    if (cart.length === 0 && !showSuccess) {
        return (
            <div className="container page-container checkout-empty">
                <div className="empty-icon">
                    <ShoppingBagIcon />
                </div>
                <h2>{t('checkout.emptyCart')}</h2>
                <button onClick={() => navigate('/shop')} className="btn btn-primary">
                    {t('checkout.goShopping')}
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page page-container container">
            <SEO
                title="Checkout"
                description="Complete your order and checkout securely."
                url="/checkout"
                noIndex={true}
            />

            {showSuccess ? (
                <div className="checkout-success">
                    <div className="success-animation">
                        <div className="success-checkmark">
                            <svg viewBox="0 0 52 52">
                                <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle" />
                                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
                            </svg>
                        </div>
                        <h2>Order Placed Successfully! 🎉</h2>
                        <p>Redirecting to WhatsApp...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* STEP INDICATOR */}
                    <div className="checkout-steps">
                        <div className="step completed">
                            <div className="step-circle">
                                <CheckCircleIcon className="check-icon" />
                            </div>
                            <span>{t('cart.stepCart')}</span>
                        </div>
                        <div className="step active">
                            <div className="step-circle">2</div>
                            <span>{t('cart.stepDetails')}</span>
                        </div>
                        <div className="step">
                            <div className="step-circle">3</div>
                            <span>{t('cart.stepDone')}</span>
                        </div>
                    </div>

                    <div className="checkout-layout">


                        // ... inside component ...

                        <div className="checkout-form-section">
                            <div className="form-header">
                                <h2>{t('checkout.title')}</h2>
                                <span className="autosave-indicator">
                                    <span className="autosave-dot"></span>
                                    Auto-saved
                                </span>
                            </div>
                            <form id="checkout-form" onSubmit={handleSubmit} className="checkout-form" noValidate>
                                <div className={`form-group floating-group ${errors.fullName ? 'has-error' : ''}`}>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('fullName')}
                                        disabled={loading}
                                        placeholder=" "
                                        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                                    />
                                    <label htmlFor="fullName">{t('checkout.fullName')}</label>
                                    {errors.fullName && (
                                        <span id="fullName-error" className="field-error" role="alert">
                                            {errors.fullName}
                                        </span>
                                    )}
                                </div>
                                <div className={`form-group floating-group ${errors.email ? 'has-error' : ''}`}>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('email')}
                                        disabled={loading}
                                        placeholder=" "
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                    />
                                    <label htmlFor="email">{t('checkout.email')}</label>
                                    {errors.email && (
                                        <span id="email-error" className="field-error" role="alert">
                                            {errors.email}
                                        </span>
                                    )}
                                </div>
                                <div className={`form-group floating-group ${errors.phone ? 'has-error' : ''}`}>
                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('phone')}
                                        disabled={loading}
                                        placeholder=" "
                                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                                    />
                                    <label htmlFor="phone">{t('checkout.phone')}</label>
                                    {errors.phone && (
                                        <span id="phone-error" className="field-error" role="alert">
                                            {errors.phone}
                                        </span>
                                    )}
                                </div>
                                <div className="form-row">
                                    <div className={`form-group floating-group ${errors.city ? 'has-error' : ''}`}>
                                        <select
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            onBlur={() => handleBlur('city')}
                                            disabled={loading}
                                            className={formData.city ? 'has-value' : ''}
                                            aria-describedby={errors.city ? 'city-error' : undefined}
                                        >
                                            <option value="" disabled></option>
                                            {EGYPT_GOVERNORATES.map(gov => (
                                                <option key={gov} value={gov}>{gov}</option>
                                            ))}
                                        </select>
                                        <label htmlFor="city">{t('checkout.city')}</label>
                                        {errors.city && (
                                            <span id="city-error" className="field-error" role="alert">
                                                {errors.city}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`form-group floating-group ${errors.address ? 'has-error' : ''}`}>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('address')}
                                        disabled={loading}
                                        rows="3"
                                        placeholder=" "
                                        aria-describedby={errors.address ? 'address-error' : undefined}
                                    ></textarea>
                                    <label htmlFor="address">{t('checkout.address')}</label>
                                    {errors.address && (
                                        <span id="address-error" className="field-error" role="alert">
                                            {errors.address}
                                        </span>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="checkout-summary-section">
                            <div className="summary-card">
                                <h3>{t('cart.orderSummary')}</h3>
                                <div className="summary-items">
                                    {cart.map(item => (
                                        <div key={item.id} className="summary-item">
                                            <div className="summary-item-info">
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-qty">x{item.quantity}</span>
                                            </div>
                                            <span className="item-price">{(item.price * item.quantity).toLocaleString()} {t('common.currency')}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Coupon Input Section */}
                                <div className="coupon-section">
                                    <CouponInput
                                        orderTotal={getCartTotal()}
                                        onApply={handleCouponApply}
                                        onRemove={handleCouponRemove}
                                        appliedCoupon={appliedCoupon}
                                    />
                                </div>

                                <div className="summary-divider"></div>

                                {/* Subtotal */}
                                <div className="summary-row">
                                    <span>المجموع الفرعي</span>
                                    <span>{getCartTotal().toLocaleString()} {t('common.currency')}</span>
                                </div>

                                {/* Discount Row (if coupon applied) */}
                                {discount > 0 && (
                                    <div className="summary-row discount">
                                        <span>الخصم ({appliedCoupon?.code})</span>
                                        <span className="discount-amount">-{discount.toLocaleString()} {t('common.currency')}</span>
                                    </div>
                                )}

                                <div className="summary-divider"></div>

                                {/* Final Total */}
                                <div className="summary-total">
                                    <span>{t('cart.total')}</span>
                                    <span className={discount > 0 ? 'discounted-total' : ''}>
                                        {getFinalTotal().toLocaleString()} {t('common.currency')}
                                    </span>
                                </div>
                                <button
                                    type="submit"
                                    form="checkout-form"
                                    className="btn btn-whatsapp"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="btn-loading">
                                            <span className="spinner"></span>
                                            {t('checkout.processing')}
                                        </span>
                                    ) : (
                                        <>
                                            <span>{t('checkout.placeOrder')}</span>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Checkout;
