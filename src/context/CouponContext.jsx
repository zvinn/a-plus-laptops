import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const CouponContext = createContext(null);

export const useCoupons = () => {
    const context = useContext(CouponContext);
    if (!context) {
        throw new Error('useCoupons must be used within a CouponProvider');
    }
    return context;
};

/**
 * CouponProvider - Manages coupons/discounts for the e-commerce platform
 * 
 * Coupon structure:
 * {
 *   id: string,
 *   code: string,           // e.g., "WINTER25"
 *   type: 'percentage' | 'fixed',
 *   value: number,          // 25 for 25% or 500 for 500 EGP
 *   minOrderAmount: number, // Minimum order to apply
 *   maxDiscount: number,    // Maximum discount amount (for percentage)
 *   usageLimit: number,     // How many times can be used total
 *   usageCount: number,     // How many times used
 *   userLimit: number,      // How many times per user
 *   startDate: Date,
 *   endDate: Date,
 *   isActive: boolean,
 *   applicableProducts: string[], // Empty = all products
 *   createdAt: Date
 * }
 */
export const CouponProvider = ({ children }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all coupons
    const fetchCoupons = useCallback(async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "coupons"));
            const couponsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                startDate: doc.data().startDate?.toDate?.() || new Date(doc.data().startDate),
                endDate: doc.data().endDate?.toDate?.() || new Date(doc.data().endDate),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setCoupons(couponsList);
            setError(null);
        } catch (err) {
            console.error("Error fetching coupons:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    // Validate a coupon code
    const validateCoupon = useCallback(async (code, orderAmount, userId = null) => {
        const coupon = coupons.find(c =>
            c.code.toUpperCase() === code.toUpperCase() && c.isActive
        );

        if (!coupon) {
            return { valid: false, error: 'الكود غير صحيح أو غير موجود' };
        }

        const now = new Date();

        // Check dates
        if (coupon.startDate > now) {
            return { valid: false, error: 'هذا الكود لم يبدأ بعد' };
        }

        if (coupon.endDate < now) {
            return { valid: false, error: 'انتهت صلاحية هذا الكود' };
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return { valid: false, error: 'تم استخدام هذا الكود الحد الأقصى من المرات' };
        }

        // Check minimum order amount
        if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
            return {
                valid: false,
                error: `الحد الأدنى للطلب ${coupon.minOrderAmount.toLocaleString()} جنيه`
            };
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (orderAmount * coupon.value) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = coupon.value;
        }

        // Don't allow discount more than order amount
        if (discount > orderAmount) {
            discount = orderAmount;
        }

        return {
            valid: true,
            coupon,
            discount: Math.round(discount),
            message: coupon.type === 'percentage'
                ? `خصم ${coupon.value}%`
                : `خصم ${coupon.value.toLocaleString()} جنيه`
        };
    }, [coupons]);

    // Apply coupon (increment usage count)
    const applyCoupon = useCallback(async (couponId) => {
        try {
            const couponRef = doc(db, "coupons", couponId);
            const coupon = coupons.find(c => c.id === couponId);

            if (coupon) {
                await updateDoc(couponRef, {
                    usageCount: (coupon.usageCount || 0) + 1
                });

                // Update local state
                setCoupons(prev => prev.map(c =>
                    c.id === couponId
                        ? { ...c, usageCount: (c.usageCount || 0) + 1 }
                        : c
                ));
            }
            return true;
        } catch (err) {
            console.error("Error applying coupon:", err);
            return false;
        }
    }, [coupons]);

    // Create a new coupon
    const createCoupon = useCallback(async (couponData) => {
        try {
            const newCoupon = {
                ...couponData,
                code: couponData.code.toUpperCase(),
                usageCount: 0,
                createdAt: new Date(),
                isActive: true
            };

            const docRef = await addDoc(collection(db, "coupons"), newCoupon);

            setCoupons(prev => [...prev, { id: docRef.id, ...newCoupon }]);
            return { success: true, id: docRef.id };
        } catch (err) {
            console.error("Error creating coupon:", err);
            return { success: false, error: err.message };
        }
    }, []);

    // Update a coupon
    const updateCoupon = useCallback(async (couponId, updates) => {
        try {
            const couponRef = doc(db, "coupons", couponId);
            await updateDoc(couponRef, updates);

            setCoupons(prev => prev.map(c =>
                c.id === couponId ? { ...c, ...updates } : c
            ));
            return { success: true };
        } catch (err) {
            console.error("Error updating coupon:", err);
            return { success: false, error: err.message };
        }
    }, []);

    // Delete a coupon
    const deleteCoupon = useCallback(async (couponId) => {
        try {
            await deleteDoc(doc(db, "coupons", couponId));
            setCoupons(prev => prev.filter(c => c.id !== couponId));
            return { success: true };
        } catch (err) {
            console.error("Error deleting coupon:", err);
            return { success: false, error: err.message };
        }
    }, []);

    // Toggle coupon active status
    const toggleCouponStatus = useCallback(async (couponId) => {
        const coupon = coupons.find(c => c.id === couponId);
        if (coupon) {
            return updateCoupon(couponId, { isActive: !coupon.isActive });
        }
        return { success: false, error: 'Coupon not found' };
    }, [coupons, updateCoupon]);

    // Get active coupons count
    const activeCouponsCount = coupons.filter(c => c.isActive).length;

    const value = {
        coupons,
        loading,
        error,
        validateCoupon,
        applyCoupon,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,
        refreshCoupons: fetchCoupons,
        activeCouponsCount
    };

    return (
        <CouponContext.Provider value={value}>
            {children}
        </CouponContext.Provider>
    );
};

export default CouponContext;
