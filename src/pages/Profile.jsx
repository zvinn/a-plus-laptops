import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore/lite';
import { useNavigate } from 'react-router-dom';
import Skeleton from '../components/Skeleton';
import SEO from '../components/SEO';
import './Profile.css';

const Profile = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch {
            console.error("Failed to log out");
        }
    };

    if (!currentUser) return null;

    return (
        <div className="page-container container profile-page">
            <SEO
                title="My Profile"
                description="View your order history and saved comparisons."
                url="/profile"
                noIndex={true}
            />
            <div className="profile-header">
                <div className="profile-avatar">
                    {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="profile-info">
                    <h1>Hello, {currentUser?.displayName || 'User'}! 👋</h1>
                    <p>{currentUser?.email}</p>
                    <button
                        onClick={handleLogout}
                        className="btn btn-outline btn-sm"
                        style={{ marginTop: '10px' }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            <div className="profile-sections-grid" style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
                {/* ORDER TRACKING CARD */}
                <div className="profile-action-card" style={{
                    background: 'var(--bg-secondary)',
                    padding: '2rem',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📦 Order History & Status</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>Track your deliveries and view past purchases.</p>
                    </div>
                    <button
                        onClick={() => navigate('/orders')}
                        className="btn btn-primary"
                    >
                        Track My Orders
                    </button>
                </div>

                {/* SAVED COMPARISONS SECTION */}
                <div>
                    <h2 className="section-title">⚖️ Saved Comparisons</h2>
                    <SavedComparisonsList />
                </div>
            </div>
        </div>
    );
};

export default Profile;

const SavedComparisonsList = () => {
    const [saved, setSaved] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem('savedComparisons') || '[]');
        setSaved(data);
    }, []);

    const deleteComparison = (id) => {
        const newData = saved.filter(c => c.id !== id);
        setSaved(newData);
        localStorage.setItem('savedComparisons', JSON.stringify(newData));
    };

    if (saved.length === 0) {
        return <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No saved comparisons yet.</p>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {saved.map(comp => (
                <div key={comp.id} style={{
                    background: 'var(--card-bg)',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    position: 'relative'
                }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); deleteComparison(comp.id); }}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                        ×
                    </button>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {new Date(comp.date).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '1rem' }}>
                        {comp.laptops.slice(0, 3).map(l => (
                            <img key={l.id} src={l.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                        ))}
                    </div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                        {comp.laptops.map(l => l.brand).join(' vs ')}
                    </h4>
                    <button
                        className="btn btn-outline btn-sm"
                        style={{ width: '100%' }}
                        onClick={() => navigate(`/?compare=${comp.laptops[0].id}`)} // MVP: Load first ID, user compares manually or we enhance URL logic later
                    >
                        View Comparison
                    </button>
                </div>
            ))}
        </div>
    );
};
