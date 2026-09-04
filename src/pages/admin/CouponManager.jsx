import { useState, useMemo } from 'react';
import { useCoupons } from '../../context/CouponContext';
import { useConfirm } from '../../context/ConfirmContext';
import {
    Ticket,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Copy,
    Calendar,
    Percent,
    DollarSign,
    Eye,
    EyeOff,
    Search,
    Filter
} from 'lucide-react';
import './CouponManager.css';

const CouponManager = () => {
    const {
        coupons,
        loading,
        createCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus
    } = useCoupons();
    const { confirm } = useConfirm();

    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
    const [copiedCode, setCopiedCode] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isActive: true
    });

    // Filter and search coupons
    const filteredCoupons = useMemo(() => {
        return coupons.filter(coupon => {
            const matchesSearch = coupon.code.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === 'all'
                || (filterStatus === 'active' && coupon.isActive)
                || (filterStatus === 'inactive' && !coupon.isActive);
            return matchesSearch && matchesFilter;
        });
    }, [coupons, searchQuery, filterStatus]);

    const resetForm = () => {
        setFormData({
            code: '',
            type: 'percentage',
            value: '',
            minOrderAmount: '',
            maxDiscount: '',
            usageLimit: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true
        });
        setEditingCoupon(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const couponData = {
            code: formData.code.toUpperCase(),
            type: formData.type,
            value: parseFloat(formData.value),
            minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            isActive: formData.isActive
        };

        if (editingCoupon) {
            await updateCoupon(editingCoupon.id, couponData);
        } else {
            await createCoupon(couponData);
        }

        resetForm();
        setShowForm(false);
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value.toString(),
            minOrderAmount: coupon.minOrderAmount?.toString() || '',
            maxDiscount: coupon.maxDiscount?.toString() || '',
            usageLimit: coupon.usageLimit?.toString() || '',
            startDate: new Date(coupon.startDate).toISOString().split('T')[0],
            endDate: new Date(coupon.endDate).toISOString().split('T')[0],
            isActive: coupon.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (couponId) => {
        if (await confirm({
            title: 'حذف الكوبون',
            message: 'هل أنت متأكد من حذف هذا الكوبون؟',
            confirmText: 'حذف',
            variant: 'danger'
        })) {
            await deleteCoupon(couponId);
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getCouponStatus = (coupon) => {
        const now = new Date();
        if (!coupon.isActive) return { label: 'غير مفعل', class: 'inactive' };
        if (new Date(coupon.endDate) < now) return { label: 'منتهي', class: 'expired' };
        if (new Date(coupon.startDate) > now) return { label: 'قادم', class: 'upcoming' };
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { label: 'مستنفد', class: 'exhausted' };
        return { label: 'نشط', class: 'active' };
    };

    if (loading) {
        return (
            <div className="coupon-manager">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>جاري تحميل الكوبونات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="coupon-manager">
            {/* Header */}
            <div className="coupon-header">
                <div className="header-left">
                    <h2><Ticket size={24} /> إدارة الكوبونات</h2>
                    <span className="coupon-count">{coupons.length} كوبون</span>
                </div>
                <button
                    className="btn btn-primary add-coupon-btn"
                    onClick={() => { resetForm(); setShowForm(true); }}
                >
                    <Plus size={18} />
                    إضافة كوبون جديد
                </button>
            </div>

            {/* Filters */}
            <div className="coupon-filters">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="البحث بكود الكوبون..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        الكل
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('active')}
                    >
                        نشط
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('inactive')}
                    >
                        غير نشط
                    </button>
                </div>
            </div>

            {/* Coupon Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => { setShowForm(false); resetForm(); }}>
                    <div className="coupon-form-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}</h3>
                            <button className="close-btn" onClick={() => { setShowForm(false); resetForm(); }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>كود الكوبون *</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="مثال: WINTER25"
                                        required
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>نوع الخصم *</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="percentage">نسبة مئوية %</option>
                                        <option value="fixed">مبلغ ثابت (جنيه)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>قيمة الخصم *</label>
                                    <div className="input-with-icon">
                                        <input
                                            type="number"
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: e.target.value })}
                                            placeholder={formData.type === 'percentage' ? '25' : '500'}
                                            required
                                            min="0"
                                            max={formData.type === 'percentage' ? '100' : undefined}
                                        />
                                        {formData.type === 'percentage' ? <Percent size={16} /> : <span>EGP</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>الحد الأدنى للطلب</label>
                                    <div className="input-with-icon">
                                        <input
                                            type="number"
                                            value={formData.minOrderAmount}
                                            onChange={e => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                            placeholder="0"
                                            min="0"
                                        />
                                        <span>EGP</span>
                                    </div>
                                </div>

                                {formData.type === 'percentage' && (
                                    <div className="form-group">
                                        <label>أقصى خصم</label>
                                        <div className="input-with-icon">
                                            <input
                                                type="number"
                                                value={formData.maxDiscount}
                                                onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
                                                placeholder="بدون حد"
                                                min="0"
                                            />
                                            <span>EGP</span>
                                        </div>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>عدد مرات الاستخدام</label>
                                    <input
                                        type="number"
                                        value={formData.usageLimit}
                                        onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                                        placeholder="غير محدود"
                                        min="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>تاريخ البداية *</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>تاريخ الانتهاء *</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    تفعيل الكوبون فوراً
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>
                                    إلغاء
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Check size={18} />
                                    {editingCoupon ? 'حفظ التعديلات' : 'إنشاء الكوبون'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Coupons List */}
            <div className="coupons-grid">
                {filteredCoupons.length === 0 ? (
                    <div className="empty-state">
                        <Ticket size={48} />
                        <h3>لا توجد كوبونات</h3>
                        <p>{searchQuery ? 'لم يتم العثور على نتائج' : 'قم بإضافة كوبون جديد للبدء'}</p>
                    </div>
                ) : (
                    filteredCoupons.map(coupon => {
                        const status = getCouponStatus(coupon);
                        return (
                            <div key={coupon.id} className={`coupon-card ${status.class}`}>
                                <div className="coupon-card-header">
                                    <div className="coupon-code-wrapper">
                                        <span className="coupon-code">{coupon.code}</span>
                                        <button
                                            className="copy-btn"
                                            onClick={() => copyToClipboard(coupon.code)}
                                            title="نسخ الكود"
                                        >
                                            {copiedCode === coupon.code ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <span className={`status-badge ${status.class}`}>{status.label}</span>
                                </div>

                                <div className="coupon-value">
                                    {coupon.type === 'percentage' ? (
                                        <><span className="value">{coupon.value}</span><span className="unit">%</span></>
                                    ) : (
                                        <><span className="value">{coupon.value.toLocaleString()}</span><span className="unit">EGP</span></>
                                    )}
                                    <span className="discount-type">خصم</span>
                                </div>

                                <div className="coupon-details">
                                    {coupon.minOrderAmount > 0 && (
                                        <div className="detail-item">
                                            <span>الحد الأدنى:</span>
                                            <span>{coupon.minOrderAmount.toLocaleString()} EGP</span>
                                        </div>
                                    )}
                                    {coupon.maxDiscount && (
                                        <div className="detail-item">
                                            <span>أقصى خصم:</span>
                                            <span>{coupon.maxDiscount.toLocaleString()} EGP</span>
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <span>الاستخدام:</span>
                                        <span>{coupon.usageCount || 0} / {coupon.usageLimit || '∞'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Calendar size={14} />
                                        <span>
                                            {new Date(coupon.startDate).toLocaleDateString('ar-EG')} - {new Date(coupon.endDate).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                </div>

                                <div className="coupon-actions">
                                    <button
                                        className="action-btn toggle-btn"
                                        onClick={() => toggleCouponStatus(coupon.id)}
                                        title={coupon.isActive ? 'تعطيل' : 'تفعيل'}
                                    >
                                        {coupon.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                        className="action-btn edit-btn"
                                        onClick={() => handleEdit(coupon)}
                                        title="تعديل"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="action-btn delete-btn"
                                        onClick={() => handleDelete(coupon.id)}
                                        title="حذف"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CouponManager;
