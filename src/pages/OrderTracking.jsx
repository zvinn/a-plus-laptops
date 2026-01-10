import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore/lite';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
    ClipboardDocumentListIcon,
    TruckIcon,
    CheckBadgeIcon,
    ArchiveBoxIcon,
    CubeIcon
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import './OrderTracking.css';

const ORDER_STATUS_STEPS = [
    { id: 'pending', label: 'Processing', icon: ClipboardDocumentListIcon },
    { id: 'shipped', label: 'Shipped', icon: TruckIcon },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: CubeIcon },
    { id: 'delivered', label: 'Delivered', icon: CheckBadgeIcon },
];

const OrderTracking = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                // Determine user ID (handling both guest->user transition cases if needed, but primarily auth user)
                const userId = currentUser.uid;

                // Note: Firestore Lite client-side filtering
                const ordersRef = collection(db, 'orders');
                const q = query(
                    ordersRef,
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc')
                );

                const querySnapshot = await getDocs(q);
                const ordersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    // Handle non-serializable timestamps if needed, or keep for date-fns
                    createdAt: doc.data().createdAt?.toDate() || new Date()
                }));

                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser, navigate]);

    const getStatusIndex = (status) => {
        // Map backend status to step index
        // Default 'pending_whatsapp' maps to 'pending' (index 0)
        switch (status) {
            case 'pending_whatsapp': return 0;
            case 'pending': return 0;
            case 'processing': return 1; // Maps to implicit processing step between pending/shipped? Let's simplify
            case 'shipped': return 1;
            case 'out_for_delivery': return 2;
            case 'delivered': return 3;
            default: return 0;
        }
    };

    if (loading) {
        return (
            <div className="container page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <div className="spinner"></div>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="page-container container order-tracking-page">
                <SEO
                    title="Track Orders"
                    description="View your order history and track delivery status."
                    url="/orders"
                />

                <div className="order-tracking-header">
                    <h1>My Orders</h1>
                    <p>Track your delivery status and order history</p>
                </div>

                {orders.length === 0 ? (
                    <div className="no-orders flip-in-ver-right">
                        <ArchiveBoxIcon className="empty-state-icon" />
                        <h2>No orders found</h2>
                        <p>Looks like you haven't bought anything yet.</p>
                        <button onClick={() => navigate('/shop')} className="btn btn-primary">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order, index) => {
                            const statusIndex = getStatusIndex(order.status);
                            const progressWidth = `${(statusIndex / (ORDER_STATUS_STEPS.length - 1)) * 100}%`;

                            return (
                                <div key={order.id} className="order-card slide-in-bottom" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="order-header">
                                        <div className="order-id-group">
                                            <h3>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                                            <div className="order-meta">
                                                <span>{format(order.createdAt, 'PPP')}</span>
                                                <span>•</span>
                                                <span>{order.items.length} Items</span>
                                            </div>
                                        </div>
                                        <div className="order-total-badge">
                                            {order.totalAmount?.toLocaleString()} EGP
                                        </div>
                                    </div>

                                    <div className="order-timeline">
                                        <div className="timeline-track"></div>
                                        <div
                                            className="timeline-progress"
                                            style={{ width: progressWidth }}
                                        ></div>

                                        <div className="timeline-steps">
                                            {ORDER_STATUS_STEPS.map((step, i) => {
                                                const Icon = step.icon;
                                                const isActive = i <= statusIndex;
                                                const isCompleted = i < statusIndex;

                                                return (
                                                    <div
                                                        key={step.id}
                                                        className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                                                    >
                                                        <div className="step-dot">
                                                            <Icon />
                                                        </div>
                                                        <span className="step-label">{step.label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="order-items-preview">
                                        {order.items.map((item, i) => (
                                            <div key={`${order.id}-item-${i}`} className="preview-item">
                                                <div className="item-name">
                                                    {item.name}
                                                    <span>x{item.quantity}</span>
                                                </div>
                                                <div className="item-price">
                                                    {(item.price * item.quantity).toLocaleString()} EGP
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default OrderTracking;
