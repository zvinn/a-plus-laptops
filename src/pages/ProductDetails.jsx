import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, memo } from 'react';
import { doc, getDoc } from 'firebase/firestore/lite';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';
import SEO from '../components/SEO';
import './ProductDetails.css';
import ReviewList from '../components/ReviewList';
import { trackViewItem, trackAddToCart } from '../utils/analytics';
import { addRecentlyViewed, getRecentlyViewed } from '../utils/recentlyViewed';

// Sub-component for Similar Products
import ProductCard from '../components/ProductCard';
import OptimizedImage from '../components/OptimizedImage';
import { collection, query, where, limit, getDocs } from 'firebase/firestore/lite';

const SimilarProducts = memo(({ currentProduct }) => {
    const [similar, setSimilar] = useState([]);

    const fetchSimilar = useCallback(async () => {
        try {
            const q = query(
                collection(db, "laptops"),
                where("brand", "==", currentProduct.brand),
                limit(4)
            );
            const snap = await getDocs(q);
            const items = snap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(p => p.id !== currentProduct.id)
                .slice(0, 3); // Take top 3

            setSimilar(items);
        } catch (err) {
            console.error("Error fetching similar:", err);
        }
    }, [currentProduct.brand, currentProduct.id]);

    useEffect(() => {
        fetchSimilar();
    }, [fetchSimilar]);

    if (similar.length === 0) return null;

    return (
        <div className="similar-products-section" style={{ marginTop: '4rem', paddingBottom: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>You Might Also Like</h3>
            <div className="shop-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                {similar.map(p => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
});

SimilarProducts.displayName = 'SimilarProducts';

// Sub-component for Recently Viewed Products
const RecentlyViewedSection = memo(({ currentProductId }) => {
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            try {
                const viewedIds = getRecentlyViewed()
                    .filter(id => id !== currentProductId)
                    .slice(0, 4);

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

                setRecentProducts(products.filter(Boolean));
            } catch (err) {
                console.error("Error fetching recently viewed:", err);
            }
        };

        fetchRecentlyViewed();
    }, [currentProductId]);

    if (recentProducts.length === 0) return null;

    return (
        <div className="recently-viewed-section" style={{ marginTop: '3rem', paddingBottom: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recently Viewed</h3>
            <div className="recently-viewed-scroll" style={{
                display: 'flex',
                gap: '1.5rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch'
            }}>
                {recentProducts.map(p => (
                    <div key={p.id} style={{ flex: '0 0 280px', scrollSnapAlign: 'start' }}>
                        <ProductCard product={p} />
                    </div>
                ))}
            </div>
        </div>
    );
});

RecentlyViewedSection.displayName = 'RecentlyViewedSection';

const ProductDetails = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { success } = useToast();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configurator State
    const [upgradeRam, setUpgradeRam] = useState(false);
    const [upgradeStorage, setUpgradeStorage] = useState(false);

    // Static Prices for Upgrades
    const RAM_UPGRADE_PRICE = 1500; // +16GB
    const STORAGE_UPGRADE_PRICE = 2000; // +1TB

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const docRef = doc(db, "laptops", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setProduct({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setProduct(null);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (product) {
            trackViewItem(product);
            addRecentlyViewed(product.id);
        }
    }, [product]);

    if (loading) {
        return (
            <div className="page-container container">
                <div className="product-layout">
                    <Skeleton type="rect" height="400px" style={{ borderRadius: '16px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Skeleton type="text" width="60%" height="2rem" />
                        <Skeleton type="text" width="40%" height="1.5rem" />
                        <Skeleton type="rect" height="100px" />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <Skeleton type="rect" height="80px" />
                            <Skeleton type="rect" height="80px" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container page-container product-not-found">
                <h2>Product Not Found</h2>
                <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
            </div>
        );
    }

    const currentPrice = product.price + (upgradeRam ? RAM_UPGRADE_PRICE : 0) + (upgradeStorage ? STORAGE_UPGRADE_PRICE : 0);

    const handleWhatsAppOrder = () => {
        const ownerNumber = "201040663348";
        let message = `Hello, I am interested in purchasing:\n\n*${product.name}*\nBase Price: ${product.price.toLocaleString()} EGP\n`;

        if (upgradeRam || upgradeStorage) {
            message += `\n*Upgrades Requested:*`;
            if (upgradeRam) message += `\n- +16GB RAM (+${RAM_UPGRADE_PRICE} EGP)`;
            if (upgradeStorage) message += `\n- +1TB SSD (+${STORAGE_UPGRADE_PRICE} EGP)`;
            message += `\n`;
        }

        message += `\n*Total Request: ${currentPrice.toLocaleString()} EGP*\n\nIs it available?`;
        window.open(`https://wa.me/${ownerNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleAddToCart = () => {
        if ((product.stockCount ?? 50) <= 0) {
            error("Sorry, this item is out of stock!");
            return;
        }
        const itemToAdd = {
            ...product, // Start with product data
            price: currentPrice, // Use updated price
            selectedOptions: {
                ram: upgradeRam,
                storage: upgradeStorage
            },
            name: `${product.name} ${upgradeRam ? '(+RAM)' : ''} ${upgradeStorage ? '(+SSD)' : ''}`
        };
        addToCart(itemToAdd);
        trackAddToCart(itemToAdd);
        success(`Added ${product.brand} laptop to cart! 🛒`);
    };

    // Product structured data for SEO with AggregateRating
    const productStructuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": [product.image],
        "description": product.description || `${product.brand} ${product.name} with ${product.specs?.cpu}, ${product.specs?.ram}, ${product.specs?.gpu}`,
        "brand": {
            "@type": "Brand",
            "name": product.brand
        },
        "sku": product.id,
        "mpn": product.id,
        "category": "Laptops > Gaming Laptops",
        "offers": {
            "@type": "Offer",
            "url": `https://a-plus-laptops.vercel.app/product/${product.id}`,
            "priceCurrency": "EGP",
            "price": product.price,
            "priceValidUntil": "2025-12-31",
            "availability": "https://schema.org/InStock",
            "itemCondition": product.condition === "New" ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition",
            "seller": {
                "@type": "Organization",
                "name": "A Plus+ Laptops"
            }
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "24",
            "bestRating": "5",
            "worstRating": "1"
        }
    };

    // Breadcrumbs for navigation
    const breadcrumbs = [
        { name: "Home", url: "/" },
        { name: "Shop", url: "/shop" },
        { name: product.name, url: `/product/${product.id}` }
    ];

    return (
        <div className="product-details-page page-container container">
            <SEO
                title={product.name}
                description={`Buy ${product.brand} ${product.name} - ${product.specs?.cpu}, ${product.specs?.ram}, ${product.specs?.gpu}. Best price in Egypt with 6-month warranty.`}
                image={product.image}
                url={`/product/${product.id}`}
                type="product"
                keywords={`${product.brand}, ${product.name}, gaming laptop, buy laptop Egypt`}
                structuredData={productStructuredData}
                breadcrumbs={breadcrumbs}
            />
            <Link to="/shop" className="back-link">&larr; Back to Shop</Link>

            <div className="product-layout">
                <div className="product-gallery">
                    <div
                        className="main-image"
                        onMouseMove={(e) => {
                            const { left, top, width, height } = e.target.getBoundingClientRect();
                            const x = ((e.clientX - left) / width) * 100;
                            const y = ((e.clientY - top) / height) * 100;
                            e.target.style.setProperty('--zoom-x', `${x}%`);
                            e.target.style.setProperty('--zoom-y', `${y}%`);
                        }}
                    >
                        <OptimizedImage
                            src={product.image}
                            alt={`${product.brand} ${product.name} laptop`}
                            priority={true}
                            skeletonHeight="400px"
                        />
                        <span className="condition-badge">{product.condition || "Imported Business Class"}</span>
                    </div>
                </div>

                <div className="product-info-panel">
                    <div className="brand-header">
                        <span className="brand-name">{product.brand}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {(product.stockCount ?? 50) > 0 && (product.stockCount ?? 50) <= (product.lowStockThreshold ?? 5) && (
                                <span className="stock-status" style={{ background: '#fee2e2', color: '#991b1b' }}>Only {product.stockCount} Left!</span>
                            )}
                            {(product.stockCount ?? 50) === 0 ? (
                                <span className="stock-status" style={{ background: '#ef4444', color: 'white' }}>Out of Stock</span>
                            ) : (
                                <span className="stock-status in-stock">In Stock</span>
                            )}
                        </div>
                    </div>

                    <h1>{product.name}</h1>

                    <div className="product-rating-large" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: '1.2rem' }}>★</span>)}
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>(24 Reviews)</span>
                    </div>

                    <div className="price-box">
                        {currentPrice.toLocaleString()} EGP
                        <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 'normal', display: 'block', marginTop: '0.5rem' }}>
                            Make 3 monthly payments of checked {(currentPrice / 3).toLocaleString()} EGP
                        </span>
                    </div>

                    {/* CONFIGURATOR */}
                    <div className="configurator-box" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#334155' }}>Customize Your Build 🛠️</h3>

                        <label className="config-option" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    id="upgrade-ram"
                                    checked={upgradeRam}
                                    onChange={() => setUpgradeRam(!upgradeRam)}
                                    style={{ transform: 'scale(1.2)' }}
                                    aria-describedby="ram-price"
                                />
                                <span>Upgrade RAM (+16GB)</span>
                            </div>
                            <span id="ram-price" style={{ fontWeight: 'bold', color: '#2563eb' }}>+{RAM_UPGRADE_PRICE} EGP</span>
                        </label>

                        <label className="config-option" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    id="upgrade-storage"
                                    checked={upgradeStorage}
                                    onChange={() => setUpgradeStorage(!upgradeStorage)}
                                    style={{ transform: 'scale(1.2)' }}
                                    aria-describedby="storage-price"
                                />
                                <span>Add 1TB SSD Storage</span>
                            </div>
                            <span id="storage-price" style={{ fontWeight: 'bold', color: '#2563eb' }}>+{STORAGE_UPGRADE_PRICE} EGP</span>
                        </label>
                    </div>

                    {/* SMART BUNDLES */}
                    <div className="bundles-box" style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fcd34d', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#92400e' }}>🔥 Smart Bundle Deal</h3>
                        <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Get a <strong>Professional Bag + Wireless Mouse</strong> with this laptop.</p>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div className="bundle-items" style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ background: 'white', padding: '5px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>🎒 Bag</div>
                                <div style={{ background: 'white', padding: '5px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>🖱️ Mouse</div>
                            </div>
                            <div className="bundle-price">
                                <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: '5px' }}>800 EGP</span>
                                <span style={{ fontWeight: 'bold', color: '#d97706' }}>Only +300 EGP</span>
                            </div>
                        </div>
                        <button className="btn btn-sm btn-outline" style={{ marginTop: '10px', width: '100%', borderColor: '#d97706', color: '#d97706' }}>Add Bundle to Offer</button>
                    </div>

                    <div className="specs-grid">
                        <div className="spec-card">
                            <span className="spec-icon">🧠</span>
                            <span className="spec-label">Processor</span>
                            <span className="spec-value">{product.specs.cpu}</span>
                        </div>
                        <div className="spec-card">
                            <span className="spec-icon">🎮</span>
                            <span className="spec-label">Graphics</span>
                            <span className="spec-value">{product.specs.gpu}</span>
                        </div>
                        <div className="spec-card">
                            <span className="spec-icon">💾</span>
                            <span className="spec-label">Memory</span>
                            <span className="spec-value">{product.specs.ram} {upgradeRam && '(+16GB)'}</span>
                        </div>
                        <div className="spec-card">
                            <span className="spec-icon">💿</span>
                            <span className="spec-label">Storage</span>
                            <span className="spec-value">{product.specs.storage} {upgradeStorage && '(+1TB)'}</span>
                        </div>
                        <div className="spec-card">
                            <span className="spec-icon">📺</span>
                            <span className="spec-label">Screen</span>
                            <span className="spec-value">{product.specs.screen}</span>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button
                            onClick={handleAddToCart}
                            disabled={(product.stockCount ?? 50) === 0}
                            className="btn btn-primary btn-lg"
                            style={{ opacity: (product.stockCount ?? 50) === 0 ? 0.5 : 1, cursor: (product.stockCount ?? 50) === 0 ? 'not-allowed' : 'pointer' }}
                            aria-label={`Add ${product.name} to cart for ${currentPrice.toLocaleString()} EGP`}>
                            {(product.stockCount ?? 50) === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button
                            onClick={handleWhatsAppOrder}
                            disabled={(product.stockCount ?? 50) === 0}
                            className="btn btn-whatsapp btn-lg"
                            style={{ backgroundColor: '#25D366', color: 'white', border: 'none', opacity: (product.stockCount ?? 50) === 0 ? 0.5 : 1, cursor: (product.stockCount ?? 50) === 0 ? 'not-allowed' : 'pointer' }}
                            aria-label="Order this laptop via WhatsApp"
                        >
                            <span style={{ marginRight: '8px' }}>Order via WhatsApp</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        </button>
                    </div>

                    {/* FEATURE HIGHLIGHTS (New for High-Fi) */}
                    <div className="feature-highlights" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem', marginTop: '1rem' }}>
                        <div style={{ textAlign: 'center', padding: '10px', background: '#f0f9ff', borderRadius: '8px' }}>
                            <span style={{ fontSize: '1.5rem' }}>🚀</span>
                            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', margin: '5px 0 0', color: '#0369a1' }}>Fast CPU</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px', background: '#fdf4ff', borderRadius: '8px' }}>
                            <span style={{ fontSize: '1.5rem' }}>🎮</span>
                            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', margin: '5px 0 0', color: '#a21caf' }}>RTX Ready</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px', background: '#ecfccb', borderRadius: '8px' }}>
                            <span style={{ fontSize: '1.5rem' }}>🔋</span>
                            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', margin: '5px 0 0', color: '#4d7c0f' }}>Long Life</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px', background: '#fff7ed', borderRadius: '8px' }}>
                            <span style={{ fontSize: '1.5rem' }}>❄️</span>
                            <p style={{ fontSize: '0.75rem', fontWeight: 'bold', margin: '5px 0 0', color: '#c2410c' }}>Cooling</p>
                        </div>
                    </div>

                    <div className="product-description-section" style={{ marginTop: '0', borderTop: 'none' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Why this laptop?</h3>
                        <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '1.5rem' }}>
                            {product.description || "Designed for the modern professional and gamer alike, this machine combines raw power with sophisticated design. Whether you are rendering 4K video or dominating the leaderboard, the thermal management system ensures you stay cool under pressure. The vivid display brings every detail to life."}
                        </p>
                        <ul className="benefits-list" style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.8rem' }}>
                            {['Top-tier Performance for AAA Games', 'Professional Color Accuracy for Creatives', 'Military-Grade Durability Standards', 'Optimized for Windows 11 Pro'].map((benefit, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#10b981' }}>✓</span> {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* SPECS & DETAILS BELOW */}
            <div className="policy-section-details">
                <div className="policy-item">🛡️ 6 Months Hardware Warranty</div>
                <div className="policy-item">↩️ 14 Days Return Policy</div>
            </div>

            <ReviewList productId={product.id} />

            {/* STICKY ACTION BAR (Mobile Only) */}
            <div className="sticky-action-bar">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Price</span>
                    <span className="sticky-price">{currentPrice.toLocaleString()} EGP</span>
                </div>
                <button onClick={handleAddToCart} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }} aria-label="Add to cart">Add to Cart</button>
            </div>

            <SimilarProducts currentProduct={product} />
            <RecentlyViewedSection currentProductId={product.id} />
        </div>
    );
};

export default ProductDetails;
