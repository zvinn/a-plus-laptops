import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import {
    Home,
    Info,
    ShoppingBag,
    Search,
    ShoppingCart,
    User,
    LogIn,
    Monitor,
    Heart,
    Menu,
    X
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const { getCartCount } = useCart();
    const { wishlist } = useWishlist();
    const { language, toggleLanguage, t } = useLanguage();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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

    const isAdmin = currentUser?.email === 'mhamed.saad.ibrahim@gmail.com';

    return (
        <nav className={`navbar ${isMenuOpen ? 'menu-open' : ''} ${isScrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
            <div className="container navbar-container">
                <Link to="/" className="logo" onClick={closeMenu}>
                    <span className="logo-icon">A<sup>+</sup></span>
                    <span className="logo-text">Laptops</span>
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                    aria-controls="nav-links"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <ul id="nav-links" className={`nav-links ${isMenuOpen ? 'active' : ''}`} role="menubar">
                    <li>
                        <Link to="/" onClick={closeMenu} className="nav-link">
                            <Home size={20} />
                            <span>{t('nav.home')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/about" onClick={closeMenu} className="nav-link">
                            <Info size={20} />
                            <span>{t('nav.about')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/shop" onClick={closeMenu} className="nav-link">
                            <ShoppingBag size={20} />
                            <span>{t('nav.shop')}</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/finder" className="nav-link nav-link-highlight" onClick={closeMenu}>
                            <Search size={20} />
                            <span>{t('nav.finder')}</span>
                        </Link>
                    </li>

                    {!isAdmin && (
                        <li>
                            <Link to="/profile" className="nav-link wishlist-link" onClick={closeMenu} title={t('common.wishlist')}>
                                <Heart size={20} className={wishlist.length > 0 ? "fill-current text-red-500" : ""} />
                                {wishlist.length > 0 && <span className="wishlist-count">{wishlist.length}</span>}
                            </Link>
                        </li>
                    )}

                    {!isAdmin && (
                        <li>
                            <NotificationBell />
                        </li>
                    )}

                    {!isAdmin && (
                        <li>
                            <Link to="/cart" className="nav-link cart-link" onClick={closeMenu}>
                                <ShoppingCart size={20} />
                                <span>{t('nav.cart')}</span>
                                {getCartCount() > 0 && <span className="cart-count">{getCartCount()}</span>}
                            </Link>
                        </li>
                    )}

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
                        <ThemeToggle />
                    </li>

                    {currentUser ? (
                        <>
                            {isAdmin && (
                                <li>
                                    <Link to="/admin" onClick={closeMenu} className="nav-link">
                                        <Monitor size={20} />
                                        <span>{t('nav.admin')}</span>
                                    </Link>
                                </li>
                            )}
                            {!isAdmin && (
                                <li>
                                    <Link to="/profile" className="nav-link user-link" onClick={closeMenu}>
                                        <User size={20} />
                                        <span>{currentUser.displayName?.split(' ')[0] || t('common.profile')}</span>
                                    </Link>
                                </li>
                            )}
                            {isAdmin && (
                                <li>
                                    <button onClick={handleLogout} className="nav-link btn-logout" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <LogIn size={20} style={{ transform: 'rotate(180deg)' }} />
                                        <span>Logout</span>
                                    </button>
                                </li>
                            )}
                        </>
                    ) : (
                        <li>
                            <Link to="/login" className="btn btn-primary btn-sm" onClick={closeMenu}>
                                <LogIn size={20} />
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
