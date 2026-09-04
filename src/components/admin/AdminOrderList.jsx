/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Package, Calendar, User, CreditCard } from 'lucide-react';
import { orderService } from '../../api/orderService';
import { useToast } from '../../context/ToastContext';

const AdminOrderList = ({ orders, refreshOrders }) => {
    const { success, error } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shippingAddress?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            refreshOrders();
            success(`Order status updated to ${newStatus}`);
        } catch {
            error("Failed to update status");
        }
    };

    const toggleOrderExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    return (
        <div className="orders-manager animate-fade-in">
            <div className="search-bar">
                <Search size={20} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by Order ID or Customer Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="orders-list">
                {filteredOrders.map(order => (
                    <div key={order.id} className="order-card">
                        <div className="order-header" onClick={() => toggleOrderExpand(order.id)}>
                            <div className="order-main-info">
                                <span className="order-id">#{order.id.slice(0, 8)}</span>
                                <span className="order-date">
                                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                </span>
                                <span className="order-customer">{order.shippingAddress?.fullName}</span>
                            </div>
                            <div className="order-status-actions" onClick={e => e.stopPropagation()}>
                                <select
                                    className={`status-select ${order.status}`}
                                    value={order.status}
                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <button className="expand-btn">
                                    {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>
                        </div>

                        {expandedOrder === order.id && (
                            <div className="order-details slide-down">
                                <div className="details-grid">
                                    <div className="detail-section">
                                        <h4><User size={16} /> Customer Details</h4>
                                        <p>{order.shippingAddress?.fullName}</p>
                                        <p>{order.shippingAddress?.email}</p>
                                        <p>{order.shippingAddress?.phone}</p>
                                        <p>{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                                    </div>
                                    <div className="detail-section">
                                        <h4><Package size={16} /> Order Items</h4>
                                        {order.items.map((item, index) => (
                                            <div key={index} className="order-item">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span>{(item.price * item.quantity).toLocaleString()} EGP</span>
                                            </div>
                                        ))}
                                        <div className="order-total">
                                            <span>Total</span>
                                            <span>{order.totalAmount.toLocaleString()} EGP</span>
                                        </div>
                                    </div>
                                    <div className="detail-section">
                                        <h4><CreditCard size={16} /> Payment Info</h4>
                                        <p>Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                                        <p>Status: {order.paymentStatus || 'Pending'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminOrderList;
