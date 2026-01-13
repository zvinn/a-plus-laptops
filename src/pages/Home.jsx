import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, limit, query, doc, getDoc, orderBy } from 'firebase/firestore/lite';
import { db } from '../firebase';
import ProductCard from '../components/ProductCard';
import LaptopComparison from '../components/LaptopComparison';
import HeroSearch from '../components/HeroSearch';
import { useLanguage } from '../context/LanguageContext';
import useScrollReveal from '../hooks/useScrollReveal';
import PolicyModal from '../components/PolicyModal';
import { ShieldCheckIcon, TruckIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import logo from '../assets/brand-logo.png';
import Skeleton from '../components/Skeleton';
import HolographicCard from '../components/HolographicCard';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import './Home.css';
import Testimonials from '../components/Testimonials';

const Home = () => {
    const { t } = useLanguage();
    useScrollReveal();

    const [featuredLaptops, setFeaturedLaptops] = useState([]);
    const [allLaptops, setAllLaptops] = useState([]);
    const [orders, setOrders] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            // 1. Try to load from cache first for immediate offline support
            const cachedData = localStorage.getItem('featuredLaptops');
            if (cachedData) {
                try {
                    setFeaturedLaptops(JSON.parse(cachedData));
                    setLoading(false); // Show cached content immediately
                } catch (e) {
                    console.error("Error parsing cached laptops", e);
                }
            }

            try {
                // 2. Fetch fresh data from Firestore
                const q = query(collection(db, "laptops"), limit(4));
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 3. Update state and cache
                setFeaturedLaptops(items);
                localStorage.setItem('featuredLaptops', JSON.stringify(items));
            } catch (error) {
                console.error("Error fetching featured laptops:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();

        // Fetch all laptops for best sellers calculation
        const fetchAllLaptops = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "laptops"));
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllLaptops(items);
            } catch (error) {
                console.error("Error fetching all laptops:", error);
            }
        };

        // Fetch orders to calculate best sellers
        const fetchOrders = async () => {
            try {
                const ordersQuery = query(collection(db, 'orders'));
                const ordersSnapshot = await getDocs(ordersQuery);
                const ordersData = ordersSnapshot.docs.map(doc => doc.data());
                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        fetchAllLaptops();
        fetchOrders();
    }, []);

    // Fetch recently viewed products
    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            try {
                const viewedIds = getRecentlyViewed().slice(0, 4);
                if (viewedIds.length === 0) return;

                const products = await Promise.all(
                    viewedIds.map(async (id) => {
                        try {
                            const docRef = doc(db, "laptops", id);
                            const docSnap = await getDoc(docRef);
                            if (docSnap.exists()) {
                                return { id: docSnap.id, ...docSnap.data() };
                            }
                            return null;
                        } catch {
                            return null;
                        }
                    })
                );

                setRecentlyViewed(products.filter(Boolean));
            } catch (err) {
                console.error("Error fetching recently viewed:", err);
            }
        };

        fetchRecentlyViewed();
    }, []);

    // Calculate best sellers based on order frequency
    const bestSellers = useMemo(() => {
        if (orders.length === 0 || allLaptops.length === 0) {
            // Fallback to showing products sorted by some criteria if no orders yet
            return allLaptops.slice(0, 4);
        }

        // Count how many times each product has been ordered
        const productSales = {};
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productName = item.name?.toLowerCase();
                    if (productName) {
                        productSales[productName] = (productSales[productName] || 0) + (item.quantity || 1);
                    }
                });
            }
        });

        // Sort laptops by sales count
        const sortedBySales = [...allLaptops].sort((a, b) => {
            const aSales = productSales[a.name?.toLowerCase()] || 0;
            const bSales = productSales[b.name?.toLowerCase()] || 0;
            return bSales - aSales;
        });

        return sortedBySales.slice(0, 4);
    }, [orders, allLaptops]);

    const features = [
        {
            key: 'qualityService',
            icon: <ChatBubbleLeftRightIcon className="feature-icon" />,
            color: 'var(--accent)',
            policyContent: t('features.qualityServiceDesc') + "\n\n(Policy Detail): We pride ourselves on exceptional after-sales support. Whether you need driver updates, software help, or hardware advice, our team is available to support you for the lifetime of your device."
        },
        {
            key: 'warranty',
            icon: <ShieldCheckIcon className="feature-icon" />,
            color: 'var(--primary)',
            policyContent: t('features.warrantyDesc') + "\n\n(Policy Detail): Our 6-month warranty covers hardware failures (Motherboard, Screen, Keyboard). It does not cover accidental damage, liquid spills, or software issues."
        },
        {
            key: 'shipping',
            icon: <TruckIcon className="feature-icon" />,
            color: 'var(--info)',
            policyContent: t('features.shippingDesc') + "\n\n(Policy Detail): Shipping usually takes 2-4 business days. You have the right to inspect the package (Open Box) before paying the courier. Returns are accepted within 14 days if the device is in original condition."
        }
    ];

    return (
        <div className="home-page">
            <SEO
                title="Home"
                description="A Plus+ - The ultimate destination for high-performance gaming laptops in Egypt. Shop ASUS ROG, Lenovo Legion, MSI, HP Victus with warranty and free shipping."
                url="/"
                keywords="A Plus, gaming laptops Egypt, buy laptop Cairo, ASUS ROG, Lenovo Legion, MSI gaming laptop"
            />

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-effects">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="grid-pattern"></div>
                </div>

                <div className="hero-content container">
                    {/* LEFT: Text & Search */}
                    <div className="hero-text-column">
                        <div className="hero-logo-wrapper">
                            <OptimizedImage
                                src={logo}
                                alt="A Plus+ Logo"
                                className="hero-logo"
                                priority={true}
                                skeletonHeight="60px"
                            />
                        </div>

                        <h1 className="hero-title">
                            {t('hero.title')} <br />
                            <span className="text-gradient">{t('hero.highlight')}</span>
                        </h1>
                        <p className="hero-slogan">{t('hero.subtitle')}</p>

                        <div className="hero-search-wrapper">
                            <HeroSearch />
                        </div>

                        <div className="hero-actions">
                            <Link to="/shop" className="btn btn-primary btn-lg">
                                {t('hero.shopBtn')}
                            </Link>
                            <a href="https://wa.me/201040663348" className="btn btn-outline btn-lg">
                                {t('hero.contactBtn')}
                            </a>
                        </div>
                    </div>

                    {/* RIGHT: 3D Holographic Card */}
                    <div className="hero-visual-column">
                        {featuredLaptops.length > 0 ? (
                            <HolographicCard product={featuredLaptops[0]} />
                        ) : (
                            <Skeleton type="rect" height="500px" width="380px" style={{ borderRadius: '24px' }} />
                        )}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="features-section container animate-on-scroll">
                <div className="features-grid">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="feature-card"
                            onClick={() => setSelectedPolicy({ title: t(`features.${f.key}`), content: f.policyContent })}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedPolicy({ title: t(`features.${f.key}`), content: f.policyContent });
                                }
                            }}
                            style={{ '--feature-color': f.color }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Learn more about ${t(`features.${f.key}`)}`}
                        >
                            <div className="feature-icon-wrapper" aria-hidden="true">
                                {f.icon}
                            </div>
                            <h3>{t(`features.${f.key}`)}</h3>
                            <p>{t(`features.${f.key}Desc`)}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Policy Modal */}
            {selectedPolicy && (
                <PolicyModal
                    title={selectedPolicy.title}
                    content={selectedPolicy.content}
                    onClose={() => setSelectedPolicy(null)}
                />
            )}

            {/* RECENTLY VIEWED */}
            {recentlyViewed.length > 0 && (
                <section className="recently-viewed-section section-padding animate-on-scroll">
                    <div className="container">
                        <div className="section-header">
                            <h2>Recently Viewed</h2>
                            <p>Continue where you left off</p>
                        </div>
                        <div className="recently-viewed-scroll" style={{
                            display: 'flex',
                            gap: '1.5rem',
                            overflowX: 'auto',
                            paddingBottom: '1rem',
                            scrollSnapType: 'x mandatory',
                            WebkitOverflowScrolling: 'touch'
                        }}>
                            {recentlyViewed.map(laptop => (
                                <div key={laptop.id} style={{ flex: '0 0 280px', scrollSnapAlign: 'start' }}>
                                    <ProductCard product={laptop} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* BEST SELLERS SECTION */}
            {bestSellers.length > 0 && (
                <section className="best-sellers-section section-padding animate-on-scroll">
                    <div className="container">
                        <div className="section-header">
                            <h2>🔥 الأكثر مبيعاً</h2>
                            <p>المنتجات الأكثر طلباً من عملائنا</p>
                        </div>
                        <div className="best-sellers-grid">
                            {bestSellers.map((laptop, index) => (
                                <div key={laptop.id} className="best-seller-item">
                                    <div className="best-seller-rank">
                                        <span>#{index + 1}</span>
                                    </div>
                                    <ProductCard product={laptop} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            <section className="featured-products section-padding animate-on-scroll">
                <div className="container">
                    <div className="section-header">
                        <h2>{t('featured.title')}</h2>
                        <p>{t('featured.subtitle')}</p>
                    </div>

                    <div className="products-grid">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="product-card-skeleton">
                                    <Skeleton type="rect" height="200px" />
                                    <div style={{ padding: '1.5rem' }}>
                                        <Skeleton type="text" width="80%" style={{ marginBottom: '1rem' }} />
                                        <Skeleton type="text" width="60%" style={{ marginBottom: '1rem' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                            <Skeleton type="text" width="40%" />
                                            <Skeleton type="circle" width="30px" height="30px" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            featuredLaptops.map(laptop => (
                                <ProductCard key={laptop.id} product={laptop} />
                            ))
                        )}
                    </div>

                    <div className="section-cta">
                        <Link to="/shop" className="btn btn-primary">{t('featured.viewAll')}</Link>
                    </div>
                </div>
            </section>

            {/* COMPARISON SECTION */}
            <section className="comparison-section section-padding animate-on-scroll">
                <div className="section-header">
                    <h2>{t('comparison.title')}</h2>
                    <p>{t('comparison.subtitle')}</p>
                </div>
                <LaptopComparison />
            </section>

            {/* TESTIMONIALS SECTION */}
            <Testimonials />
        </div>
    );
};

export default Home;
