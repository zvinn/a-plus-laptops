/* eslint-disable react/prop-types */
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ToastProvider } from '../context/ToastContext';
import { NotificationProvider } from '../context/NotificationContext';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { ThemeProvider } from '../context/ThemeContext';
import { CouponProvider } from '../context/CouponContext';
import { ConfirmProvider } from '../context/ConfirmContext';
import AnalyticsListener from './AnalyticsListener';

const ContextProviders = ({ children }) => {
    return (
        <HelmetProvider>
            <ThemeProvider>
                <AuthProvider>
                    <LanguageProvider>
                        <ToastProvider>
                            <NotificationProvider>
                                <AnalyticsListener />
                                <CartProvider>
                                    <WishlistProvider>
                                        <CouponProvider>
                                            <ConfirmProvider>
                                                {children}
                                            </ConfirmProvider>
                                        </CouponProvider>
                                    </WishlistProvider>
                                </CartProvider>
                            </NotificationProvider>
                        </ToastProvider>
                    </LanguageProvider>
                </AuthProvider>
            </ThemeProvider>
        </HelmetProvider>
    );
};

export default ContextProviders;
