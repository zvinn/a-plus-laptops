import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ProductCard from '../components/ProductCardPremium';
import { ProductCardSkeleton } from '../components/Skeleton';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Skeleton from '../components/Skeleton';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import './Shop.css';

const ITEMS_PER_PAGE = 12;

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
    const [selectedGpu, setSelectedGpu] = useState('All');
    const [selectedStorage, setSelectedStorage] = useState('All');
    const [selectedUse, setSelectedUse] = useState('All');
    const [priceRange, setPriceRange] = useState(100000);

    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const debounceRef = useRef(null);

    // Pagination / Load More state
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loadMoreRef = useRef(null);

    const [sortBy, setSortBy] = useState(() => {
        try {
            return localStorage.getItem('shopSortBy') || 'newest';
        } catch {
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
        } catch { }
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
    const gpus = useMemo(() => ['All', ...new Set(laptops.map(l => l.specs?.gpu).filter(Boolean))], [laptops]);
    const storages = useMemo(() => ['All', ...new Set(laptops.map(l => l.specs?.storage).filter(Boolean))], [laptops]);

    // Derived Suitability Options
    const uses = useMemo(() => ['All', ...new Set(laptops.flatMap(l => l.suitability || []))], [laptops]);

    // Active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (selectedBrand !== 'All') count++;
        if (selectedCpu !== 'All') count++;
        if (selectedRam !== 'All') count++;
        if (selectedGpu !== 'All') count++;
        if (selectedStorage !== 'All') count++;
        if (selectedUse !== 'All') count++;
        if (priceRange < 100000) count++;
        return count;
    }, [selectedBrand, selectedCpu, selectedRam, selectedGpu, selectedStorage, selectedUse, priceRange]);

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedBrand('All');
        setSelectedCpu('All');
        setSelectedRam('All');
        setSelectedGpu('All');
        setSelectedStorage('All');
        setSelectedUse('All');
        setPriceRange(100000);
        setSearchQuery('');
        setVisibleCount(ITEMS_PER_PAGE); // Reset pagination when clearing filters
    };

    // Reset visible count when filters change
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [selectedBrand, selectedCpu, selectedRam, selectedGpu, selectedStorage, selectedUse, priceRange, debouncedSearch, sortBy]);

    // filteredLaptops - MUST be defined before visibleLaptops that depends on it
    const filteredLaptops = useMemo(() => {
        let result = laptops.filter(laptop => {
            const matchBrand = selectedBrand === 'All' || laptop.brand === selectedBrand;

            // Search Logic (uses debounced value for performance)
            const matchSearch = laptop.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                (laptop.specs?.cpu && laptop.specs.cpu.toLowerCase().includes(debouncedSearch.toLowerCase()));

            // Loose matching for specs to handle variations like "Core i7" vs "i7"
            const matchCpu = selectedCpu === 'All' || (laptop.specs?.cpu && laptop.specs.cpu.includes(selectedCpu));
            const matchRam = selectedRam === 'All' || (laptop.specs?.ram && laptop.specs.ram.includes(selectedRam));
            const matchGpu = selectedGpu === 'All' || (laptop.specs?.gpu && laptop.specs.gpu.toLowerCase().includes(selectedGpu.toLowerCase()));
            const matchStorage = selectedStorage === 'All' || (laptop.specs?.storage && laptop.specs.storage.includes(selectedStorage));
            const matchPrice = laptop.price <= priceRange;

            // Suitability Match
            const matchUse = selectedUse === 'All' || (laptop.suitability && laptop.suitability.includes(selectedUse));

            return matchBrand && matchSearch && matchCpu && matchRam && matchGpu && matchStorage && matchPrice && matchUse;
        });

        // Apply Sorting
        return result.sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'az') return a.name.localeCompare(b.name);
            return 0;
        });
    }, [laptops, selectedBrand, selectedCpu, selectedRam, selectedGpu, selectedStorage, priceRange, selectedUse, debouncedSearch, sortBy]);

    // Load more handler
    const loadMore = useCallback(() => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);

        setTimeout(() => {
            setVisibleCount(prev => prev + ITEMS_PER_PAGE);
            setIsLoadingMore(false);
        }, 300);
    }, [isLoadingMore]);

    // Intersection Observer for automatic loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < filteredLaptops.length) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [loadMore, visibleCount, filteredLaptops.length]);

    // Calculate visible laptops (NOW AFTER filteredLaptops is defined)
    const visibleLaptops = useMemo(() => {
        return filteredLaptops.slice(0, visibleCount);
    }, [filteredLaptops, visibleCount]);

    const hasMore = visibleCount < filteredLaptops.length;

    if (loading) {
        return (
            <div className="shop-page page-container container">
                <h1 className="shop-title">Our Collection</h1>
                <div style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
                    <Skeleton type="rect" height="50px" animation="shimmer" style={{ borderRadius: '50px' }} />
                </div>
                <div className="shop-layout">
                    <div className="shop-sidebar">
                        <Skeleton type="rect" height="300px" animation="shimmer" />
                    </div>
                    <div className="shop-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <ProductCardSkeleton key={i} animation="shimmer" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="shop-page page-container container">
            <SEO
                title="Shop Laptops"
                description="Browse our collection of premium laptops from ASUS, Lenovo, MSI, HP, Dell, and Apple. Best prices in Egypt with warranty for professionals and students."
                url="/shop"
                keywords="laptops Egypt, business laptops, student laptops, workstation, buy laptop Egypt"
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
                <div className="shop-controls-left">
                    <button
                        className="mobile-filter-toggle"
                        onClick={() => setShowFilters(!showFilters)}
                        aria-expanded={showFilters}
                        aria-controls="shop-filters"
                        aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                    >
                        {showFilters ? t('shop.filters.hide') : t('shop.filters.show')}
                        {activeFiltersCount > 0 && (
                            <span className="filter-badge">{activeFiltersCount}</span>
                        )}
                    </button>
                    {activeFiltersCount > 0 && (
                        <button className="clear-filters-btn" onClick={clearAllFilters}>
                            ✕ Clear All
                        </button>
                    )}
                </div>

                <div className="shop-controls-right">
                    {/* View Mode Toggle */}
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid view"
                            title="Grid View"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            aria-label="List view"
                            title="List View"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="3" y="4" width="18" height="4" rx="1" />
                                <rect x="3" y="10" width="18" height="4" rx="1" />
                                <rect x="3" y="16" width="18" height="4" rx="1" />
                            </svg>
                        </button>
                    </div>

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

                {/* Results Count */}
                <div className="results-count">
                    {filteredLaptops.length} {filteredLaptops.length === 1 ? 'laptop' : 'laptops'} found
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

                    {/* GPU Filter */}
                    <div className="filter-group">
                        <h3>🎮 GPU</h3>
                        <select value={selectedGpu} onChange={(e) => setSelectedGpu(e.target.value)} className="filter-select">
                            {gpus.map(gpu => (
                                <option key={gpu} value={gpu}>{gpu}</option>
                            ))}
                        </select>
                    </div>

                    {/* Storage Filter */}
                    <div className="filter-group">
                        <h3>💾 Storage</h3>
                        <select value={selectedStorage} onChange={(e) => setSelectedStorage(e.target.value)} className="filter-select">
                            {storages.map(storage => (
                                <option key={storage} value={storage}>{storage}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mobile Close Button */}
                    <button className="mobile-filter-close" onClick={() => setShowFilters(false)}>{t('shop.filters.done')}</button>
                </aside>

                {/* Product Grid */}
                <main className={`shop-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                    {visibleLaptops.length > 0 ? (
                        <>
                            {visibleLaptops.map(laptop => (
                                <ProductCard key={laptop.id} product={laptop} />
                            ))}

                            {/* Load More Section */}
                            {hasMore && (
                                <div className="load-more-section" ref={loadMoreRef}>
                                    <button
                                        className="btn btn-secondary load-more-btn"
                                        onClick={loadMore}
                                        disabled={isLoadingMore}
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <span className="loading-spinner"></span>
                                                {t('common.loading', 'Loading...')}
                                            </>
                                        ) : (
                                            <>
                                                {t('shop.loadMore', 'Load More')}
                                                <span className="load-more-count">
                                                    ({visibleCount} / {filteredLaptops.length})
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Loading skeletons when loading more */}
                            {isLoadingMore && (
                                <div className="loading-more-grid">
                                    {[1, 2, 3, 4].map(i => (
                                        <ProductCardSkeleton key={`loading-${i}`} animation="pulse" />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-results">{t('shop.noResults')}</div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Shop;
