import { useState, useCallback } from 'react';
import { useCoupons } from '../context/CouponContext';
import { Ticket, X, Check, Loader } from 'lucide-react';
import './CouponInput.css';

/**
 * CouponInput - Component for entering and validating coupon codes
 * @param {number} orderTotal - Current order total for validation
 * @param {function} onApply - Callback when coupon is applied: (discount, couponId, couponCode) => void
 * @param {function} onRemove - Callback when coupon is removed
 */
const CouponInput = ({ orderTotal, onApply, onRemove, appliedCoupon = null }) => {
    const { validateCoupon } = useCoupons();
    const [code, setCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleApply = useCallback(async () => {
        if (!code.trim()) {
            setError('أدخل كود الخصم');
            return;
        }

        setIsValidating(true);
        setError(null);
        setSuccess(null);

        const result = await validateCoupon(code, orderTotal);

        if (result.valid) {
            setSuccess(result.message);
            onApply(result.discount, result.coupon.id, result.coupon.code);
            setCode('');
        } else {
            setError(result.error);
        }

        setIsValidating(false);
    }, [code, orderTotal, validateCoupon, onApply]);

    const handleRemove = useCallback(() => {
        onRemove();
        setSuccess(null);
        setError(null);
    }, [onRemove]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleApply();
        }
    };

    // If coupon is already applied, show applied state
    if (appliedCoupon) {
        return (
            <div className="coupon-input-wrapper applied">
                <div className="applied-coupon">
                    <div className="applied-info">
                        <Ticket size={18} />
                        <span className="applied-code">{appliedCoupon.code}</span>
                        <span className="applied-discount">
                            -{appliedCoupon.discount.toLocaleString()} جنيه
                        </span>
                    </div>
                    <button
                        className="remove-coupon-btn"
                        onClick={handleRemove}
                        type="button"
                        title="إزالة الكوبون"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="coupon-input-wrapper">
            <div className="coupon-input-container">
                <div className="coupon-icon">
                    <Ticket size={18} />
                </div>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setError(null);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="أدخل كود الخصم"
                    className={`coupon-input ${error ? 'error' : ''} ${success ? 'success' : ''}`}
                    disabled={isValidating}
                />
                <button
                    type="button"
                    className="apply-coupon-btn"
                    onClick={handleApply}
                    disabled={isValidating || !code.trim()}
                >
                    {isValidating ? (
                        <Loader size={16} className="spinner" />
                    ) : (
                        'تطبيق'
                    )}
                </button>
            </div>

            {error && (
                <div className="coupon-message error">
                    <X size={14} />
                    {error}
                </div>
            )}

            {success && !appliedCoupon && (
                <div className="coupon-message success">
                    <Check size={14} />
                    {success}
                </div>
            )}
        </div>
    );
};

export default CouponInput;
