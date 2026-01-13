import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore/lite';
import Skeleton from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import './Shop.css';

const Shop = () => {
    const { t } = useLanguage();
    const [laptops, setLaptops] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(''); // Debounced value for filtering
    const [selectedBrand, setSelectedBrand] = useState('All');
    const [selectedCpu, setSelectedCpu] = useState('All');
    const [selectedRam, setSelectedRam] = useState('All');
    const [selectedUse, setSelectedUse] = useState('All');
    const [priceRange, setPriceRange] = useState(100000);

    const [showFilters, setShowFilters] = useState(false);
    const debounceRef = useRef(null);

    const [sortBy, setSortBy] = useState(() => {
        try {
            return localStorage.getItem('shopSortBy') || 'newest';
        } catch (e) {
            return 'newest';
        }
    });

    // Debounce search input (300ms delay)
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchQuery]);

    // Save sort preference
    useEffect(() => {
        try {
            localStorage.setItem('shopSortBy', sortBy);
        } catch (e) { }
    }, [sortBy]);

    useEffect(() => {
        const fetchLaptops = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "laptops"));
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLaptops(items);
            } catch (error) {
                console.error("Error fetching laptops:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLaptops();
    }, []);

    // Memoized filter options arrays
    const brands = useMemo(() => ['All', ...new Set(laptops.map(l => l.brand))], [laptops]);
    const cpus = useMemo(() => ['All', ...new Set(laptops.map(l => l.specs?.cpu).filter(Boolean))], [laptops]);
    const rams = useMemo(() => ['All', ...new Set(laptops.map(l => l.specs?.ram).filter(Boolean))], [laptops]);

    // Derived Suitability Options
    const uses = useMemo(() => ['All', ...new Set(laptops.flatMap(l => l.suitability || []))], [laptops]);

    const filteredLaptops = useMemo(() => {
        let result = laptops.filter(laptop => {
            const matchBrand = selectedBrand === 'All' || laptop.brand === selectedBrand;

            // Search Logic (uses debounced value for performance)
            const matchSearch = laptop.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                (laptop.specs?.cpu && laptop.specs.cpu.toLowerCase().includes(debouncedSearch.toLowerCase()));

            // Loose matching for specs to handle variations like "Core i7" vs "i7"
            const matchCpu = selectedCpu === 'All' || (laptop.specs?.cpu && laptop.specs.cpu.includes(selectedCpu));
            const matchRam = selectedRam === 'All' || (laptop.specs?.ram && laptop.specs.ram.includes(selectedRam));
            const matchPrice = laptop.price <= priceRange;

            // Suitability Match
            const matchUse = selectedUse === 'All' || (laptop.suitability && laptop.suitability.includes(selectedUse));

            return matchBrand && matchSearch && matchCpu && matchRam && matchPrice && matchUse;
        });

        // Apply Sorting
        return result.sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'az') return a.name.localeCompare(b.name);
            // Default 'newest' - currently assuming original order is newest or random. 
            // If we had a date field, we'd use it here. For now, we keep original index implicitly by not sorting? 
            // Or if we want to be strict and the original array is chronological, we return 0.
            return 0;
        });
    }, [laptops, selectedBrand, selectedCpu, selectedRam, priceRange, selectedUse, debouncedSearch, sortBy]);

    if (loading) {
        return (
            <div className="shop-page page-container container">
                <h1 className="shop-title">Our Collection</h1>
                <div style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
                    <Skeleton type="rect" height="50px" style={{ borderRadius: '50px' }} />
                </div>
                <div className="shop-layout">
                    <div className="shop-sidebar">
                        <Skeleton type="rect" height="300px" />
                    </div>
                    <div className="shop-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} style={{ background: 'white', borderRadius: '16px', padding: '1rem', height: '400px' }}>
                                <Skeleton type="rect" height="200px" style={{ marginBottom: '1rem' }} />
                                <Skeleton type="text" width="80%" />
                                <Skeleton type="text" width="40%" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="shop-page page-container container">
            <SEO
                title="Shop Gaming Laptops"
                description="Browse our collection of high-performance gaming laptops from ASUS, Lenovo, MSI, HP, Dell, and Apple. Best prices in Egypt with warranty."
                url="/shop"
                keywords="gaming laptops, ASUS ROG, Lenovo Legion, MSI, HP Victus, buy laptop Egypt"
            />
            <h1 className="shop-title">{t('shop.title')}</h1>

            {/* HERO SEARCH */}
            <div className="shop-search-wrapper" role="search">
                <div className="search-input-container">
                    <span className="search-icon" aria-hidden="true">🔍</span>
                    <label htmlFor="shop-search" className="visually-hidden">Search laptops</label>
                    <input
                        id="shop-search"
                        type="text"
                        className="shop-search-input"
                        placeholder={t('shop.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search laptops by name or specifications"
                    />

                    {/* Live Search Results Dropdown */}
                    {searchQuery.length > 1 && (
                        <div className="search-dropdown">
                            {filteredLaptops.slice(0, 5).map(laptop => (
                                <div
                                    key={laptop.id}
                                    className="search-result-item"
                                    onClick={() => setSearchQuery(laptop.name)}
                                >
                                    <OptimizedImage
                                        src={laptop.image}
                                        alt={laptop.name}
                                        className="search-result-img"
                                        skeletonHeight="60px"
                                    />
                                    <div className="search-result-info">
                                        <div className="search-result-name">{laptop.name}</div>
                                        <div className="search-result-price">{laptop.price.toLocaleString()} {t('common.currency')}</div>
                                    </div>
                                </div>
                            ))}
                            {filteredLaptops.length === 0 && (
                                <div className="search-no-results">
                                    {t('shop.noResults').replace('filters', `"${searchQuery}"`)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Filter Toggle & Sort Header */}
            <div className="shop-controls">
                <button
                    className="mobile-filter-toggle"
                    onClick={() => setShowFilters(!showFilters)}
                    aria-expanded={showFilters}
                    aria-controls="shop-filters"
                    aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                >
                    {showFilters ? t('shop.filters.hide') : t('shop.filters.show')}
                </button>

                <div className="sort-dropdown-container">
                    <label htmlFor="sort-select" className="sort-label">{t('shop.sortBy', 'Sort by:')}</label>
                    <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
                        <option value="newest">{t('shop.sort.newest', 'Newest')}</option>
                        <option value="price-low">{t('shop.sort.priceLow', 'Price: Low to High')}</option>
                        <option value="price-high">{t('shop.sort.priceHigh', 'Price: High to Low')}</option>
                        <option value="az">{t('shop.sort.az', 'Name: A-Z')}</option>
                    </select>
                </div>
            </div>

            <div className="shop-layout">
                {/* Sidebar Filters */}
                <aside id="shop-filters" className={`shop-sidebar ${showFilters ? 'active' : ''}`} role="complementary" aria-label="Product filters">
                    <div className="filter-group">
                        <h3 id="software-filter-label">{t('shop.filters.software')}</h3>
                        <select
                            value={selectedUse}
                            onChange={(e) => setSelectedUse(e.target.value)}
                            className="filter-select"
                            style={{ borderColor: '#25D366' }}
                            aria-labelledby="software-filter-label"
                        >
                            <option value="All">{t('shop.filters.softwarePlaceholder')}</option>
                            {uses.filter(u => u !== 'All').map(use => (
                                <option key={use} value={use}>{use}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <h3>{t('shop.filters.brand')}</h3>
                        <div className="filter-options">
                            {brands.map(brand => (
                                <label key={brand} className="filter-option">
                                    <input
                                        type="radio"
                                        name="brand"
                                        checked={selectedBrand === brand}
                                        onChange={() => setSelectedBrand(brand)}
                                    />
                                    {brand}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3>{t('shop.filters.processor')}</h3>
                        <select value={selectedCpu} onChange={(e) => setSelectedCpu(e.target.value)} className="filter-select">
                            {cpus.map(cpu => (
                                <option key={cpu} value={cpu}>{cpu}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <h3>{t('shop.filters.ram')}</h3>
                        <select value={selectedRam} onChange={(e) => setSelectedRam(e.target.value)} className="filter-select">
                            {rams.map(ram => (
                                <option key={ram} value={ram}>{ram}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <h3>{t('shop.filters.price')}: {priceRange.toLocaleString()} {t('common.currency')}</h3>
                        <input
                            type="range"
                            min="5000"
                            max="150000"
                            step="1000"
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            className="price-slider"
                        />
                    </div>

                    {/* Mobile Close Button */}
                    <button className="mobile-filter-close" onClick={() => setShowFilters(false)}>{t('shop.filters.done')}</button>
                </aside>

                {/* Product Grid */}
                <main className="shop-grid">
                    {filteredLaptops.length > 0 ? (
                        filteredLaptops.map(laptop => (
                            <ProductCard key={laptop.id} product={laptop} />
                        ))
                    ) : (
                        <div className="no-results">{t('shop.noResults')}</div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Shop;
