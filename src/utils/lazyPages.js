/**
 * Lazy-loaded page components
 * This file centralizes all page imports using React.lazy() for code splitting
 * and improved initial load performance.
 */

import { lazy } from 'react';

// Main Pages
export const Home = lazy(() => import('../pages/Home'));
export const Shop = lazy(() => import('../pages/Shop'));
export const About = lazy(() => import('../pages/About'));
export const Contact = lazy(() => import('../pages/Contact'));

// Product Pages
export const ProductDetails = lazy(() => import('../pages/ProductDetails'));
export const LaptopFinder = lazy(() => import('../pages/LaptopFinder'));

// Cart & Checkout
export const Cart = lazy(() => import('../pages/Cart'));
export const Checkout = lazy(() => import('../pages/Checkout'));
export const OrderSuccess = lazy(() => import('../pages/OrderSuccess'));
export const OrderTracking = lazy(() => import('../pages/OrderTracking'));

// User Pages
export const Login = lazy(() => import('../pages/Login'));
export const Profile = lazy(() => import('../pages/Profile'));
export const Wishlist = lazy(() => import('../pages/Wishlist'));

// Admin
export const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));

// Error Pages
export const NotFound = lazy(() => import('../pages/NotFound'));
