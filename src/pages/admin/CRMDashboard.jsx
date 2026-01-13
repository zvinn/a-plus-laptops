import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
    query, orderBy, where, serverTimestamp, Timestamp
} from 'firebase/firestore/lite';
import { useToast } from '../../context/ToastContext';
import './CRMDashboard.css';

// Interaction Types
const INTERACTION_TYPES = [
    { id: 'call', label: 'مكالمة', icon: '📞' },
    { id: 'email', label: 'بريد إلكتروني', icon: '✉️' },
    { id: 'meeting', label: 'اجتماع', icon: '🤝' },
    { id: 'whatsapp', label: 'واتساب', icon: '💬' },
    { id: 'note', label: 'ملاحظة', icon: '📝' },
];

const CRMDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { success, error } = useToast();

    // State
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [interactions, setInteractions] = useState([]);
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('customers');
    const [searchQuery, setSearchQuery] = useState('');
    const [segmentFilter, setSegmentFilter] = useState('all');

    // Modals
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [showAddInteraction, setShowAddInteraction] = useState(false);
    const [showAddFollowUp, setShowAddFollowUp] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Forms
    const [newCustomer, setNewCustomer] = useState({
        name: '', email: '', phone: '', address: '', notes: ''
    });
    const [newInteraction, setNewInteraction] = useState({
        customerId: '', type: 'call', notes: ''
    });
    const [newFollowUp, setNewFollowUp] = useState({
        customerId: '', action: '', dueDate: ''
    });

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch orders to extract customers
            const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const ordersSnapshot = await getDocs(ordersQuery);
            const ordersData = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setOrders(ordersData);

            // Extract unique customers from orders
            const customersMap = new Map();
            ordersData.forEach(order => {
                const key = order.customerEmail || order.customerName;
                if (key) {
                    if (!customersMap.has(key)) {
                        customersMap.set(key, {
                            id: key,
                            name: order.customerName || 'غير معروف',
                            email: order.customerEmail || '',
                            phone: order.shippingDetails?.phone || order.customerPhone || '',
                            orders: [],
                            totalSpent: 0,
                            lastOrderDate: null
                        });
                    }
                    const customer = customersMap.get(key);
                    customer.orders.push(order);
                    customer.totalSpent += order.totalAmount || 0;
                    if (!customer.lastOrderDate || new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
                        customer.lastOrderDate = order.createdAt;
                    }
                }
            });

            // Add customer data from Firestore customers collection
            const customersSnapshot = await getDocs(collection(db, 'customers'));
            customersSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const key = data.email || data.name;
                if (!customersMap.has(key)) {
                    customersMap.set(key, {
                        id: doc.id,
                        ...data,
                        orders: [],
                        totalSpent: 0,
                        lastOrderDate: null
                    });
                } else {
                    // Merge data
                    const existing = customersMap.get(key);
                    existing.id = doc.id;
                    existing.notes = data.notes || existing.notes;
                }
            });

            // Assign segments
            const customersArray = Array.from(customersMap.values()).map(c => ({
                ...c,
                segment: c.totalSpent >= 50000 ? 'vip' : c.orders.length > 0 ? 'regular' : 'new'
            }));
            setCustomers(customersArray);

            // Fetch interactions
            const interactionsSnapshot = await getDocs(query(collection(db, 'customer_interactions'), orderBy('createdAt', 'desc')));
            setInteractions(interactionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            })));

            // Fetch follow-ups
            const followUpsSnapshot = await getDocs(query(collection(db, 'follow_ups'), orderBy('dueDate', 'asc')));
            setFollowUps(followUpsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                dueDate: doc.data().dueDate?.toDate?.() || new Date()
            })));

        } catch (err) {
            console.error('Error fetching CRM data:', err);
            error('فشل في تحميل بيانات العملاء');
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

    // Stats
    const stats = useMemo(() => {
        const total = customers.length;
        const vip = customers.filter(c => c.segment === 'vip').length;
        const newCustomers = customers.filter(c => c.segment === 'new').length;
        const pendingFollowUps = followUps.filter(f => f.status !== 'completed').length;

        return { total, vip, newCustomers, pendingFollowUps };
    }, [customers, followUps]);

    // Filtered Customers
    const filteredCustomers = useMemo(() => {
        let result = customers;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name?.toLowerCase().includes(query) ||
                c.email?.toLowerCase().includes(query) ||
                c.phone?.includes(query)
            );
        }

        if (segmentFilter !== 'all') {
            result = result.filter(c => c.segment === segmentFilter);
        }

        return result.sort((a, b) => b.totalSpent - a.totalSpent);
    }, [customers, searchQuery, segmentFilter]);

    // Add Customer
    const handleAddCustomer = async (e) => {
        e.preventDefault();
        if (!newCustomer.name) {
            error('يرجى إدخال اسم العميل');
            return;
        }

        try {
            await addDoc(collection(db, 'customers'), {
                ...newCustomer,
                segment: 'new',
                addedBy: currentUser.email,
                createdAt: serverTimestamp()
            });

            success('تمت إضافة العميل بنجاح');
            setShowAddCustomer(false);
            setNewCustomer({ name: '', email: '', phone: '', address: '', notes: '' });
            fetchData();
        } catch (err) {
            console.error('Error adding customer:', err);
            error('فشل في إضافة العميل');
        }
    };

    // Add Interaction
    const handleAddInteraction = async (e) => {
        e.preventDefault();
        if (!newInteraction.customerId || !newInteraction.notes) {
            error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            await addDoc(collection(db, 'customer_interactions'), {
                ...newInteraction,
                addedBy: currentUser.email,
                createdAt: serverTimestamp()
            });

            success('تم تسجيل التفاعل بنجاح');
            setShowAddInteraction(false);
            setNewInteraction({ customerId: '', type: 'call', notes: '' });
            fetchData();
        } catch (err) {
            console.error('Error adding interaction:', err);
            error('فشل في تسجيل التفاعل');
        }
    };

    // Add Follow-up
    const handleAddFollowUp = async (e) => {
        e.preventDefault();
        if (!newFollowUp.customerId || !newFollowUp.action || !newFollowUp.dueDate) {
            error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            await addDoc(collection(db, 'follow_ups'), {
                ...newFollowUp,
                dueDate: Timestamp.fromDate(new Date(newFollowUp.dueDate)),
                status: 'pending',
                addedBy: currentUser.email,
                createdAt: serverTimestamp()
            });

            success('تمت إضافة المتابعة بنجاح');
            setShowAddFollowUp(false);
            setNewFollowUp({ customerId: '', action: '', dueDate: '' });
            fetchData();
        } catch (err) {
            console.error('Error adding follow-up:', err);
            error('فشل في إضافة المتابعة');
        }
    };

    // Complete Follow-up
    const handleCompleteFollowUp = async (followUpId) => {
        try {
            await updateDoc(doc(db, 'follow_ups', followUpId), {
                status: 'completed',
                completedAt: serverTimestamp()
            });
            success('تم إكمال المتابعة');
            fetchData();
        } catch (err) {
            console.error('Error completing follow-up:', err);
            error('فشل');
        }
    };

    // Get Initials
    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Check if date is today or overdue
    const getFollowUpStatus = (dueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        if (due < today) return 'overdue';
        if (due.getTime() === today.getTime()) return 'today';
        return 'upcoming';
    };

    if (loading) {
        return (
            <div className="crm-page">
                <div className="crm-header">
                    <div className="loading-skeleton" style={{ width: '200px', height: '40px' }} />
                </div>
                <div className="crm-stats">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="crm-stat-card">
                            <div className="loading-skeleton" style={{ width: '100%', height: '60px' }} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="crm-page">
            {/* Header */}
            <div className="crm-header">
                <h1>👥 إدارة العملاء (CRM)</h1>
                <div className="quick-actions">
                    <button className="quick-action-btn" onClick={() => setShowAddInteraction(true)}>
                        📝 تسجيل تفاعل
                    </button>
                    <button className="quick-action-btn" onClick={() => setShowAddFollowUp(true)}>
                        📅 إضافة متابعة
                    </button>
                    <button className="quick-action-btn primary" onClick={() => setShowAddCustomer(true)}>
                        ➕ إضافة عميل
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="crm-stats">
                <div className="crm-stat-card total">
                    <div className="icon">👥</div>
                    <div className="info">
                        <h4>إجمالي العملاء</h4>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="crm-stat-card vip">
                    <div className="icon">⭐</div>
                    <div className="info">
                        <h4>عملاء VIP</h4>
                        <p>{stats.vip}</p>
                    </div>
                </div>
                <div className="crm-stat-card new">
                    <div className="icon">🆕</div>
                    <div className="info">
                        <h4>عملاء جدد</h4>
                        <p>{stats.newCustomers}</p>
                    </div>
                </div>
                <div className="crm-stat-card followup">
                    <div className="icon">📋</div>
                    <div className="info">
                        <h4>متابعات معلقة</h4>
                        <p>{stats.pendingFollowUps}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="crm-tabs">
                <button className={`crm-tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
                    👥 العملاء
                </button>
                <button className={`crm-tab ${activeTab === 'followups' ? 'active' : ''}`} onClick={() => setActiveTab('followups')}>
                    📅 المتابعات
                </button>
                <button className={`crm-tab ${activeTab === 'interactions' ? 'active' : ''}`} onClick={() => setActiveTab('interactions')}>
                    💬 سجل التفاعلات
                </button>
            </div>

            {/* Customers Tab */}
            {activeTab === 'customers' && (
                <>
                    <div className="search-filter-bar">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="🔍 بحث عن عميل..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="filter-dropdown"
                            value={segmentFilter}
                            onChange={e => setSegmentFilter(e.target.value)}
                        >
                            <option value="all">جميع العملاء</option>
                            <option value="vip">⭐ VIP</option>
                            <option value="regular">👤 عادي</option>
                            <option value="new">🆕 جديد</option>
                        </select>
                    </div>

                    <div className="customers-grid">
                        {filteredCustomers.map(customer => (
                            <div key={customer.id} className="customer-card">
                                <div className="customer-card-header">
                                    <div className="customer-info">
                                        <div className="customer-avatar">{getInitials(customer.name)}</div>
                                        <div className="customer-details">
                                            <h4>{customer.name}</h4>
                                            <span>{customer.email || customer.phone || 'لا يوجد بيانات اتصال'}</span>
                                        </div>
                                    </div>
                                    <span className={`segment-badge ${customer.segment}`}>
                                        {customer.segment === 'vip' ? '⭐ VIP' : customer.segment === 'regular' ? '👤 عادي' : '🆕 جديد'}
                                    </span>
                                </div>

                                <div className="customer-stats">
                                    <div className="customer-stat">
                                        <div className="value">{customer.orders.length}</div>
                                        <div className="label">طلبات</div>
                                    </div>
                                    <div className="customer-stat">
                                        <div className="value">{customer.totalSpent.toLocaleString()}</div>
                                        <div className="label">إجمالي EGP</div>
                                    </div>
                                    <div className="customer-stat">
                                        <div className="value">
                                            {customer.lastOrderDate
                                                ? new Date(customer.lastOrderDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
                                                : '-'
                                            }
                                        </div>
                                        <div className="label">آخر طلب</div>
                                    </div>
                                </div>

                                <div className="customer-actions">
                                    <button
                                        className="customer-action-btn"
                                        onClick={() => { setSelectedCustomer(customer); setNewInteraction(prev => ({ ...prev, customerId: customer.id })); setShowAddInteraction(true); }}
                                    >
                                        📝 تفاعل
                                    </button>
                                    <button
                                        className="customer-action-btn"
                                        onClick={() => { setSelectedCustomer(customer); setNewFollowUp(prev => ({ ...prev, customerId: customer.id })); setShowAddFollowUp(true); }}
                                    >
                                        📅 متابعة
                                    </button>
                                    {customer.phone && (
                                        <a
                                            href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="customer-action-btn"
                                        >
                                            💬 واتساب
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}

                        {filteredCustomers.length === 0 && (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <div className="empty-state-icon">👥</div>
                                <p>لا يوجد عملاء مطابقين للبحث</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Follow-ups Tab */}
            {activeTab === 'followups' && (
                <div className="followups-section">
                    <div className="followup-card">
                        <h3>⚠️ متابعات اليوم والمتأخرة</h3>
                        {followUps.filter(f => ['overdue', 'today'].includes(getFollowUpStatus(f.dueDate)) && f.status !== 'completed').map(followUp => {
                            const customer = customers.find(c => c.id === followUp.customerId);
                            const status = getFollowUpStatus(followUp.dueDate);
                            return (
                                <div key={followUp.id} className={`followup-item ${status}`}>
                                    <div className="followup-info">
                                        <h4>{customer?.name || 'عميل غير معروف'}</h4>
                                        <span>{followUp.action} • {new Date(followUp.dueDate).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                    <div className="followup-actions">
                                        <button onClick={() => handleCompleteFollowUp(followUp.id)} title="تم">✓</button>
                                    </div>
                                </div>
                            );
                        })}
                        {followUps.filter(f => ['overdue', 'today'].includes(getFollowUpStatus(f.dueDate)) && f.status !== 'completed').length === 0 && (
                            <div className="empty-state">
                                <p>لا توجد متابعات معلقة لليوم 🎉</p>
                            </div>
                        )}
                    </div>

                    <div className="followup-card">
                        <h3>📅 متابعات قادمة</h3>
                        {followUps.filter(f => getFollowUpStatus(f.dueDate) === 'upcoming' && f.status !== 'completed').slice(0, 10).map(followUp => {
                            const customer = customers.find(c => c.id === followUp.customerId);
                            return (
                                <div key={followUp.id} className="followup-item">
                                    <div className="followup-info">
                                        <h4>{customer?.name || 'عميل غير معروف'}</h4>
                                        <span>{followUp.action} • {new Date(followUp.dueDate).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                    <div className="followup-actions">
                                        <button onClick={() => handleCompleteFollowUp(followUp.id)} title="تم">✓</button>
                                    </div>
                                </div>
                            );
                        })}
                        {followUps.filter(f => getFollowUpStatus(f.dueDate) === 'upcoming' && f.status !== 'completed').length === 0 && (
                            <div className="empty-state">
                                <p>لا توجد متابعات قادمة</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Interactions Tab */}
            {activeTab === 'interactions' && (
                <div className="followup-card">
                    <h3>💬 سجل التفاعلات</h3>
                    <div className="interactions-list">
                        {interactions.slice(0, 20).map(interaction => {
                            const customer = customers.find(c => c.id === interaction.customerId);
                            const type = INTERACTION_TYPES.find(t => t.id === interaction.type) || INTERACTION_TYPES[4];
                            return (
                                <div key={interaction.id} className="interaction-item">
                                    <div className="interaction-icon">{type.icon}</div>
                                    <div className="interaction-content">
                                        <h4>{customer?.name || 'عميل غير معروف'} - {type.label}</h4>
                                        <p>{interaction.notes}</p>
                                        <div className="time">{new Date(interaction.createdAt).toLocaleString('ar-EG')}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {interactions.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">💬</div>
                                <p>لا توجد تفاعلات مسجلة</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Customer Modal */}
            {showAddCustomer && (
                <div className="modal-overlay" onClick={() => setShowAddCustomer(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>➕ إضافة عميل جديد</h2>
                            <button className="close-btn" onClick={() => setShowAddCustomer(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddCustomer}>
                            <div className="form-group">
                                <label>الاسم *</label>
                                <input
                                    type="text"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        value={newCustomer.email}
                                        onChange={e => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>الهاتف</label>
                                    <input
                                        type="tel"
                                        value={newCustomer.phone}
                                        onChange={e => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>العنوان</label>
                                <input
                                    type="text"
                                    value={newCustomer.address}
                                    onChange={e => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>ملاحظات</label>
                                <textarea
                                    value={newCustomer.notes}
                                    onChange={e => setNewCustomer(prev => ({ ...prev, notes: e.target.value }))}
                                    rows="3"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddCustomer(false)}>إلغاء</button>
                                <button type="submit" className="btn-submit">💾 إضافة</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Interaction Modal */}
            {showAddInteraction && (
                <div className="modal-overlay" onClick={() => setShowAddInteraction(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📝 تسجيل تفاعل</h2>
                            <button className="close-btn" onClick={() => setShowAddInteraction(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddInteraction}>
                            <div className="form-group">
                                <label>العميل *</label>
                                <select
                                    value={newInteraction.customerId}
                                    onChange={e => setNewInteraction(prev => ({ ...prev, customerId: e.target.value }))}
                                    required
                                >
                                    <option value="">اختر عميل...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>نوع التفاعل *</label>
                                <select
                                    value={newInteraction.type}
                                    onChange={e => setNewInteraction(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    {INTERACTION_TYPES.map(t => (
                                        <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>التفاصيل *</label>
                                <textarea
                                    value={newInteraction.notes}
                                    onChange={e => setNewInteraction(prev => ({ ...prev, notes: e.target.value }))}
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddInteraction(false)}>إلغاء</button>
                                <button type="submit" className="btn-submit">💾 تسجيل</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Follow-up Modal */}
            {showAddFollowUp && (
                <div className="modal-overlay" onClick={() => setShowAddFollowUp(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📅 إضافة متابعة</h2>
                            <button className="close-btn" onClick={() => setShowAddFollowUp(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddFollowUp}>
                            <div className="form-group">
                                <label>العميل *</label>
                                <select
                                    value={newFollowUp.customerId}
                                    onChange={e => setNewFollowUp(prev => ({ ...prev, customerId: e.target.value }))}
                                    required
                                >
                                    <option value="">اختر عميل...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>الإجراء المطلوب *</label>
                                <input
                                    type="text"
                                    value={newFollowUp.action}
                                    onChange={e => setNewFollowUp(prev => ({ ...prev, action: e.target.value }))}
                                    placeholder="مثال: الاتصال للمتابعة"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>تاريخ المتابعة *</label>
                                <input
                                    type="date"
                                    value={newFollowUp.dueDate}
                                    onChange={e => setNewFollowUp(prev => ({ ...prev, dueDate: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddFollowUp(false)}>إلغاء</button>
                                <button type="submit" className="btn-submit">💾 إضافة</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CRMDashboard;
