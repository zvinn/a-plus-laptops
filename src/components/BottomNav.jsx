import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
    HomeIcon,
    ShoppingBagIcon,
    ShoppingCartIcon,
    UserIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    ShoppingBagIcon as ShoppingBagIconSolid,
    ShoppingCartIcon as ShoppingCartIconSolid,
    UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';
import './BottomNav.css';

const BottomNav = () => {
    const { cart } = useCart();
    const { user } = useAuth();

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const navItems = [
        {
            path: '/',
            label: 'Home',
            icon: HomeIcon,
            activeIcon: HomeIconSolid
        },
        {
            path: '/shop',
            label: 'Shop',
            icon: ShoppingBagIcon,
            activeIcon: ShoppingBagIconSolid
        },
        {
            path: '/finder',
            label: 'Find',
            icon: MagnifyingGlassIcon,
            activeIcon: MagnifyingGlassIcon
        },
        {
            path: '/cart',
            label: 'Cart',
            icon: ShoppingCartIcon,
            activeIcon: ShoppingCartIconSolid,
            badge: cartCount > 0 ? cartCount : null
        },
        {
            path: user ? '/profile' : '/login',
            label: user ? 'Profile' : 'Login',
            icon: UserIcon,
            activeIcon: UserIconSolid
        }
    ];

    return (
        <nav className="bottom-nav" aria-label="Mobile navigation">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `bottom-nav-item ${isActive ? 'active' : ''}`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <span className="bottom-nav-icon">
                                {isActive ? (
                                    <item.activeIcon />
                                ) : (
                                    <item.icon />
                                )}
                                {item.badge && (
                                    <span className="bottom-nav-badge">{item.badge}</span>
                                )}
                            </span>
                            <span className="bottom-nav-label">{item.label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
