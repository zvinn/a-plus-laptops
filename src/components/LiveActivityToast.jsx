import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const names = ["Ahmed", "Mohamed", "Sara", "Omar", "Khaled", "Youssef", "Nour", "Ramy", "Mahmoud", "Ebrahim"];
const products = ["Asus TUF F15", "Lenovo Legion 5", "MacBook Air M2", "HP Victus", "Dell G15", "MSI Katana"];
const cities = ["Cairo", "Giza", "Alexandria", "Mansoura", "Tanta"];

const LiveActivityToast = () => {
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        // Show first notification after 5 seconds
        const initialTimer = setTimeout(() => {
            triggerNotification();
        }, 5000);

        // Then every 30-60 seconds loop
        const loop = setInterval(() => {
            if (document.hidden) return; // Don't spam if tab hidden
            triggerNotification();
        }, 45000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(loop);
        };
    }, []);

    const triggerNotification = () => {
        const name = names[Math.floor(Math.random() * names.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const timeAgo = Math.floor(Math.random() * 5) + 1; // 1-5 mins ago

        setNotification({
            id: Date.now(),
            name,
            product,
            city,
            timeAgo
        });

        // Hide after 6 seconds
        setTimeout(() => {
            setNotification(null);
        }, 6000);
    };

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: 50, x: -50 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '20px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(255,255,255,0.5)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        maxWidth: '320px',
                        fontFamily: 'Inter, sans-serif'
                    }}
                >
                    <div style={{
                        background: '#10b981',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <ShoppingBag size={20} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', fontWeight: '500' }}>
                            <span style={{ fontWeight: '700' }}>{notification.name}</span> from {notification.city} purchased
                        </p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                            {notification.product} <span style={{ color: '#10b981' }}>• {notification.timeAgo}m ago</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setNotification(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            marginLeft: 'auto'
                        }}
                    >
                        <X size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LiveActivityToast;
