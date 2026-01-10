import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query, updateDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore/lite';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import Skeleton from '../components/Skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AdminDashboard.css';

// 🔐 SUPER ADMIN - Can manage other admins
const SUPER_ADMIN_EMAIL = 'mhamed.saad.ibrahim@gmail.com';

const AdminDashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { success, error } = useToast();
    const { triggerNotification } = useNotifications();

    // Admin State
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [adminList, setAdminList] = useState([]);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [checkingAuth, setCheckingAuth] = useState(true);

    // Data State
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, pendingOrders: 0, totalProducts: 0 });

    // UI State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showAddForm, setShowAddForm] = useState(false);

    // Product Form State
    const [newProduct, setNewProduct] = useState({
        name: '', brand: '', price: '', image: '', stockCount: 50, lowStockThreshold: 5,
        specs: { cpu: '', gpu: '', ram: '', storage: '', screen: '' }
    });

    // 🔐 Check Admin Status
    const checkAdminStatus = async () => {
        if (!currentUser) {
            setCheckingAuth(false);
            return;
        }

        const userEmail = currentUser.email?.toLowerCase();

        // Check if Super Admin
        if (userEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
            setIsAdmin(true);
            setIsSuperAdmin(true);
            setCheckingAuth(false);
            return;
        }

        // Check in Firestore admins collection
        try {
            const adminDoc = await getDoc(doc(db, 'admins', userEmail));
            if (adminDoc.exists()) {
                setIsAdmin(true);
            }
        } catch (err) {
            console.error('Error checking admin status:', err);
        }

        setCheckingAuth(false);
    };

    // 📋 Fetch Admin List (Super Admin only)
    const fetchAdmins = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'admins'));
            const admins = querySnapshot.docs.map(doc => ({
                email: doc.id,
                ...doc.data()
            }));
            setAdminList(admins);
        } catch (err) {
            console.error('Error fetching admins:', err);
        }
    };

    // ➕ Add New Admin
    const handleAddAdmin = async (e) => {
        e.preventDefault();
        if (!newAdminEmail.trim()) return;

        const emailToAdd = newAdminEmail.toLowerCase().trim();

        try {
            await setDoc(doc(db, 'admins', emailToAdd), {
                addedBy: currentUser.email,
                addedAt: serverTimestamp()
            });
            success(`Admin "${emailToAdd}" added successfully!`);
            setNewAdminEmail('');
            fetchAdmins();
        } catch (err) {
            console.error(err);
            error('Failed to add admin');
        }
    };

    // ❌ Remove Admin
    const handleRemoveAdmin = async (email) => {
        if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
            error('Cannot remove Super Admin');
            return;
        }

        if (!window.confirm(`Remove admin: ${email}?`)) return;

        try {
            await deleteDoc(doc(db, 'admins', email));
            success('Admin removed');
            fetchAdmins();
        } catch (err) {
            console.error(err);
            error('Failed to remove admin');
        }
    };

    const fetchProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "laptops"));
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(items);
        } catch (err) {
            console.error(err);
            error("Failed to load products");
        }
    };

    const fetchOrders = async () => {
        try {
            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(items);

            // Calculate stats
            const revenue = items.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const pending = items.filter(o => o.status === 'pending' || !o.status).length;
            setStats(prev => ({
                ...prev,
                revenue,
                totalOrders: items.length,
                pendingOrders: pending
            }));
        } catch (err) {
            console.error(err);
            error("Failed to load orders");
        }
    };

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchOrders()]);
        setStats(prev => ({ ...prev, totalProducts: products.length }));
        setLoading(false);
    };

    useEffect(() => {
        checkAdminStatus();
    }, [currentUser]);

    useEffect(() => {
        if (!checkingAuth && !currentUser) {
            navigate('/login');
            return;
        }
        if (!checkingAuth && isAdmin) {
            fetchData();
            if (isSuperAdmin) {
                fetchAdmins();
            }
        }
    }, [checkingAuth, isAdmin, currentUser, navigate]);

    // --- Chart Data Preparation ---
    const getRevenueData = () => {
        const data = {};
        orders.forEach(order => {
            const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Unknown';
            data[date] = (data[date] || 0) + order.totalAmount;
        });
        return Object.keys(data).map(date => ({ date, amount: data[date] })).reverse();
    };

    const getStatusData = () => {
        const counts = {};
        orders.forEach(order => {
            const status = order.status || 'pending';
            counts[status] = (counts[status] || 0) + 1;
        });
        return Object.keys(counts).map(status => ({ name: status, value: counts[status] }));
    };

    const KPI_COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444'];

    // --- Product Actions ---
    const handleDeleteProduct = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "laptops", id));
                setProducts(products.filter(p => p.id !== id));
                success("Product deleted");
            } catch (err) {
                error("Failed to delete product");
            }
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const productToAdd = {
                ...newProduct,
                price: Number(newProduct.price),
                id: Date.now().toString(),
                games: [],
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, "laptops"), productToAdd);
            setShowAddForm(false);
            setNewProduct({
                name: '', brand: '', price: '', image: '', stockCount: 50, lowStockThreshold: 5,
                specs: { cpu: '', gpu: '', ram: '', storage: '', screen: '' }
            });
            fetchProducts();
            success("Product added successfully!");
        } catch (err) {
            error("Error adding product");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setNewProduct(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setNewProduct(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- Order Actions ---
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            success(`Order updated to ${newStatus}`);

            // Trigger Notification
            const order = orders.find(o => o.id === orderId);
            if (order && order.userId) {
                // 1. Send Internal Firestore Notification
                await triggerNotification(
                    order.userId,
                    "Order Update",
                    `Your order #${orderId.slice(0, 6)} has been marked as ${newStatus}.`,
                    "info"
                );

                // 2. Send Push Notification (FCM) via Vercel Function
                try {
                    // Fetch user's FCM token
                    const userSnap = await getDoc(doc(db, "users", order.userId));
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        if (userData.fcmToken) {
                            // Call our Vercel API
                            await fetch('/api/send-notification', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    token: userData.fcmToken,
                                    title: `Order ${newStatus.toUpperCase()} 📦`,
                                    body: `Your order #${orderId.slice(0, 6)} has been marked as ${newStatus}.`,
                                    link: '/orders' // Deep link if needed
                                }),
                            });
                        }
                    }
                } catch (pushErr) {
                    console.error("Failed to send push notification:", pushErr);
                    // Don't block the UI for this
                }
            } else if (order && order.id) {
                console.log("No userId found for order, skipping notification trigger.");
            }

        } catch (err) {
            console.error(err);
            error("Failed to update status");
        }
    };

    // 🔒 Auth Check Screen
    if (checkingAuth) {
        return (
            <div className="admin-page page-container container">
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="loading-spinner"></div>
                    <p>Checking authorization...</p>
                </div>
            </div>
        );
    }

    // ⛔ Not Admin Screen
    if (!isAdmin) {
        return (
            <div className="admin-page page-container container">
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</h1>
                    <h2>Access Denied</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        You don't have permission to access this page.
                    </p>
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                        Logged in as: {currentUser?.email}
                    </p>
                    <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/')}>
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-page page-container container">
                <Skeleton type="text" height="40px" width="200px" style={{ marginBottom: '2rem' }} />
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <Skeleton type="rect" height="100px" width="30%" />
                    <Skeleton type="rect" height="100px" width="30%" />
                    <Skeleton type="rect" height="100px" width="30%" />
                </div>
                <Skeleton type="rect" height="400px" />
            </div>
        );
    }

    return (
        <div className="admin-page page-container container">
            <div className="admin-header">
                <div>
                    <h1>Admin Dashboard</h1>
                    <p className="text-muted">
                        Welcome, {currentUser?.email}
                        {isSuperAdmin && <span className="super-admin-badge">👑 Super Admin</span>}
                    </p>
                </div>
                <div className="admin-tabs">
                    <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
                    <button className={`tab-btn ${activeTab === 'logistics' ? 'active' : ''}`} onClick={() => setActiveTab('logistics')}>🚚 Logistics</button>
                    <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>💻 Products</button>
                    <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📦 Orders</button>
                    {isSuperAdmin && (
                        <button className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}>👥 Manage Admins</button>
                    )}
                </div>
            </div>

            <div className="admin-content">
                {activeTab === 'dashboard' && (
                    <div className="dashboard-overview animate-fade-in">
                        <div className="stats-grid">
                            <div className="stat-card revenue">
                                <div className="stat-icon">💰</div>
                                <div className="stat-info">
                                    <h3>Total Revenue</h3>
                                    <p>{stats.revenue.toLocaleString()} EGP</p>
                                </div>
                            </div>
                            <div className="stat-card orders">
                                <div className="stat-icon">🛍️</div>
                                <div className="stat-info">
                                    <h3>Total Orders</h3>
                                    <p>{stats.totalOrders}</p>
                                </div>
                            </div>
                            <div className="stat-card pending">
                                <div className="stat-icon">⏳</div>
                                <div className="stat-info">
                                    <h3>Pending</h3>
                                    <p>{stats.pendingOrders}</p>
                                </div>
                            </div>
                            <div className="stat-card products">
                                <div className="stat-icon">💻</div>
                                <div className="stat-info">
                                    <h3>Products</h3>
                                    <p>{products.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* ANALYTICS CHARTS */}
                        <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                            <div className="chart-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Revenue Trends 📈</h3>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={getRevenueData()}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                                            <XAxis dataKey="date" stroke="var(--text-secondary)" />
                                            <YAxis stroke="var(--text-secondary)" />
                                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }} />
                                            <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="chart-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Order Status Distribution 📊</h3>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={getStatusData()}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label
                                            >
                                                {getStatusData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={KPI_COLORS[index % KPI_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'logistics' && (
                    <div className="logistics-manager animate-fade-in">
                        <div className="stats-grid">
                            <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                                <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>⚠️</div>
                                <div className="stat-info">
                                    <h3>Low Stock Alerts</h3>
                                    <p>{products.filter(p => (p.stockCount || 0) <= (p.lowStockThreshold || 5)).length}</p>
                                </div>
                            </div>
                            <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                                <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>📉</div>
                                <div className="stat-info">
                                    <h3>Out of Stock</h3>
                                    <p>{products.filter(p => (p.stockCount || 0) === 0).length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="charts-grid" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div className="chart-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                                <h3>⚠️ Low Stock Items</h3>
                                <div className="table-responsive" style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                                    <table className="products-table" style={{ fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Stock</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products
                                                .filter(p => (p.stockCount || 0) <= (p.lowStockThreshold || 5))
                                                .map(p => (
                                                    <tr key={p.id}>
                                                        <td>{p.name}</td>
                                                        <td style={{ fontWeight: 'bold' }}>{p.stockCount || 0}</td>
                                                        <td><span className="status-badge pending">Low Stock</span></td>
                                                    </tr>
                                                ))}
                                            {products.filter(p => (p.stockCount || 0) <= (p.lowStockThreshold || 5)).length === 0 && (
                                                <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>All stocks healthy!</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="chart-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                                <h3>🔥 Fast Selling (Sales Velocity)</h3>
                                <div className="table-responsive" style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                                    <table className="products-table" style={{ fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Sold</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders
                                                .flatMap(o => o.items || [])
                                                .reduce((acc, item) => {
                                                    const existing = acc.find(x => x.name === item.name);
                                                    if (existing) existing.sold += item.quantity;
                                                    else acc.push({ name: item.name, sold: item.quantity });
                                                    return acc;
                                                }, [])
                                                .sort((a, b) => b.sold - a.sold)
                                                .slice(0, 5)
                                                .map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.name}</td>
                                                        <td style={{ fontWeight: 'bold', color: '#22c55e' }}>{item.sold}</td>
                                                    </tr>
                                                ))}
                                            {orders.length === 0 && <tr><td colSpan="2" style={{ textAlign: 'center' }}>No sales data yet.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="products-manager animate-fade-in">
                        <div className="actions-bar">
                            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                                {showAddForm ? 'Cancel' : '+ Add New Product'}
                            </button>
                        </div>

                        {showAddForm && (
                            <div className="add-product-form slide-down">
                                <h2>Add New Laptop</h2>
                                <form onSubmit={handleAddProduct}>
                                    <div className="form-grid">
                                        <div className="form-group"><label>Name</label><input name="name" value={newProduct.name} onChange={handleInputChange} required /></div>
                                        <div className="form-group">
                                            <label>Brand</label>
                                            <select name="brand" value={newProduct.brand} onChange={handleInputChange} required>
                                                <option value="">Select Brand</option>
                                                <option value="Asus">Asus</option>
                                                <option value="Lenovo">Lenovo</option>
                                                <option value="MSI">MSI</option>
                                                <option value="Razer">Razer</option>
                                                <option value="HP">HP</option>
                                                <option value="Dell">Dell</option>
                                                <option value="Apple">Apple</option>
                                            </select>
                                        </div>
                                        <div className="form-group"><label>Price (EGP)</label><input type="number" name="price" value={newProduct.price} onChange={handleInputChange} required /></div>
                                        <div className="form-group"><label>Image URL</label><input name="image" value={newProduct.image} onChange={handleInputChange} placeholder="https://..." required /></div>
                                        <div className="form-group"><label>CPU</label><input name="specs.cpu" value={newProduct.specs.cpu} onChange={handleInputChange} required /></div>
                                        <div className="form-group"><label>GPU</label><input name="specs.gpu" value={newProduct.specs.gpu} onChange={handleInputChange} required /></div>
                                        <div className="form-group"><label>RAM</label><input name="specs.ram" value={newProduct.specs.ram} onChange={handleInputChange} required /></div>
                                        <div className="form-group"><label>Storage</label><input name="specs.storage" value={newProduct.specs.storage} onChange={handleInputChange} required /></div>
                                        <div className="form-group"><label>Stock Count</label><input type="number" name="stockCount" value={newProduct.stockCount} onChange={handleInputChange} required /></div>
                                        <div className="form-group"><label>Low Stock Threshold</label><input type="number" name="lowStockThreshold" value={newProduct.lowStockThreshold} onChange={handleInputChange} required /></div>
                                    </div>
                                    <button type="submit" className="btn btn-success" style={{ marginTop: '1rem' }}>Save Product</button>
                                </form>
                            </div>
                        )}

                        <div className="products-table-container">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Brand</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product.id}>
                                            <td><img src={product.image} alt="" className="table-img" /></td>
                                            <td>{product.name}</td>
                                            <td>{product.brand}</td>
                                            <td>{product.price?.toLocaleString()}</td>
                                            <td>
                                                <span className={`status-badge ${product.stockCount <= product.lowStockThreshold ? 'shipped' : 'success'}`} style={{ backgroundColor: product.stockCount === 0 ? '#fee2e2' : undefined, color: product.stockCount === 0 ? '#991b1b' : undefined }}>
                                                    {product.stockCount ?? 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="btn-delete">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="orders-manager animate-fade-in">
                        <div className="products-table-container">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Order Details</th>
                                        <th>Total</th>
                                        <th>Status / Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td>
                                                <div style={{ fontWeight: 'bold' }}>{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A'}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.id.slice(0, 6)}...</div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{order.customerName}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.shippingDetails?.city}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.customerEmail}</div>
                                            </td>
                                            <td>
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} style={{ fontSize: '0.85rem' }}>
                                                        • {item.quantity}x {item.name}
                                                    </div>
                                                ))}
                                            </td>
                                            <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{order.totalAmount?.toLocaleString()} EGP</td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                                                    <div className="status-actions">
                                                        {order.status !== 'shipped' && order.status !== 'delivered' && (
                                                            <button className="btn-xs btn-outline" onClick={() => updateOrderStatus(order.id, 'shipped')}>Mark Shipped</button>
                                                        )}
                                                        {order.status === 'shipped' && (
                                                            <button className="btn-xs btn-success" onClick={() => updateOrderStatus(order.id, 'delivered')}>Mark Delivered</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No orders found yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 👥 MANAGE ADMINS TAB (Super Admin Only) */}
                {activeTab === 'admins' && isSuperAdmin && (
                    <div className="admins-manager animate-fade-in">
                        <div className="admin-section-card">
                            <h2>👥 Manage Administrators</h2>
                            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                                Add or remove users who can access the admin dashboard.
                            </p>

                            {/* Add Admin Form */}
                            <form onSubmit={handleAddAdmin} className="add-admin-form">
                                <input
                                    type="email"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    placeholder="Enter email address..."
                                    required
                                />
                                <button type="submit" className="btn btn-primary">
                                    + Add Admin
                                </button>
                            </form>

                            {/* Admin List */}
                            <div className="admins-list">
                                <h3>Current Admins</h3>

                                {/* Super Admin (Cannot be removed) */}
                                <div className="admin-item super">
                                    <div className="admin-info">
                                        <span className="admin-email">{SUPER_ADMIN_EMAIL}</span>
                                        <span className="super-badge">👑 Super Admin</span>
                                    </div>
                                    <span className="protected-label">Protected</span>
                                </div>

                                {/* Other Admins */}
                                {adminList.map(admin => (
                                    <div key={admin.email} className="admin-item">
                                        <div className="admin-info">
                                            <span className="admin-email">{admin.email}</span>
                                            <span className="added-by">Added by: {admin.addedBy}</span>
                                        </div>
                                        <button
                                            className="btn-delete-sm"
                                            onClick={() => handleRemoveAdmin(admin.email)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                {adminList.length === 0 && (
                                    <p className="no-admins">No additional admins added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
