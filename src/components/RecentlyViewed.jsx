import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../firebase';
import { getRecentlyViewed } from '../utils/recentlyViewed';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';
import Skeleton from './Skeleton';
import './RecentlyViewed.css';

const RecentlyViewed = ({ excludeProductId }) => {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentProducts = async () => {
            try {
                let viewedIds = getRecentlyViewed();

                // Exclude current product if provided
                if (excludeProductId) {
                    viewedIds = viewedIds.filter(id => id !== excludeProductId);
                }

                // Take only first 4
                viewedIds = viewedIds.slice(0, 4);

                if (viewedIds.length === 0) {
                    setLoading(false);
                    return;
                }

                // Fetch products by IDs
                const q = query(
                    collection(db, "laptops"),
                    where(documentId(), 'in', viewedIds)
                );
                const snapshot = await getDocs(q);

                // Map and sort by original order
                const fetchedProducts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort by viewedIds order
                const sorted = viewedIds
                    .map(id => fetchedProducts.find(p => p.id === id))
                    .filter(Boolean);

                setProducts(sorted);
            } catch (error) {
                console.error('Error fetching recently viewed:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentProducts();
    }, [excludeProductId]);

    // Don't render if no products
    if (!loading && products.length === 0) {
        return null;
    }

    return (
        <section className="recently-viewed-section">
            <div className="container">
                <div className="section-header">
                    <h2>{t('recentlyViewed.title') || '⏱️ Recently Viewed'}</h2>
                    <p>{t('recentlyViewed.subtitle') || 'Pick up where you left off'}</p>
                </div>

                <div className="recently-viewed-grid">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="product-card-skeleton">
                                <Skeleton type="rect" height="180px" />
                                <div style={{ padding: '1rem' }}>
                                    <Skeleton type="text" width="80%" />
                                    <Skeleton type="text" width="50%" />
                                </div>
                            </div>
                        ))
                    ) : (
                        products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
