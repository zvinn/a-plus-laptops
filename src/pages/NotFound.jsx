import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiHome, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import './NotFound.css';

const NotFound = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="error-code-wrapper"
                >
                    <h1 className="error-code">404</h1>
                    <div className="error-glow"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="error-message"
                >
                    <h2>Oops! Page Not Found</h2>
                    <p>It seems you've ventured into uncharted digital territory. The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="search-section"
                >
                    <form onSubmit={handleSearch} className="not-found-search">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search for laptops, accessories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            aria-label="Search site"
                        />
                        <button type="submit">Search</button>
                    </form>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="action-buttons"
                >
                    <button onClick={() => navigate(-1)} className="btn-secondary">
                        <FiArrowLeft /> Go Back
                    </button>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        <FiHome /> Home
                    </button>
                    <button onClick={() => navigate('/shop')} className="btn-outline">
                        <FiShoppingBag /> Shop Now
                    </button>
                </motion.div>
            </div>

            <div className="background-decor-1"></div>
            <div className="background-decor-2"></div>
        </div>
    );
};

export default NotFound;
