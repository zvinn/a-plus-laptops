import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import {
    collection, getDocs, addDoc, deleteDoc, doc,
    query, orderBy, where, serverTimestamp, Timestamp
} from 'firebase/firestore/lite';
import { useToast } from '../../context/ToastContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import './Accounting.css';

// Expense Categories
const EXPENSE_CATEGORIES = [
    { id: 'rent', label: 'إيجار', icon: '🏠', color: '#ef4444' },
    { id: 'salaries', label: 'رواتب', icon: '👥', color: '#f59e0b' },
    { id: 'shipping', label: 'شحن', icon: '🚚', color: '#3b82f6' },
    { id: 'marketing', label: 'تسويق', icon: '📢', color: '#8b5cf6' },
    { id: 'utilities', label: 'مرافق', icon: '💡', color: '#06b6d4' },
    { id: 'inventory', label: 'مخزون', icon: '📦', color: '#22c55e' },
    { id: 'maintenance', label: 'صيانة', icon: '🔧', color: '#ec4899' },
    { id: 'other', label: 'أخرى', icon: '📋', color: '#6b7280' },
];

const CHART_COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

const Accounting = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { success, error } = useToast();

    // State
    const [expenses, setExpenses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month'); // day, week, month, year
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: '',
        amount: '',
        category: 'other',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch orders (revenue)
            const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const ordersSnapshot = await getDocs(ordersQuery);
            const ordersData = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setOrders(ordersData);

            // Fetch expenses
            const expensesQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'));
            const expensesSnapshot = await getDocs(expensesQuery);
            const expensesData = expensesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date?.toDate?.() || new Date()
            }));
            setExpenses(expensesData);

        } catch (err) {
            console.error('Error fetching accounting data:', err);
            error('فشل في تحميل البيانات المحاسبية');
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

    // Filter data by period
    const getDateRange = () => {
        const now = new Date();
        const start = new Date();

        switch (period) {
            case 'day':
                start.setHours(0, 0, 0, 0);
                break;
            case 'week':
                start.setDate(now.getDate() - 7);
                break;
            case 'month':
                start.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                start.setFullYear(now.getFullYear() - 1);
                break;
            default:
                start.setMonth(now.getMonth() - 1);
        }

        return { start, end: now };
    };

    // Calculate Statistics
    const stats = useMemo(() => {
        const { start, end } = getDateRange();

        const filteredOrders = orders.filter(o => {
            const date = new Date(o.createdAt);
            return date >= start && date <= end;
        });

        const filteredExpenses = expenses.filter(e => {
            const date = new Date(e.date);
            return date >= start && date <= end;
        });

        const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        const pendingOrders = filteredOrders.filter(o => o.status === 'pending' || o.status === 'pending_whatsapp').length;

        return {
            totalRevenue,
            totalExpenses,
            netProfit,
            pendingOrders,
            profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0
        };
    }, [orders, expenses, period]);

    // Chart Data
    const revenueChartData = useMemo(() => {
        const { start } = getDateRange();
        const data = {};

        orders.filter(o => new Date(o.createdAt) >= start).forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
            if (!data[date]) {
                data[date] = { date, revenue: 0, expenses: 0 };
            }
            data[date].revenue += order.totalAmount || 0;
        });

        expenses.filter(e => new Date(e.date) >= start).forEach(expense => {
            const date = new Date(expense.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
            if (!data[date]) {
                data[date] = { date, revenue: 0, expenses: 0 };
            }
            data[date].expenses += expense.amount || 0;
        });

        return Object.values(data).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [orders, expenses, period]);

    const expensesByCategoryData = useMemo(() => {
        const { start } = getDateRange();
        const categoryTotals = {};

        expenses.filter(e => new Date(e.date) >= start).forEach(expense => {
            const category = EXPENSE_CATEGORIES.find(c => c.id === expense.category) || EXPENSE_CATEGORIES[7];
            if (!categoryTotals[category.id]) {
                categoryTotals[category.id] = { name: category.label, value: 0, color: category.color };
            }
            categoryTotals[category.id].value += expense.amount || 0;
        });

        return Object.values(categoryTotals);
    }, [expenses, period]);

    // Add Expense
    const handleAddExpense = async (e) => {
        e.preventDefault();

        if (!newExpense.description || !newExpense.amount) {
            error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            await addDoc(collection(db, 'expenses'), {
                ...newExpense,
                amount: Number(newExpense.amount),
                date: Timestamp.fromDate(new Date(newExpense.date)),
                addedBy: currentUser.email,
                createdAt: serverTimestamp()
            });

            success('تمت إضافة المصروف بنجاح');
            setShowAddExpense(false);
            setNewExpense({
                description: '',
                amount: '',
                category: 'other',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            fetchData();
        } catch (err) {
            console.error('Error adding expense:', err);
            error('فشل في إضافة المصروف');
        }
    };

    // Delete Expense
    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;

        try {
            await deleteDoc(doc(db, 'expenses', expenseId));
            success('تم حذف المصروف');
            fetchData();
        } catch (err) {
            console.error('Error deleting expense:', err);
            error('فشل في حذف المصروف');
        }
    };

    if (loading) {
        return (
            <div className="accounting-page">
                <div className="accounting-header">
                    <div className="loading-skeleton" style={{ width: '200px', height: '40px' }} />
                </div>
                <div className="accounting-stats">
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
        <div className="accounting-page">
            {/* Header */}
            <div className="accounting-header">
                <div>
                    <h1>💰 النظام المحاسبي</h1>
                    <p className="subtitle">تتبع الإيرادات والمصروفات وتحليل الأرباح</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="period-selector">
                        {[
                            { id: 'day', label: 'اليوم' },
                            { id: 'week', label: 'الأسبوع' },
                            { id: 'month', label: 'الشهر' },
                            { id: 'year', label: 'السنة' }
                        ].map(p => (
                            <button
                                key={p.id}
                                className={`period-btn ${period === p.id ? 'active' : ''}`}
                                onClick={() => setPeriod(p.id)}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <button className="export-btn" onClick={() => alert('جاري التطوير - تصدير التقارير')}>
                        📥 تصدير
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="accounting-stats">
                <div className="stat-card revenue">
                    <div className="stat-icon">💵</div>
                    <h3>إجمالي الإيرادات</h3>
                    <div className="stat-value">{stats.totalRevenue.toLocaleString()} EGP</div>
                    <div className="stat-change positive">
                        <span>↑</span> من المبيعات
                    </div>
                </div>

                <div className="stat-card expenses">
                    <div className="stat-icon">📉</div>
                    <h3>إجمالي المصروفات</h3>
                    <div className="stat-value">{stats.totalExpenses.toLocaleString()} EGP</div>
                    <div className="stat-change negative">
                        <span>↓</span> {expenses.length} معاملة
                    </div>
                </div>

                <div className="stat-card profit">
                    <div className="stat-icon">📊</div>
                    <h3>صافي الربح</h3>
                    <div className="stat-value" style={{ color: stats.netProfit >= 0 ? '#22c55e' : '#ef4444' }}>
                        {stats.netProfit.toLocaleString()} EGP
                    </div>
                    <div className={`stat-change ${stats.netProfit >= 0 ? 'positive' : 'negative'}`}>
                        <span>{stats.netProfit >= 0 ? '↑' : '↓'}</span> هامش ربح {stats.profitMargin}%
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <h3>طلبات معلقة</h3>
                    <div className="stat-value">{stats.pendingOrders}</div>
                    <div className="stat-change">
                        <span>⚡</span> تحتاج متابعة
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-section">
                <div className="chart-card">
                    <h3>📈 الإيرادات vs المصروفات</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="revenue" name="الإيرادات" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <h3>📊 توزيع المصروفات</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expensesByCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {expensesByCategoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `${value.toLocaleString()} EGP`}
                                    contentStyle={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div className="transactions-section">
                {/* Recent Revenue */}
                <div className="transactions-card">
                    <h3>
                        <span>💵 آخر الإيرادات</span>
                    </h3>
                    <div className="transactions-list">
                        {orders.slice(0, 10).map(order => (
                            <div key={order.id} className="transaction-item">
                                <div className="transaction-info">
                                    <div className="transaction-icon income">🛍️</div>
                                    <div className="transaction-details">
                                        <h4>{order.customerName || 'عميل'}</h4>
                                        <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                </div>
                                <div className="transaction-amount income">
                                    +{(order.totalAmount || 0).toLocaleString()} EGP
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">📭</div>
                                <p>لا توجد إيرادات حتى الآن</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expenses */}
                <div className="transactions-card">
                    <h3>
                        <span>📉 المصروفات</span>
                        <button className="add-btn" onClick={() => setShowAddExpense(true)}>
                            <span>+</span> إضافة مصروف
                        </button>
                    </h3>
                    <div className="transactions-list">
                        {expenses.slice(0, 10).map(expense => {
                            const category = EXPENSE_CATEGORIES.find(c => c.id === expense.category) || EXPENSE_CATEGORIES[7];
                            return (
                                <div key={expense.id} className="transaction-item">
                                    <div className="transaction-info">
                                        <div className="transaction-icon expense">{category.icon}</div>
                                        <div className="transaction-details">
                                            <h4>{expense.description}</h4>
                                            <span>{category.label} • {new Date(expense.date).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                    <div className="transaction-amount expense">
                                        -{(expense.amount || 0).toLocaleString()} EGP
                                    </div>
                                </div>
                            );
                        })}
                        {expenses.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon">📭</div>
                                <p>لا توجد مصروفات مسجلة</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            {showAddExpense && (
                <div className="modal-overlay" onClick={() => setShowAddExpense(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>➕ إضافة مصروف جديد</h2>
                            <button className="close-btn" onClick={() => setShowAddExpense(false)}>×</button>
                        </div>

                        <form onSubmit={handleAddExpense}>
                            <div className="form-group">
                                <label>الوصف *</label>
                                <input
                                    type="text"
                                    value={newExpense.description}
                                    onChange={e => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="مثال: إيجار المحل"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>المبلغ (EGP) *</label>
                                <input
                                    type="number"
                                    value={newExpense.amount}
                                    onChange={e => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>التصنيف</label>
                                <div className="category-pills">
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            className={`category-pill ${newExpense.category === cat.id ? 'active' : ''}`}
                                            onClick={() => setNewExpense(prev => ({ ...prev, category: cat.id }))}
                                        >
                                            {cat.icon} {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>التاريخ</label>
                                <input
                                    type="date"
                                    value={newExpense.date}
                                    onChange={e => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>ملاحظات</label>
                                <textarea
                                    value={newExpense.notes}
                                    onChange={e => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="ملاحظات إضافية (اختياري)"
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowAddExpense(false)}>
                                    إلغاء
                                </button>
                                <button type="submit" className="btn-submit">
                                    💾 حفظ المصروف
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounting;
