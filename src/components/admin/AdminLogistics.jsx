/* eslint-disable react/prop-types */
import { AlertTriangle, Package, Truck, Clock } from 'lucide-react';

const AdminLogistics = ({ products, orders }) => {

    // Low Stock Logic
    const lowStockProducts = products.filter(p => p.stockCount <= p.lowStockThreshold);

    // Pending Orders Logic
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const processingOrders = orders.filter(o => o.status === 'processing');

    return (
        <div className="logistics-dashboard animate-fade-in">
            <div className="logistics-grid">

                {/* LOW STOCK ALERT */}
                <div className="logistics-card warning">
                    <div className="card-header">
                        <h3><AlertTriangle size={20} /> Low Stock Alert</h3>
                        <span className="badge warning">{lowStockProducts.length}</span>
                    </div>
                    <div className="card-list">
                        {lowStockProducts.length === 0 ? (
                            <p className="empty-msg">All stock levels are healthy.</p>
                        ) : (
                            lowStockProducts.map(product => (
                                <div key={product.id} className="list-item">
                                    <div className="item-info">
                                        <span className="item-name">{product.name}</span>
                                        <span className="item-stock">Only {product.stockCount} left</span>
                                    </div>
                                    <button className="action-link">Restock</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* PENDING SHIPMENTS */}
                <div className="logistics-card processing">
                    <div className="card-header">
                        <h3><Truck size={20} /> Ready to Ship</h3>
                        <span className="badge info">{processingOrders.length}</span>
                    </div>
                    <div className="card-list">
                        {processingOrders.length === 0 ? (
                            <p className="empty-msg">No orders ready to ship.</p>
                        ) : (
                            processingOrders.map(order => (
                                <div key={order.id} className="list-item">
                                    <div className="item-info">
                                        <span className="item-name">Order #{order.id.slice(0, 6)}</span>
                                        <span className="item-meta">{order.shippingAddress?.city}</span>
                                    </div>
                                    <span className="status-tag processing">Processing</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RECENT ORDERS */}
                <div className="logistics-card pending">
                    <div className="card-header">
                        <h3><Clock size={20} /> Recent Pending</h3>
                        <span className="badge pending">{pendingOrders.length}</span>
                    </div>
                    <div className="card-list">
                        {pendingOrders.slice(0, 5).map(order => (
                            <div key={order.id} className="list-item">
                                <div className="item-info">
                                    <span className="item-name">Order #{order.id.slice(0, 6)}</span>
                                    <span className="item-meta">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                </div>
                                <span className="status-tag pending">New</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminLogistics;
