/* eslint-disable react/prop-types */
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';
import { NotificationProvider } from '../context/NotificationContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import AnalyticsListener from './AnalyticsListener';

const ContextProviders = ({ children }) => {
    return (
        <HelmetProvider>
            <AuthProvider>
                <LanguageProvider>
                    <ToastProvider>
                        <NotificationProvider>
                            <AnalyticsListener />
                            <CartProvider>
                                <WishlistProvider>
                                    {children}
                                </WishlistProvider>
                            </CartProvider>
                        </NotificationProvider>
                    </ToastProvider>
                </LanguageProvider>
            </AuthProvider>
        </HelmetProvider>
    );
};

export default ContextProviders;
