

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

import { seedLaptops } from '../utils/seedData';
import PageTransition from './PageTransition';
import { PageErrorBoundary } from './ErrorBoundary';
import Skeleton from './Skeleton';

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
    <div style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px', margin: '0 auto' }}>
        <Skeleton type="rect" height="200px" style={{ borderRadius: '16px' }} />
        <Skeleton type="text" width="60%" />
        <Skeleton type="text" width="80%" />
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

