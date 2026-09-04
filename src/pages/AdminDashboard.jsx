import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { LayoutDashboard, ShoppingBag, Truck, Users, Settings, LogOut, Package } from 'lucide-react';

// Services
import { productService } from '../api/productService';
import { orderService } from '../api/orderService';
import { adminService } from '../api/adminService';

// Components
import AdminStats from '../components/admin/AdminStats';
import AdminProductList from '../components/admin/AdminProductList';
import AdminOrderList from '../components/admin/AdminOrderList';
import AdminLogistics from '../components/admin/AdminLogistics';
import AdminUserManagement from '../components/admin/AdminUserManagement';
import Skeleton from '../components/Skeleton';
import AdminOnboarding from '../components/AdminOnboarding';

import './AdminDashboard.css';

const AdminDashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { error } = useToast();

    // State
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Data State
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [stats, setStats] = useState({
        revenue: 0,
        totalOrders: 0,
        pendingOrders: 0
    });

    // Check Admin Status
    useEffect(() => {
        const checkAdmin = async () => {
            if (!currentUser) {
                navigate('/login');
                return;
            }
            const { isAdmin } = await adminService.checkAdminStatus(currentUser.email);
            if (!isAdmin) {
                navigate('/');
                return;
            }
            setIsAdmin(true);
        };
        checkAdmin();
    }, [currentUser, navigate]);

    // Data Fetching
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [productsData, ordersData, adminsData] = await Promise.all([
                productService.getProducts(),
                orderService.getOrders(),
                adminService.getAdmins()
            ]);

            setProducts(productsData);
            setOrders(ordersData);
            setAdmins(adminsData);

            // Calculate Stats
            const revenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const pending = ordersData.filter(o => o.status === 'pending').length;
            setStats({
                revenue,
                totalOrders: ordersData.length,
                pendingOrders: pending
            });

        } catch (err) {
            console.error("Error fetching admin data:", err);
            error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [error]);

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin, fetchData]);

    // Render Loading
    if (!isAdmin || loading) {
        return (
            <div className="admin-container">
                <div className="admin-sidebar" style={{ width: '250px', padding: '2rem' }}>
                    <Skeleton type="circle" height="60px" width="60px" style={{ marginBottom: '2rem' }} />
                    <Skeleton type="text" height="20px" width="80%" style={{ marginBottom: '1rem' }} />
                    <Skeleton type="text" height="20px" width="80%" style={{ marginBottom: '1rem' }} />
                    <Skeleton type="text" height="20px" width="80%" style={{ marginBottom: '1rem' }} />
                </div>
                <div className="admin-content" style={{ flex: 1, padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        <Skeleton type="rect" height="120px" style={{ borderRadius: '16px' }} />
                        <Skeleton type="rect" height="120px" style={{ borderRadius: '16px' }} />
                        <Skeleton type="rect" height="120px" style={{ borderRadius: '16px' }} />
                        <Skeleton type="rect" height="120px" style={{ borderRadius: '16px' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            {/* Onboarding Tour */}
            <AdminOnboarding />

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                    <p className="admin-email">{currentUser.email}</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                        data-tour="admin-overview"
                    >
                        <LayoutDashboard size={20} /> Overview
                    </button>
                    <button
                        className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                        data-tour="admin-products"
                    >
                        <Package size={20} /> Products
                    </button>
                    <button
                        className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                        data-tour="admin-orders"
                    >
                        <ShoppingBag size={20} /> Orders
                    </button>
                    <button
                        className={`nav-btn ${activeTab === 'logistics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('logistics')}
                        data-tour="admin-logistics"
                    >
                        <Truck size={20} /> Logistics
                    </button>
                    <button
                        className={`nav-btn ${activeTab === 'admins' ? 'active' : ''}`}
                        onClick={() => setActiveTab('admins')}
                        data-tour="admin-users"
                    >
                        <Users size={20} /> Admins
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-btn logout" onClick={logout}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <h1>
                        {activeTab === 'dashboard' && 'Dashboard Overview'}
                        {activeTab === 'products' && 'Product Management'}
                        {activeTab === 'orders' && 'Order Management'}
                        {activeTab === 'logistics' && 'Logistics & Stock'}
                        {activeTab === 'admins' && 'Admin Users'}
                    </h1>
                </header>

                <div className="admin-content-wrapper">
                    {activeTab === 'dashboard' && (
                        <AdminStats stats={stats} products={products} orders={orders} />
                    )}
                    {activeTab === 'products' && (
                        <AdminProductList products={products} refreshProducts={fetchData} />
                    )}
                    {activeTab === 'orders' && (
                        <AdminOrderList orders={orders} refreshOrders={fetchData} />
                    )}
                    {activeTab === 'logistics' && (
                        <AdminLogistics products={products} orders={orders} />
                    )}
                    {activeTab === 'admins' && (
                        <AdminUserManagement admins={admins} refreshAdmins={fetchData} />
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
