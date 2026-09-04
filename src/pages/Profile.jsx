import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { User, Package, Settings, LogOut, MapPin, Phone, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import './Profile.css';

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();

    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        displayName: '',
        phoneNumber: '',
        address: '',
        governorate: ''
    });

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            setLoading(true);
            try {
                // 1. Fetch User Data
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setUserData({ ...userSnap.data(), displayName: currentUser.displayName || userSnap.data().displayName });
                } else {
                    setUserData(prev => ({ ...prev, displayName: currentUser.displayName }));
                }

                // 2. Fetch Orders
                // Try fetching by UID first, then Email as fallback
                let q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
                let querySnapshot = await getDocs(q);

                // Fallback for older orders without userId
                if (querySnapshot.empty && currentUser.email) {
                    q = query(collection(db, 'orders'), where('customerEmail', '==', currentUser.email), orderBy('createdAt', 'desc'));
                    querySnapshot = await getDocs(q);
                }

                const ordersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date()
                }));
                setOrders(ordersList);

            } catch (err) {
                console.error("Error loading profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [currentUser, navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, {
                phoneNumber: userData.phoneNumber,
                address: userData.address,
                governorate: userData.governorate
            });
            success('Profile updated successfully');
        } catch (err) {
            console.error("Update error:", err);
            toastError('Failed to update profile');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (err) {
            console.error("Failed to log out", err);
        }
    };

    // Helper for Status Badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed': return <span className="badge success"><CheckCircle size={14} /> Delivered</span>;
            case 'processing': return <span className="badge warning"><Clock size={14} /> Processing</span>;
            case 'cancelled': return <span className="badge danger"><XCircle size={14} /> Cancelled</span>;
            case 'pending_whatsapp': return <span className="badge info"><Phone size={14} /> Awaiting Confirmation</span>;
            default: return <span className="badge secondary">{status}</span>;
        }
    };

    if (!currentUser) return null;

    return (
        <div className="page-container container profile-page">
            <SEO title="My Account" description="Manage your orders and account details." url="/profile" noIndex={true} />

            <div className="profile-wrapper">
                {/* Sidebar */}
                <aside className="profile-sidebar">
                    <div className="user-summary">
                        <div className="avatar-circle">
                            {currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.charAt(0).toUpperCase()}
                        </div>
                        <h3>{currentUser.displayName || 'User'}</h3>
                        <p>{currentUser.email}</p>
                    </div>

                    <nav className="profile-nav">
                        <button
                            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <Package size={20} /> My Orders
                        </button>
                        <button
                            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={20} /> Account Settings
                        </button>
                        <button
                            className="nav-item logout"
                            onClick={handleLogout}
                        >
                            <LogOut size={20} /> Sign Out
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="profile-content">
                    {activeTab === 'orders' && (
                        <div className="tab-content orders-tab">
                            <h2>My Orders</h2>
                            {loading ? (
                                <div className="loading-state">Loading your orders...</div>
                            ) : orders.length > 0 ? (
                                <div className="orders-list">
                                    {orders.map(order => (
                                        <div key={order.id} className="order-card">
                                            <div className="order-header">
                                                <div>
                                                    <span className="order-id">#{order.id.slice(0, 8)}</span>
                                                    <span className="order-date">{order.createdAt.toLocaleDateString()}</span>
                                                </div>
                                                {getStatusBadge(order.status || 'pending')}
                                            </div>
                                            <div className="order-items">
                                                {order.items?.map((item, idx) => (
                                                    <div key={idx} className="order-item-row">
                                                        <span>{item.name}</span>
                                                        <span className="qty">x{item.quantity}</span>
                                                        <span className="price">{Number(item.price).toLocaleString()} EGP</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="order-footer">
                                                <div className="total">
                                                    <span>Total Amount:</span>
                                                    <strong>{Number(order.totalAmount).toLocaleString()} EGP</strong>
                                                </div>
                                                <button className="btn-text" onClick={() => navigate(`/orders?id=${order.id}`)}>
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <Package size={48} />
                                    <h3>No orders yet</h3>
                                    <p>Browse our products and make your first purchase!</p>
                                    <button className="btn btn-primary" onClick={() => navigate('/shop')}>Go to Shop</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="tab-content settings-tab">
                            <h2>Account Settings</h2>
                            <form className="settings-form" onSubmit={handleUpdateProfile}>
                                <div className="form-group">
                                    <label><User size={16} /> Full Name</label>
                                    <input
                                        type="text"
                                        value={userData.displayName || ''}
                                        onChange={e => setUserData({ ...userData, displayName: e.target.value })}
                                        disabled
                                    />
                                    <small>Managed via login provider</small>
                                </div>
                                <div className="form-group">
                                    <label><Mail size={16} /> Email Address</label>
                                    <input
                                        type="email"
                                        value={currentUser.email}
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label><Phone size={16} /> Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="01xxxxxxxxx"
                                        value={userData.phoneNumber || ''}
                                        onChange={e => setUserData({ ...userData, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><MapPin size={16} /> Shipping Address</label>
                                    <textarea
                                        placeholder="Street, Building, Apt..."
                                        value={userData.address || ''}
                                        onChange={e => setUserData({ ...userData, address: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Profile;
