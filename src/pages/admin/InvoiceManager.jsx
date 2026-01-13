import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
    query, orderBy, where, serverTimestamp, Timestamp
} from 'firebase/firestore/lite';
import { useToast } from '../../context/ToastContext';
import './InvoiceManager.css';

// Invoice Status Options
const INVOICE_STATUSES = [
    { id: 'draft', label: 'مسودة', icon: '📝', color: '#6b7280' },
    { id: 'sent', label: 'مُرسلة', icon: '📧', color: '#3b82f6' },
    { id: 'paid', label: 'مدفوعة', icon: '✅', color: '#22c55e' },
    { id: 'overdue', label: 'متأخرة', icon: '⚠️', color: '#ef4444' },
    { id: 'cancelled', label: 'ملغاة', icon: '❌', color: '#9ca3af' }
];

const InvoiceManager = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { success, error } = useToast();

    // State
    const [invoices, setInvoices] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // New Invoice Form State
    const [newInvoice, setNewInvoice] = useState({
        orderId: '',
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        notes: '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft'
    });

    // Generate Invoice Number
    const generateInvoiceNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `INV-${year}${month}-${random}`;
    };

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch invoices
            const invoicesQuery = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
            const invoicesSnapshot = await getDocs(invoicesQuery);
            const invoicesData = invoicesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                dueDate: doc.data().dueDate?.toDate?.() || new Date(),
                paidDate: doc.data().paidDate?.toDate?.() || null
            }));
            setInvoices(invoicesData);

            // Fetch orders (for linking)
            const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const ordersSnapshot = await getDocs(ordersQuery);
            const ordersData = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setOrders(ordersData);

            // Fetch customers
            const customersQuery = query(collection(db, 'customers'));
            const customersSnapshot = await getDocs(customersQuery);
            const customersData = customersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCustomers(customersData);

        } catch (err) {
            console.error('Error fetching invoice data:', err);
            error('فشل في تحميل بيانات الفواتير');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [currentUser, navigate]);

    // Check for overdue invoices
    useEffect(() => {
        const checkOverdue = async () => {
            const today = new Date();
            const overdueInvoices = invoices.filter(inv =>
                inv.status === 'sent' && new Date(inv.dueDate) < today
            );

            for (const inv of overdueInvoices) {
                try {
                    await updateDoc(doc(db, 'invoices', inv.id), { status: 'overdue' });
                } catch (err) {
                    console.error('Error updating overdue status:', err);
                }
            }

            if (overdueInvoices.length > 0) {
                fetchData();
            }
        };

        if (invoices.length > 0) {
            checkOverdue();
        }
    }, [invoices]);

    // Calculate Stats
    const stats = useMemo(() => {
        const total = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
        const pending = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total || 0), 0);
        const overdue = invoices.filter(inv => inv.status === 'overdue').length;

        return { total, paid, pending, overdue };
    }, [invoices]);

    // Filter Invoices
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
            const matchesSearch = searchTerm === '' ||
                inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [invoices, filterStatus, searchTerm]);

    // Create Invoice from Order
    const createFromOrder = (order) => {
        setNewInvoice({
            orderId: order.id,
            customerId: order.userId || '',
            customerName: order.customerName || '',
            customerEmail: order.customerEmail || '',
            customerPhone: order.shippingDetails?.phone || '',
            customerAddress: `${order.shippingDetails?.address || ''}, ${order.shippingDetails?.city || ''}`,
            items: order.items || [],
            subtotal: order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
            tax: 0,
            discount: order.discount || 0,
            total: order.totalAmount || 0,
            notes: '',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'draft'
        });
        setShowCreateModal(true);
    };

    // Save Invoice
    const handleSaveInvoice = async (e) => {
        e.preventDefault();

        if (!newInvoice.customerName || !newInvoice.items.length) {
            error('يرجى إضافة اسم العميل والمنتجات');
            return;
        }

        try {
            const invoiceData = {
                ...newInvoice,
                invoiceNumber: generateInvoiceNumber(),
                subtotal: newInvoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                total: newInvoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + newInvoice.tax - newInvoice.discount,
                dueDate: Timestamp.fromDate(new Date(newInvoice.dueDate)),
                createdBy: currentUser.email,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'invoices'), invoiceData);
            success('تم إنشاء الفاتورة بنجاح');
            setShowCreateModal(false);
            resetForm();
            fetchData();
        } catch (err) {
            console.error('Error creating invoice:', err);
            error('فشل في إنشاء الفاتورة');
        }
    };

    // Update Invoice Status
    const updateInvoiceStatus = async (invoiceId, newStatus) => {
        try {
            const updateData = { status: newStatus };
            if (newStatus === 'paid') {
                updateData.paidDate = serverTimestamp();
            }

            await updateDoc(doc(db, 'invoices', invoiceId), updateData);
            success(`تم تحديث حالة الفاتورة إلى "${INVOICE_STATUSES.find(s => s.id === newStatus)?.label}"`);
            fetchData();
        } catch (err) {
            console.error('Error updating invoice status:', err);
            error('فشل في تحديث حالة الفاتورة');
        }
    };

    // Delete Invoice
    const handleDeleteInvoice = async (invoiceId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;

        try {
            await deleteDoc(doc(db, 'invoices', invoiceId));
            success('تم حذف الفاتورة');
            fetchData();
        } catch (err) {
            console.error('Error deleting invoice:', err);
            error('فشل في حذف الفاتورة');
        }
    };

    // Print Invoice
    const handlePrintInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setShowPreviewModal(true);
        setTimeout(() => {
            window.print();
        }, 500);
    };

    // Reset Form
    const resetForm = () => {
        setNewInvoice({
            orderId: '',
            customerId: '',
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            customerAddress: '',
            items: [],
            subtotal: 0,
            tax: 0,
            discount: 0,
            total: 0,
            notes: '',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'draft'
        });
    };

    // Add empty item row
    const addItemRow = () => {
        setNewInvoice(prev => ({
            ...prev,
            items: [...prev.items, { name: '', quantity: 1, price: 0 }]
        }));
    };

    // Update item
    const updateItem = (index, field, value) => {
        setNewInvoice(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return {
                ...prev,
                items: newItems,
                subtotal,
                total: subtotal + prev.tax - prev.discount
            };
        });
    };

    // Remove item
    const removeItem = (index) => {
        setNewInvoice(prev => {
            const newItems = prev.items.filter((_, i) => i !== index);
            const subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            return {
                ...prev,
                items: newItems,
                subtotal,
                total: subtotal + prev.tax - prev.discount
            };
        });
    };

    if (loading) {
        return (
            <div className="invoice-page">
                <div className="invoice-header">
                    <div className="loading-skeleton" style={{ width: '200px', height: '40px' }} />
                </div>
                <div className="invoice-stats">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="stat-card">
                            <div className="loading-skeleton" style={{ width: '100%', height: '100px' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="invoice-page">
            {/* Header */}
            <div className="invoice-header">
                <div>
                    <h1>🧾 نظام الفواتير</h1>
                    <p className="subtitle">إنشاء وتتبع الفواتير وحالات الدفع</p>
                </div>

                <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                        <span>+</span> فاتورة جديدة
                    </button>
                    <button className="btn-secondary" onClick={() => window.print()}>
                        📥 تصدير الكل
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="invoice-stats">
                <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <h3>إجمالي الفواتير</h3>
                    <div className="stat-value">{stats.total.toLocaleString()} EGP</div>
                    <div className="stat-meta">{invoices.length} فاتورة</div>
                </div>

                <div className="stat-card paid">
                    <div className="stat-icon">✅</div>
                    <h3>المدفوعة</h3>
                    <div className="stat-value">{stats.paid.toLocaleString()} EGP</div>
                    <div className="stat-meta">{invoices.filter(i => i.status === 'paid').length} فاتورة</div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <h3>المعلقة</h3>
                    <div className="stat-value">{stats.pending.toLocaleString()} EGP</div>
                    <div className="stat-meta">{invoices.filter(i => i.status === 'sent').length} فاتورة</div>
                </div>

                <div className="stat-card overdue">
                    <div className="stat-icon">⚠️</div>
                    <h3>المتأخرة</h3>
                    <div className="stat-value">{stats.overdue}</div>
                    <div className="stat-meta">تحتاج متابعة</div>
                </div>
            </div>

            {/* Filters */}
            <div className="invoice-filters">
                <div className="search-box">
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="بحث برقم الفاتورة أو اسم العميل..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="status-filters">
                    <button
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        الكل
                    </button>
                    {INVOICE_STATUSES.map(status => (
                        <button
                            key={status.id}
                            className={`filter-btn ${filterStatus === status.id ? 'active' : ''}`}
                            onClick={() => setFilterStatus(status.id)}
                            style={{ '--status-color': status.color }}
                        >
                            {status.icon} {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Create from Orders */}
            {orders.filter(o => !invoices.some(inv => inv.orderId === o.id)).length > 0 && (
                <div className="quick-create-section">
                    <h3>📦 طلبات بدون فواتير</h3>
                    <div className="orders-list">
                        {orders
                            .filter(o => !invoices.some(inv => inv.orderId === o.id))
                            .slice(0, 5)
                            .map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-info">
                                        <span className="order-id">#{order.id.slice(0, 6)}</span>
                                        <span className="order-customer">{order.customerName}</span>
                                        <span className="order-total">{order.totalAmount?.toLocaleString()} EGP</span>
                                    </div>
                                    <button
                                        className="btn-create-invoice"
                                        onClick={() => createFromOrder(order)}
                                    >
                                        إنشاء فاتورة
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Invoices Table */}
            <div className="invoices-table-container">
                <table className="invoices-table">
                    <thead>
                        <tr>
                            <th>رقم الفاتورة</th>
                            <th>العميل</th>
                            <th>التاريخ</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>المبلغ</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(invoice => {
                            const statusInfo = INVOICE_STATUSES.find(s => s.id === invoice.status) || INVOICE_STATUSES[0];
                            const isOverdue = invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date();

                            return (
                                <tr key={invoice.id} className={isOverdue && invoice.status !== 'paid' ? 'overdue-row' : ''}>
                                    <td>
                                        <div className="invoice-number">{invoice.invoiceNumber}</div>
                                        {invoice.orderId && (
                                            <div className="linked-order">طلب #{invoice.orderId.slice(0, 6)}</div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="customer-name">{invoice.customerName}</div>
                                        <div className="customer-email">{invoice.customerEmail}</div>
                                    </td>
                                    <td>{new Date(invoice.createdAt).toLocaleDateString('ar-EG')}</td>
                                    <td>
                                        <span className={isOverdue ? 'overdue-date' : ''}>
                                            {new Date(invoice.dueDate).toLocaleDateString('ar-EG')}
                                        </span>
                                    </td>
                                    <td className="amount-cell">{invoice.total?.toLocaleString()} EGP</td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: statusInfo.color + '20', color: statusInfo.color }}
                                        >
                                            {statusInfo.icon} {statusInfo.label}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action view"
                                                onClick={() => {
                                                    setSelectedInvoice(invoice);
                                                    setShowPreviewModal(true);
                                                }}
                                                title="عرض"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                className="btn-action print"
                                                onClick={() => handlePrintInvoice(invoice)}
                                                title="طباعة"
                                            >
                                                🖨️
                                            </button>
                                            {invoice.status === 'draft' && (
                                                <button
                                                    className="btn-action send"
                                                    onClick={() => updateInvoiceStatus(invoice.id, 'sent')}
                                                    title="إرسال"
                                                >
                                                    📧
                                                </button>
                                            )}
                                            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                                                <button
                                                    className="btn-action paid"
                                                    onClick={() => updateInvoiceStatus(invoice.id, 'paid')}
                                                    title="تم الدفع"
                                                >
                                                    ✅
                                                </button>
                                            )}
                                            <button
                                                className="btn-action delete"
                                                onClick={() => handleDeleteInvoice(invoice.id)}
                                                title="حذف"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredInvoices.length === 0 && (
                            <tr>
                                <td colSpan="7" className="empty-state">
                                    <div className="empty-state-icon">📭</div>
                                    <p>لا توجد فواتير {filterStatus !== 'all' ? `بحالة "${INVOICE_STATUSES.find(s => s.id === filterStatus)?.label}"` : ''}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>🧾 إنشاء فاتورة جديدة</h2>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
                        </div>

                        <form onSubmit={handleSaveInvoice}>
                            <div className="form-section">
                                <h3>بيانات العميل</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>اسم العميل *</label>
                                        <input
                                            type="text"
                                            value={newInvoice.customerName}
                                            onChange={e => setNewInvoice(prev => ({ ...prev, customerName: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={newInvoice.customerEmail}
                                            onChange={e => setNewInvoice(prev => ({ ...prev, customerEmail: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>رقم الهاتف</label>
                                        <input
                                            type="tel"
                                            value={newInvoice.customerPhone}
                                            onChange={e => setNewInvoice(prev => ({ ...prev, customerPhone: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>العنوان</label>
                                        <input
                                            type="text"
                                            value={newInvoice.customerAddress}
                                            onChange={e => setNewInvoice(prev => ({ ...prev, customerAddress: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>المنتجات</h3>
                                <div className="items-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>المنتج</th>
                                                <th>الكمية</th>
                                                <th>السعر</th>
                                                <th>الإجمالي</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {newInvoice.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={e => updateItem(index, 'name', e.target.value)}
                                                            placeholder="اسم المنتج"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                                            min="1"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={e => updateItem(index, 'price', Number(e.target.value))}
                                                            min="0"
                                                        />
                                                    </td>
                                                    <td className="item-total">
                                                        {(item.quantity * item.price).toLocaleString()} EGP
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn-remove-item"
                                                            onClick={() => removeItem(index)}
                                                        >
                                                            ×
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button type="button" className="btn-add-item" onClick={addItemRow}>
                                        + إضافة منتج
                                    </button>
                                </div>

                                <div className="totals-section">
                                    <div className="total-row">
                                        <span>المجموع الفرعي:</span>
                                        <span>{newInvoice.subtotal.toLocaleString()} EGP</span>
                                    </div>
                                    <div className="total-row">
                                        <span>الضريبة:</span>
                                        <input
                                            type="number"
                                            value={newInvoice.tax}
                                            onChange={e => setNewInvoice(prev => ({
                                                ...prev,
                                                tax: Number(e.target.value),
                                                total: prev.subtotal + Number(e.target.value) - prev.discount
                                            }))}
                                            min="0"
                                        />
                                    </div>
                                    <div className="total-row">
                                        <span>الخصم:</span>
                                        <input
                                            type="number"
                                            value={newInvoice.discount}
                                            onChange={e => setNewInvoice(prev => ({
                                                ...prev,
                                                discount: Number(e.target.value),
                                                total: prev.subtotal + prev.tax - Number(e.target.value)
                                            }))}
                                            min="0"
                                        />
                                    </div>
                                    <div className="total-row grand-total">
                                        <span>الإجمالي:</span>
                                        <span>{newInvoice.total.toLocaleString()} EGP</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>تفاصيل إضافية</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>تاريخ الاستحقاق</label>
                                        <input
                                            type="date"
                                            value={newInvoice.dueDate}
                                            onChange={e => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>ملاحظات</label>
                                        <textarea
                                            value={newInvoice.notes}
                                            onChange={e => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))}
                                            rows="3"
                                            placeholder="ملاحظات إضافية للفاتورة..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                                    إلغاء
                                </button>
                                <button type="submit" className="btn-submit">
                                    💾 حفظ الفاتورة
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Invoice Preview Modal */}
            {showPreviewModal && selectedInvoice && (
                <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
                    <div className="modal-content invoice-preview" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>معاينة الفاتورة</h2>
                            <button className="close-btn" onClick={() => setShowPreviewModal(false)}>×</button>
                        </div>

                        <div className="invoice-template" id="invoice-print">
                            <div className="invoice-template-header">
                                <div className="company-info">
                                    <h1>A Plus+</h1>
                                    <p>متجر اللابتوبات الأفضل</p>
                                    <p>www.aplus-laptops.com</p>
                                </div>
                                <div className="invoice-info">
                                    <h2>فاتورة</h2>
                                    <p><strong>رقم:</strong> {selectedInvoice.invoiceNumber}</p>
                                    <p><strong>التاريخ:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString('ar-EG')}</p>
                                    <p><strong>الاستحقاق:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>

                            <div className="customer-section">
                                <h3>فاتورة إلى:</h3>
                                <p><strong>{selectedInvoice.customerName}</strong></p>
                                <p>{selectedInvoice.customerEmail}</p>
                                <p>{selectedInvoice.customerPhone}</p>
                                <p>{selectedInvoice.customerAddress}</p>
                            </div>

                            <table className="invoice-items-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>المنتج</th>
                                        <th>الكمية</th>
                                        <th>السعر</th>
                                        <th>الإجمالي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.items?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.price?.toLocaleString()} EGP</td>
                                            <td>{(item.quantity * item.price)?.toLocaleString()} EGP</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="invoice-totals">
                                <div className="total-line">
                                    <span>المجموع الفرعي:</span>
                                    <span>{selectedInvoice.subtotal?.toLocaleString()} EGP</span>
                                </div>
                                {selectedInvoice.tax > 0 && (
                                    <div className="total-line">
                                        <span>الضريبة:</span>
                                        <span>{selectedInvoice.tax?.toLocaleString()} EGP</span>
                                    </div>
                                )}
                                {selectedInvoice.discount > 0 && (
                                    <div className="total-line">
                                        <span>الخصم:</span>
                                        <span>-{selectedInvoice.discount?.toLocaleString()} EGP</span>
                                    </div>
                                )}
                                <div className="total-line grand">
                                    <span>الإجمالي:</span>
                                    <span>{selectedInvoice.total?.toLocaleString()} EGP</span>
                                </div>
                            </div>

                            {selectedInvoice.notes && (
                                <div className="invoice-notes">
                                    <h4>ملاحظات:</h4>
                                    <p>{selectedInvoice.notes}</p>
                                </div>
                            )}

                            <div className="invoice-footer">
                                <p>شكراً لتعاملكم معنا!</p>
                                <p>A Plus+ - The Best Laptop Store</p>
                            </div>
                        </div>

                        <div className="preview-actions">
                            <button className="btn-print" onClick={() => window.print()}>
                                🖨️ طباعة
                            </button>
                            {selectedInvoice.status !== 'paid' && (
                                <button
                                    className="btn-mark-paid"
                                    onClick={() => {
                                        updateInvoiceStatus(selectedInvoice.id, 'paid');
                                        setShowPreviewModal(false);
                                    }}
                                >
                                    ✅ تحديد كمدفوعة
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceManager;
