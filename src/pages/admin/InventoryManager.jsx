import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Firebase logic moved to inventoryService.js
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import OptimizedImage from '../../components/OptimizedImage';
import { inventoryService } from '../../api/inventoryService';
import {
    Download, Upload, RotateCcw, AlertTriangle, Wrench, Package,
    Trash2, Plus, Building, User, Mail, Phone, MapPin
} from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import './InventoryManager.css';

// Movement Types
// Movement Types
const MOVEMENT_TYPES = [
    { id: 'purchase', label: 'شراء', icon: <Download size={18} />, color: '#22c55e' },
    { id: 'sale', label: 'بيع', icon: <Upload size={18} />, color: '#3b82f6' },
    { id: 'return', label: 'إرجاع', icon: <RotateCcw size={18} />, color: '#f59e0b' },
    { id: 'damage', label: 'تلف', icon: <AlertTriangle size={18} />, color: '#ef4444' },
    { id: 'adjustment', label: 'تعديل', icon: <Wrench size={18} />, color: '#8b5cf6' },
];

const InventoryManager = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { success, error } = useToast();
    const { confirm } = useConfirm();

    // State
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stock');
    const [searchQuery, setSearchQuery] = useState('');

    const [showMovementModal, setShowMovementModal] = useState(false);
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    // Removed unused selectedProduct state

    // Form States
    const [newMovement, setNewMovement] = useState({
        productId: '',
        type: 'purchase',
        quantity: '',
        reason: '',
        notes: ''
    });

    const [newSupplier, setNewSupplier] = useState({
        name: '',
        contact: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
    });

    // Fetch Data
    // Fetch Data
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsData, movementsData, suppliersData] = await Promise.all([
                inventoryService.getProducts(),
                inventoryService.getMovements(),
                inventoryService.getSuppliers()
            ]);

            setProducts(productsData);
            setMovements(movementsData);
            setSuppliers(suppliersData);
        } catch (err) {
            console.error('Error fetching inventory data:', err);
            error('فشل في تحميل بيانات المخزون');
        }
        setLoading(false);
    }, [error]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [currentUser, navigate, fetchData]);

    // Stats
    const stats = useMemo(() => {
        const totalProducts = products.length;
        const lowStock = products.filter(p => (p.stockCount || 0) <= (p.lowStockThreshold || 5) && (p.stockCount || 0) > 0).length;
        const outOfStock = products.filter(p => (p.stockCount || 0) === 0).length;
        const totalValue = products.reduce((sum, p) => sum + ((p.stockCount || 0) * (p.price || 0)), 0);

        return { totalProducts, lowStock, outOfStock, totalValue };
    }, [products]);

    // Filtered Products
    const filteredProducts = useMemo(() => {
        if (!searchQuery) return products;
        const query = searchQuery.toLowerCase();
        return products.filter(p =>
            p.name?.toLowerCase().includes(query) ||
            p.brand?.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    // Add Stock Movement
    const handleAddMovement = async (e) => {
        e.preventDefault();

        if (!newMovement.productId || !newMovement.quantity) {
            error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        const quantity = parseInt(newMovement.quantity);
        const isIncoming = ['purchase', 'return'].includes(newMovement.type);

        try {
            await inventoryService.addMovement({
                ...newMovement,
                quantity,
                isIncoming
            }, currentUser.email);

            success('تم تسجيل حركة المخزون بنجاح');
            setShowMovementModal(false);
            setNewMovement({
                productId: '',
                type: 'purchase',
                quantity: '',
                reason: '',
                notes: ''
            });
            fetchData();
        } catch (err) {
            console.error('Error adding movement:', err);
            error('فشل في تسجيل حركة المخزون');
        }
    };

    // Quick Stock Adjustment
    const handleQuickAdjust = async (productId, adjustment) => {
        try {
            await inventoryService.adjustStock(productId, adjustment, currentUser.email);
            success(`تم ${adjustment > 0 ? 'إضافة' : 'خصم'} ${Math.abs(adjustment)} وحدة`);
            fetchData();
        } catch (err) {
            console.error('Error adjusting stock:', err);
            error('فشل في تعديل المخزون');
        }
    };

    // Export to CSV
    const handleExport = () => {
        try {
            const headers = ['SKU', 'Brand', 'Name', 'Stock', 'Price', 'Status'];
            const csvContent = [
                headers.join(','),
                ...filteredProducts.map(p => [
                    p.id,
                    `"${p.brand}"`,
                    `"${p.name}"`,
                    p.stockCount || 0,
                    p.price || 0,
                    (p.stockCount || 0) === 0 ? 'Out of Stock' : (p.stockCount || 0) <= (p.lowStockThreshold || 5) ? 'Low Stock' : 'In Stock'
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            success('تم تصدير البيانات بنجاح');
        } catch (err) {
            console.error('Export error:', err);
            error('فشل في تصدير البيانات');
        }
    };

    // Add Supplier
    const handleAddSupplier = async (e) => {
        e.preventDefault();

        if (!newSupplier.name) {
            error('يرجى إدخال اسم المورد');
            return;
        }

        try {
            await inventoryService.addSupplier(newSupplier, currentUser.email);

            success('تمت إضافة المورد بنجاح');
            setShowSupplierModal(false);
            setNewSupplier({
                name: '',
                contact: '',
                phone: '',
                email: '',
                address: '',
                notes: ''
            });
            fetchData();
        } catch (err) {
            console.error('Error adding supplier:', err);
            error('فشل في إضافة المورد');
        }
    };

    // Delete Supplier
    const handleDeleteSupplier = async (supplierId) => {
        if (!await confirm({
            title: 'حذف المورد',
            message: 'هل أنت متأكد من حذف هذا المورد؟',
            confirmText: 'حذف',
            variant: 'danger'
        })) return;

        try {
            await inventoryService.deleteSupplier(supplierId);
            success('تم حذف المورد');
            fetchData();
        } catch (err) {
            console.error('Error deleting supplier:', err);
            error('فشل في حذف المورد');
        }
    };

    // Get Stock Status
    const getStockStatus = (product) => {
        const stock = product.stockCount || 0;
        const threshold = product.lowStockThreshold || 5;

        if (stock === 0) return { label: 'نفذ', class: 'out', icon: '❌' };
        if (stock <= threshold) return { label: 'منخفض', class: 'low', icon: '⚠️' };
        return { label: 'متوفر', class: 'healthy', icon: '✅' };
    };

    if (loading) {
        return (
            <div className="inventory-page page-container container">
                <Skeleton type="text" height="40px" width="200px" style={{ marginBottom: '2rem' }} />
                <div className="inventory-stats">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} type="rect" height="100px" style={{ borderRadius: '16px' }} />
                    ))}
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <Skeleton type="rect" height="400px" style={{ borderRadius: '16px' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="inventory-page">
            {/* Header */}
            <div className="inventory-header">
                <h1>📦 إدارة المخزون</h1>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="add-btn" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={handleExport}>
                        <Download size={18} /> تصدير CSV
                    </button>
                    <button className="add-btn" onClick={() => setShowMovementModal(true)}>
                        <Plus size={18} /> تسجيل حركة
                    </button>
                    <button className="add-btn" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={() => setShowSupplierModal(true)}>
                        <Building size={18} /> إضافة مورد
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="inventory-stats">
                <div className="inv-stat-card total">
                    <div className="icon"><Package size={24} /></div>
                    <div className="info">
                        <h4>إجمالي المنتجات</h4>
                        <p>{stats.totalProducts}</p>
                    </div>
                </div>
                <div className="inv-stat-card low">
                    <div className="icon"><AlertTriangle size={24} /></div>
                    <div className="info">
                        <h4>مخزون منخفض</h4>
                        <p>{stats.lowStock}</p>
                    </div>
                </div>
                <div className="inv-stat-card out">
                    <div className="icon"><AlertTriangle size={24} /></div>
                    <div className="info">
                        <h4>نفذ من المخزون</h4>
                        <p>{stats.outOfStock}</p>
                    </div>
                </div>
                <div className="inv-stat-card in">
                    <div className="icon">💰</div>
                    <div className="info">
                        <h4>قيمة المخزون</h4>
                        <p>{stats.totalValue.toLocaleString()} EGP</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="inventory-tabs">
                <button className={`tab-btn ${activeTab === 'stock' ? 'active' : ''}`} onClick={() => setActiveTab('stock')}>
                    📊 المخزون الحالي
                </button>
                <button className={`tab-btn ${activeTab === 'movements' ? 'active' : ''}`} onClick={() => setActiveTab('movements')}>
                    🔄 حركة المخزون
                </button>
                <button className={`tab-btn ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')}>
                    🏭 الموردين
                </button>
            </div>

            {/* Stock Tab */}
            {activeTab === 'stock' && (
                <div className="stock-table-container">
                    <div className="table-header">
                        <h3>جميع المنتجات ({filteredProducts.length})</h3>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="🔍 بحث عن منتج..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="quick-stats">
                        <div className="quick-stat">
                            <div className="dot green"></div>
                            <span>متوفر: {products.filter(p => (p.stockCount || 0) > (p.lowStockThreshold || 5)).length}</span>
                        </div>
                        <div className="quick-stat">
                            <div className="dot yellow"></div>
                            <span>منخفض: {stats.lowStock}</span>
                        </div>
                        <div className="quick-stat">
                            <div className="dot red"></div>
                            <span>نفذ: {stats.outOfStock}</span>
                        </div>
                    </div>

                    <table className="stock-table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>الماركة</th>
                                <th>السعر</th>
                                <th>الكمية</th>
                                <th>الحالة</th>
                                <th>إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => {
                                const status = getStockStatus(product);
                                return (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="product-cell">
                                                <OptimizedImage src={product.image} alt={product.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                                <div className="info">
                                                    <h4>{product.name}</h4>
                                                    <span>{product.specs?.cpu || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{product.brand}</td>
                                        <td>{(product.price || 0).toLocaleString()} EGP</td>
                                        <td style={{ fontWeight: '700' }}>{product.stockCount || 0}</td>
                                        <td>
                                            <span className={`stock-badge ${status.class}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="action-btn add" onClick={() => handleQuickAdjust(product.id, 1)} title="إضافة 1">
                                                    +
                                                </button>
                                                <button className="action-btn remove" onClick={() => handleQuickAdjust(product.id, -1)} title="خصم 1" disabled={product.stockCount === 0}>
                                                    -
                                                </button>
                                                <button className="action-btn" onClick={() => { setNewMovement(prev => ({ ...prev, productId: product.id })); setShowMovementModal(true); }} title="تسجيل حركة">
                                                    📝
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Movements Tab */}
            {activeTab === 'movements' && (
                <div className="movements-section">
                    <div className="movements-card">
                        <h3>📥 الوارد</h3>
                        {movements.filter(m => m.direction === 'in').slice(0, 10).map(movement => {
                            const product = products.find(p => p.id === movement.productId);
                            const type = MOVEMENT_TYPES.find(t => t.id === movement.type) || MOVEMENT_TYPES[0];
                            return (
                                <div key={movement.id} className="movement-item">
                                    <div className="info">
                                        <div className="icon in">{type.icon}</div>
                                        <div className="details">
                                            <h4>{product?.name || 'منتج محذوف'}</h4>
                                            <span>{type.label} • {new Date(movement.createdAt).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    <div className="quantity in">+{movement.quantity}</div>
                                </div>
                            );
                        })}
                        {movements.filter(m => m.direction === 'in').length === 0 && (
                            <div className="empty-state">
                                <p>لا توجد حركات وارد</p>
                            </div>
                        )}
                    </div>

                    <div className="movements-card">
                        <h3>📤 الصادر</h3>
                        {movements.filter(m => m.direction === 'out').slice(0, 10).map(movement => {
                            const product = products.find(p => p.id === movement.productId);
                            const type = MOVEMENT_TYPES.find(t => t.id === movement.type) || MOVEMENT_TYPES[1];
                            return (
                                <div key={movement.id} className="movement-item">
                                    <div className="info">
                                        <div className="icon out">{type.icon}</div>
                                        <div className="details">
                                            <h4>{product?.name || 'منتج محذوف'}</h4>
                                            <span>{type.label} • {new Date(movement.createdAt).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    <div className="quantity out">-{movement.quantity}</div>
                                </div>
                            );
                        })}
                        {movements.filter(m => m.direction === 'out').length === 0 && (
                            <div className="empty-state">
                                <p>لا توجد حركات صادر</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
                <div className="suppliers-grid">
                    {suppliers.map(supplier => (
                        <div key={supplier.id} className="supplier-card">
                            <div className="supplier-header">
                                <div className="supplier-avatar">🏭</div>
                                <div className="supplier-info">
                                    <h4>{supplier.name}</h4>
                                    <span>{supplier.contact || 'لا يوجد اسم جهة اتصال'}</span>
                                </div>
                            </div>
                            <div className="supplier-details">
                                {supplier.phone && (
                                    <div className="detail">
                                        📞 <span>{supplier.phone}</span>
                                    </div>
                                )}
                                {supplier.email && (
                                    <div className="detail">
                                        ✉️ <span>{supplier.email}</span>
                                    </div>
                                )}
                                {supplier.address && (
                                    <div className="detail">
                                        <MapPin size={16} /> <span>{supplier.address}</span>
                                    </div>
                                )}
                            </div>
                            <button
                                className="action-btn"
                                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                                onClick={() => handleDeleteSupplier(supplier.id)}
                            >
                                <Trash2 size={16} /> حذف
                            </button>
                        </div>
                    ))}
                    {suppliers.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                            <div className="empty-state-icon"><Building size={48} /></div>
                            <p>لا يوجد موردين مضافين</p>
                            <button className="add-btn" style={{ marginTop: '1rem' }} onClick={() => setShowSupplierModal(true)}>
                                <Plus size={18} /> إضافة مورد
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Movement Modal */}
            {showMovementModal && (
                <div className="modal-overlay" onClick={() => setShowMovementModal(false)}>
                    <div className="modal-content movement-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📦 تسجيل حركة مخزون</h2>
                            <button className="close-btn" onClick={() => setShowMovementModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleAddMovement}>
                            <div className="form-group">
                                <label>المنتج *</label>
                                <select
                                    value={newMovement.productId}
                                    onChange={e => setNewMovement(prev => ({ ...prev, productId: e.target.value }))}
                                    required
                                >
                                    <option value="">اختر منتج...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.stockCount || 0} في المخزون)</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>نوع الحركة *</label>
                                    <select
                                        value={newMovement.type}
                                        onChange={e => setNewMovement(prev => ({ ...prev, type: e.target.value }))}
                                        required
                                    >
                                        {MOVEMENT_TYPES.map(t => (
                                            <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>الكمية *</label>
                                    <input
                                        type="number"
                                        value={newMovement.quantity}
                                        onChange={e => setNewMovement(prev => ({ ...prev, quantity: e.target.value }))}
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>السبب</label>
                                <input
                                    type="text"
                                    value={newMovement.reason}
                                    onChange={e => setNewMovement(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="مثال: طلب جديد من المورد"
                                />
                            </div>

                            <div className="form-group">
                                <label>ملاحظات</label>
                                <textarea
                                    value={newMovement.notes}
                                    onChange={e => setNewMovement(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="ملاحظات إضافية..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowMovementModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-submit">💾 تسجيل الحركة</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Supplier Modal */}
            {showSupplierModal && (
                <div className="modal-overlay" onClick={() => setShowSupplierModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🏭 إضافة مورد جديد</h2>
                            <button className="close-btn" onClick={() => setShowSupplierModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleAddSupplier}>
                            <div className="form-group">
                                <label>اسم المورد *</label>
                                <input
                                    type="text"
                                    value={newSupplier.name}
                                    onChange={e => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>جهة الاتصال</label>
                                <input
                                    type="text"
                                    value={newSupplier.contact}
                                    onChange={e => setNewSupplier(prev => ({ ...prev, contact: e.target.value }))}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>الهاتف</label>
                                    <input
                                        type="tel"
                                        value={newSupplier.phone}
                                        onChange={e => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        value={newSupplier.email}
                                        onChange={e => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>العنوان</label>
                                <input
                                    type="text"
                                    value={newSupplier.address}
                                    onChange={e => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>ملاحظات</label>
                                <textarea
                                    value={newSupplier.notes}
                                    onChange={e => setNewSupplier(prev => ({ ...prev, notes: e.target.value }))}
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowSupplierModal(false)}>إلغاء</button>
                                <button type="submit" className="btn-submit">💾 إضافة المورد</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;
