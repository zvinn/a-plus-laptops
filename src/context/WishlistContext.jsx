import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem('wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.warn("localStorage access denied", e);
            return [];
        }
    });

    const { success, info } = useToast();

    useEffect(() => {
        try {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        } catch (e) {
            console.warn("localStorage save failed", e);
        }
    }, [wishlist]);

    const toggleWishlist = (product) => {
        if (wishlist.some(item => item.id === product.id)) {
            setWishlist(prev => prev.filter(item => item.id !== product.id));
            info(`Removed ${product.name} from wishlist.`);
        } else {
            setWishlist(prev => [...prev, product]);
            success(`Added ${product.name} to wishlist! ❤️`);
        }
    };

    const clearWishlist = () => {
        setWishlist([]);
    };

    const isInWishlist = (id) => wishlist.some(item => item.id === id);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
