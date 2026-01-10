import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import {
    HomeIcon,
    InformationCircleIcon,
    ShoppingBagIcon,
    MagnifyingGlassIcon,
    ShoppingCartIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    ComputerDesktopIcon,
    HeartIcon,
    Bars3Icon,
    XMarkIcon,
    SunIcon,
    MoonIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const { getCartCount } = useCart();
    const { wishlist } = useWishlist();
    const { language, toggleLanguage, t } = useLanguage();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        document.body.setAttribute('data-theme', 'dark');

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
            setIsMenuOpen(false);
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className={`navbar ${isMenuOpen ? 'menu-open' : ''} ${isScrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
            <div className="container navbar-container">
                <Link to="/" className="logo" onClick={closeMenu}>
                    <span className="logo-icon">A+</span>
                    <span className="logo-text">Laptops</span>
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                    aria-controls="nav-links"
                >
                    {isMenuOpen ? <XMarkIcon className="icon-md" /> : <Bars3Icon className="icon-md" />}
                </button>

                <ul id="nav-links" className={`nav-links ${isMenuOpen ? 'active' : ''}`} role="menubar">
                    <li>
                        <Link to="/" onClick={closeMenu} className="nav-link">
                            <HomeIcon className="icon-sm" />
                            <span>{t('nav.home')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/about" onClick={closeMenu} className="nav-link">
                            <InformationCircleIcon className="icon-sm" />
                            <span>{t('nav.about')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/shop" onClick={closeMenu} className="nav-link">
                            <ShoppingBagIcon className="icon-sm" />
                            <span>{t('nav.shop')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/finder" className="nav-link nav-link-highlight" onClick={closeMenu}>
                            <MagnifyingGlassIcon className="icon-sm" />
                            <span>{t('nav.finder')}</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/profile" className="nav-link wishlist-link" onClick={closeMenu} title={t('common.wishlist')}>
                            {wishlist.length > 0 ? (
                                <HeartSolid className="icon-sm heart-active" />
                            ) : (
                                <HeartIcon className="icon-sm" />
                            )}
                            {wishlist.length > 0 && <span className="wishlist-count">{wishlist.length}</span>}
                        </Link>
                    </li>

                    <li>
                        <NotificationBell />
                    </li>

                    <li>
                        <Link to="/cart" className="nav-link cart-link" onClick={closeMenu}>
                            <ShoppingCartIcon className="icon-sm" />
                            <span>{t('nav.cart')}</span>
                            {getCartCount() > 0 && <span className="cart-count">{getCartCount()}</span>}
                        </Link>
                    </li>

                    <li>
                        <button
                            onClick={toggleLanguage}
                            className="nav-btn lang-btn"
                            aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
                        >
                            {language === 'en' ? '🇺🇸 EN' : '🇪🇬 AR'}
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={toggleTheme}
                            className="nav-btn theme-btn"
                            title="Toggle Theme"
                            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDarkMode ? <SunIcon className="icon-sm" /> : <MoonIcon className="icon-sm" />}
                        </button>
                    </li>

                    {currentUser ? (
                        <>
                            {currentUser.email === 'admin3@test.com' && (
                                <li>
                                    <Link to="/admin" onClick={closeMenu} className="nav-link">
                                        <ComputerDesktopIcon className="icon-sm" />
                                        <span>{t('nav.admin')}</span>
                                    </Link>
                                </li>
                            )}
                            <li>
                                <Link to="/profile" className="nav-link user-link" onClick={closeMenu}>
                                    <UserIcon className="icon-sm" />
                                    <span>{currentUser.displayName?.split(' ')[0] || t('common.profile')}</span>
                                </Link>
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link to="/login" className="btn btn-primary btn-sm" onClick={closeMenu}>
                                <ArrowRightOnRectangleIcon className="icon-sm" />
                                <span>{t('nav.login')}</span>
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
