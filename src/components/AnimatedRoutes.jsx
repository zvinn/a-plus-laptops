

import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, lazy, Suspense } from 'react';

// Core Pages - Home is statically imported for better LCP (Largest Contentful Paint)
import Home from '../pages/Home';

// All other pages are lazy-loaded to reduce initial bundle size
const About = lazy(() => import('../pages/About'));
const Shop = lazy(() => import('../pages/Shop'));
const ProductDetails = lazy(() => import('../pages/ProductDetails'));
const Cart = lazy(() => import('../pages/Cart'));
const Login = lazy(() => import('../pages/Login'));
const Profile = lazy(() => import('../pages/Profile'));

const LaptopFinder = lazy(() => import('../pages/LaptopFinder'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
const Contact = lazy(() => import('../pages/Contact'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const OrderTracking = lazy(() => import('../pages/OrderTracking'));
const Wishlist = lazy(() => import('../pages/Wishlist'));
const ComparisonBattle = lazy(() => import('../components/LaptopComparison'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Admin System Pages
const Accounting = lazy(() => import('../pages/admin/Accounting'));
const InventoryManager = lazy(() => import('../pages/admin/InventoryManager'));
const CRMDashboard = lazy(() => import('../pages/admin/CRMDashboard'));
const InvoiceManager = lazy(() => import('../pages/admin/InvoiceManager'));
const CouponManager = lazy(() => import('../pages/admin/CouponManager'));

import { seedLaptops } from '../utils/seedData';
import PageTransition from './PageTransition';
import { PageErrorBoundary } from './ErrorBoundary';
import Skeleton from './Skeleton';

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
    <div className="page-loader" style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
    }}>
        {/* Header Skeleton */}
        <div style={{ textAlign: 'center' }}>
            <Skeleton type="text" width="40%" height="2rem" style={{ margin: '0 auto 1rem' }} />
            <Skeleton type="text" width="60%" height="1rem" style={{ margin: '0 auto' }} />
        </div>

        {/* Content Skeleton */}
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
        }}>
            {[1, 2, 3, 4].map(i => (
                <div
                    key={i}
                    style={{
                        background: 'var(--bg-card)',
                        borderRadius: '16px',
                        padding: '0',
                        overflow: 'hidden',
                        border: '1px solid var(--border-primary)'
                    }}
                >
                    <Skeleton type="rect" height="180px" style={{ borderRadius: 0 }} />
                    <div style={{ padding: '1rem' }}>
                        <Skeleton type="text" width="80%" style={{ marginBottom: '0.5rem' }} />
                        <Skeleton type="text" width="60%" style={{ marginBottom: '0.75rem' }} />
                        <Skeleton type="text" width="40%" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const SeedTrigger = () => {
    useEffect(() => {
        seedLaptops();
    }, []);
    return <div style={{ color: 'white', padding: 50 }}>Seeding Database... Check Console.</div>;
};

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={
                        <PageErrorBoundary pageName="Home">
                            <PageTransition><Home /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/about" element={
                        <PageErrorBoundary pageName="About">
                            <PageTransition><About /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/shop" element={
                        <PageErrorBoundary pageName="Shop">
                            <PageTransition><Shop /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/product/:id" element={
                        <PageErrorBoundary pageName="ProductDetails">
                            <PageTransition><ProductDetails /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/finder" element={
                        <PageErrorBoundary pageName="LaptopFinder">
                            <PageTransition><LaptopFinder /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/cart" element={
                        <PageErrorBoundary pageName="Cart">
                            <PageTransition><Cart /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/checkout" element={
                        <PageErrorBoundary pageName="Checkout">
                            <PageTransition><Checkout /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/order-success" element={
                        <PageErrorBoundary pageName="OrderSuccess">
                            <PageTransition><OrderSuccess /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    {/* Seed route removed for security */}
                    <Route path="/contact" element={
                        <PageErrorBoundary pageName="Contact">
                            <PageTransition><Contact /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/login" element={
                        <PageErrorBoundary pageName="Login">
                            <PageTransition><Login /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/profile" element={
                        <PageErrorBoundary pageName="Profile">
                            <PageTransition><Profile /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/admin" element={
                        <PageErrorBoundary pageName="AdminDashboard">
                            <PageTransition><AdminDashboard /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/admin/accounting" element={
                        <PageErrorBoundary pageName="Accounting">
                            <PageTransition><Accounting /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/admin/inventory" element={
                        <PageErrorBoundary pageName="InventoryManager">
                            <PageTransition><InventoryManager /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/admin/crm" element={
                        <PageErrorBoundary pageName="CRMDashboard">
                            <PageTransition><CRMDashboard /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/admin/invoices" element={
                        <PageErrorBoundary pageName="InvoiceManager">
                            <PageTransition><InvoiceManager /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/admin/coupons" element={
                        <PageErrorBoundary pageName="CouponManager">
                            <PageTransition><CouponManager /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/wishlist" element={
                        <PageErrorBoundary pageName="Wishlist">
                            <PageTransition><Wishlist /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/compare" element={
                        <PageErrorBoundary pageName="ComparisonBattle">
                            <PageTransition><ComparisonBattle /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="/orders" element={
                        <PageErrorBoundary pageName="OrderTracking">
                            <PageTransition><OrderTracking /></PageTransition>
                        </PageErrorBoundary>
                    } />
                    <Route path="*" element={
                        <PageErrorBoundary pageName="NotFound">
                            <PageTransition><NotFound /></PageTransition>
                        </PageErrorBoundary>
                    } />
                </Routes>
            </AnimatePresence>
        </Suspense>
    );
};

export default AnimatedRoutes;

