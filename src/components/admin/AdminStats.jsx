/* eslint-disable react/prop-types */
import {
    DollarSign, ShoppingBag, Clock, Laptop,
    TrendingUp, PieChart as PieIcon
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const KPI_COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444'];

const AdminStats = ({ stats, products, orders }) => {

    // Helper: Prepare Revenue Data
    const getRevenueData = () => {
        const data = {};
        orders.forEach(order => {
            const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Unknown';
            data[date] = (data[date] || 0) + order.totalAmount;
        });
        return Object.keys(data).map(date => ({ date, amount: data[date] })).reverse();
    };

    // Helper: Prepare Status Data
    const getStatusData = () => {
        const counts = {};
        orders.forEach(order => {
            const status = order.status || 'pending';
            counts[status] = (counts[status] || 0) + 1;
        });
        return Object.keys(counts).map(status => ({ name: status, value: counts[status] }));
    };

    return (
        <div className="dashboard-overview animate-fade-in">
            <div className="stats-grid">
                <div className="stat-card revenue">
                    <div className="stat-icon"><DollarSign size={24} /></div>
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <p>{stats.revenue.toLocaleString()} EGP</p>
                    </div>
                </div>
                <div className="stat-card orders">
                    <div className="stat-icon"><ShoppingBag size={24} /></div>
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <p>{stats.totalOrders}</p>
                    </div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-icon"><Clock size={24} /></div>
                    <div className="stat-info">
                        <h3>Pending</h3>
                        <p>{stats.pendingOrders}</p>
                    </div>
                </div>
                <div className="stat-card products">
                    <div className="stat-icon"><Laptop size={24} /></div>
                    <div className="stat-info">
                        <h3>Products</h3>
                        <p>{products.length}</p>
                    </div>
                </div>
            </div>

            {/* ANALYTICS CHARTS */}
            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                <div className="chart-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>Revenue Trends <TrendingUp size={20} /></h3>
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
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>Order Status Distribution <PieIcon size={20} /></h3>
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
    );
};

export default AdminStats;
