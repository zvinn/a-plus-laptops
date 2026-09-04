import { useState, useEffect, createContext, useContext } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useSearchParams } from 'react-router-dom';
import {
    XMarkIcon,
    TrophyIcon,
    ScaleIcon,
    ShareIcon,
    BookmarkIcon,
    ShoppingCartIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import { TrophyIcon as TrophySolid } from '@heroicons/react/24/solid';
import HeroSearch from './HeroSearch';
import ComparisonBattle from './ComparisonBattle';
import OptimizedImage from './OptimizedImage';
import './LaptopComparison.css';

// Context for comparison
const ComparisonContext = createContext();

export const useComparison = () => useContext(ComparisonContext);

export const ComparisonProvider = ({ children }) => {
    const [compareList, setCompareList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const addToCompare = (laptop) => {
        if (compareList.length >= 3) return false;
        if (compareList.find(l => l.id === laptop.id)) return false;
        setCompareList(prev => [...prev, laptop]);
        return true;
    };

    const removeFromCompare = (id) => {
        setCompareList(prev => prev.filter(l => l.id !== id));
    };

    const clearCompare = () => setCompareList([]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <ComparisonContext.Provider value={{
            compareList,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isModalOpen,
            openModal,
            closeModal
        }}>
            {children}
            {isModalOpen && <ComparisonModal />}
        </ComparisonContext.Provider>
    );
};

// Full-Screen Modal Component
const ComparisonModal = () => {
    const { compareList, removeFromCompare, closeModal } = useComparison();
    const { t } = useLanguage();
    const { success, info } = useToast();
    const [allLaptops, setAllLaptops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLaptops = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "laptops"));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    performance: {
                        gaming: doc.data().performance?.gaming || 50,
                        workstation: doc.data().performance?.workstation || 50,
                        battery: doc.data().performance?.battery || 50
                    }
                }));
                setAllLaptops(data);
            } catch (error) {
                console.error("Error fetching laptops:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLaptops();
    }, []);

    // Block scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const handleSave = () => {
        if (compareList.length < 2) {
            info(t('comparison.minTwo'));
            return;
        }
        const comparisonData = {
            id: Date.now(),
            date: new Date().toISOString(),
            laptops: compareList.map(l => ({ id: l.id, name: l.name, brand: l.brand }))
        };
        const existing = JSON.parse(localStorage.getItem('savedComparisons') || '[]');
        localStorage.setItem('savedComparisons', JSON.stringify([comparisonData, ...existing]));
        success(t('comparison.saved'));
    };

    const handleShare = () => {
        const ids = compareList.map(l => l.id).join(',');
        const url = `${window.location.origin}/?compare=${ids}`;
        navigator.clipboard.writeText(url);
        success(t('comparison.linkCopied'));
    };

    const addLaptop = (laptop) => {
        if (compareList.length >= 3) return;
        if (compareList.find(l => l.id === laptop.id)) return;
        // Directly update via context would need adjustment, using local state here
    };

    // Calculate winner for each category
    const getWinner = (key) => {
        if (compareList.length < 2) return null;
        const maxVal = Math.max(...compareList.map(l => l.performance?.[key] || 0));
        return compareList.find(l => l.performance?.[key] === maxVal)?.id;
    };

    const getOverallWinner = () => {
        if (compareList.length < 2) return null;
        const scores = compareList.map(l => ({
            id: l.id,
            score: (l.performance?.gaming || 0) + (l.performance?.workstation || 0) + (l.performance?.battery || 0)
        }));
        const max = Math.max(...scores.map(s => s.score));
        return scores.find(s => s.score === max)?.id;
    };

    const overallWinner = getOverallWinner();

    return (
        <div className="comparison-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="comparison-modal-title">
            <div className="comparison-modal">
                {/* Header */}
                <header className="comparison-modal-header">
                    <div className="header-left">
                        <ScaleIcon className="header-icon" />
                        <h2>{t('comparison.title')}</h2>
                        <span className="compare-count">{compareList.length}/3</span>
                    </div>
                    <div className="header-actions">
                        {compareList.length >= 2 && (
                            <>
                                <button className="action-btn" onClick={handleShare} aria-label="Share comparison">
                                    <ShareIcon />
                                    <span>{t('comparison.share')}</span>
                                </button>
                                <button className="action-btn" onClick={handleSave} aria-label="Save comparison">
                                    <BookmarkIcon />
                                    <span>{t('comparison.save')}</span>
                                </button>
                            </>
                        )}
                        <button className="close-btn" onClick={closeModal} aria-label="Close comparison modal">
                            <XMarkIcon />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="comparison-modal-content">
                    {/* Laptop Cards */}
                    <section className="laptops-section">
                        <div className="laptops-compare-grid">
                            {compareList.map((laptop, idx) => (
                                <div
                                    key={laptop.id}
                                    className={`compare-laptop-card ${overallWinner === laptop.id ? 'winner' : ''}`}
                                >
                                    {overallWinner === laptop.id && (
                                        <div className="winner-badge">
                                            <TrophySolid className="trophy-icon" />
                                            <span>{t('comparison.winner')}</span>
                                        </div>
                                    )}
                                    <button
                                        className="remove-laptop-btn"
                                        onClick={() => removeFromCompare(laptop.id)}
                                        aria-label={`Remove ${laptop.name} from comparison`}
                                    >
                                        <XMarkIcon />
                                    </button>
                                    <div className="laptop-image-wrapper">
                                        <OptimizedImage
                                            src={laptop.image}
                                            alt={laptop.name}
                                            skeletonHeight="200px"
                                        />
                                    </div>
                                    <div className="laptop-info">
                                        <span className="laptop-brand">{laptop.brand}</span>
                                        <h3 className="laptop-name">{laptop.name}</h3>
                                        <div className="laptop-price">
                                            {laptop.price?.toLocaleString()} {t('common.currency')}
                                        </div>
                                    </div>
                                    <button className="add-cart-btn" aria-label={`Add ${laptop.name} to cart`}>
                                        <ShoppingCartIcon />
                                        <span>{t('product.addToCart')}</span>
                                    </button>

                                    {/* VS Badge */}
                                    {idx < compareList.length - 1 && (
                                        <div className="vs-badge">VS</div>
                                    )}
                                </div>
                            ))}

                            {/* Add Laptop Slot */}
                            {compareList.length < 3 && (
                                <div className="add-laptop-slot">
                                    <div className="add-laptop-content">
                                        <PlusIcon className="add-icon" />
                                        <span>{t('comparison.addLaptop')}</span>
                                        <div className="mini-search">
                                            <HeroSearch onSelectLaptop={addLaptop} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Performance Charts */}
                    {compareList.length >= 2 && (
                        <section className="performance-section">
                            <h3 className="section-title">
                                <TrophyIcon className="section-icon" />
                                {t('comparison.performance')}
                            </h3>

                            <div className="battle-wrapper">
                                <ComparisonBattle laptops={compareList} />
                            </div>
                        </section>
                    )}

                    {/* Specs Table */}
                    {compareList.length >= 2 && (
                        <section className="specs-section">
                            <h3 className="section-title">{t('comparison.specs')}</h3>
                            <div className="specs-table">
                                {['cpu', 'gpu', 'ram', 'storage', 'screen'].map(specKey => (
                                    <div key={specKey} className="spec-row">
                                        <div className="spec-label">{t(`product.${specKey === 'cpu' ? 'processor' : specKey}`)}</div>
                                        <div className="spec-values">
                                            {compareList.map(laptop => (
                                                <div key={laptop.id} className="spec-value">
                                                    {laptop.specs?.[specKey] || '-'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

// Legacy export for backward compatibility
const LaptopComparison = () => {
    const [allLaptops, setAllLaptops] = useState([]);
    const [selectedLaptops, setSelectedLaptops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
    const { t } = useLanguage();
    const { success, info } = useToast();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchLaptops = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "laptops"));
                const data = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    performance: {
                        gaming: doc.data().performance?.gaming || 50,
                        workstation: doc.data().performance?.workstation || 50,
                        battery: doc.data().performance?.battery || 50
                    }
                }));
                setAllLaptops(data);

                // Set initial selection
                const compareId = searchParams.get('compare');
                if (compareId) {
                    const ids = compareId.split(',');
                    const selected = data.filter(l => ids.includes(l.id.toString()));
                    setSelectedLaptops(selected.slice(0, 3));
                } else {
                    setSelectedLaptops(data.slice(0, 2));
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLaptops();
    }, [searchParams]);

    const addLaptop = (laptop) => {
        if (selectedLaptops.length >= 3) return;
        if (selectedLaptops.find(l => l.id === laptop.id)) return;
        setSelectedLaptops(prev => [...prev, laptop]);
    };

    const removeLaptop = (id) => {
        setSelectedLaptops(prev => prev.filter(l => l.id !== id));
    };

    const getWinner = (key) => {
        if (selectedLaptops.length < 2) return null;
        const maxVal = Math.max(...selectedLaptops.map(l => l.performance?.[key] || 0));
        return selectedLaptops.find(l => l.performance?.[key] === maxVal)?.id;
    };

    const getOverallWinner = () => {
        if (selectedLaptops.length < 2) return null;
        const scores = selectedLaptops.map(l => ({
            id: l.id,
            score: (l.performance?.gaming || 0) + (l.performance?.workstation || 0) + (l.performance?.battery || 0)
        }));
        const max = Math.max(...scores.map(s => s.score));
        return scores.find(s => s.score === max)?.id;
    };

    const handleSave = () => {
        if (selectedLaptops.length < 2) {
            info(t('comparison.minTwo'));
            return;
        }
        const comparisonData = {
            id: Date.now(),
            date: new Date().toISOString(),
            laptops: selectedLaptops.map(l => ({ id: l.id, name: l.name, brand: l.brand }))
        };
        const existing = JSON.parse(localStorage.getItem('savedComparisons') || '[]');
        localStorage.setItem('savedComparisons', JSON.stringify([comparisonData, ...existing]));
        success(t('comparison.saved'));
    };

    const handleShare = () => {
        const ids = selectedLaptops.map(l => l.id).join(',');
        const url = `${window.location.origin}/?compare=${ids}`;
        navigator.clipboard.writeText(url);
        success(t('comparison.linkCopied'));
    };

    if (loading) {
        return (
            <div className="comparison-loading">
                <div className="loading-spinner"></div>
                <p>{t('comparison.loading')}</p>
            </div>
        );
    }

    const overallWinner = getOverallWinner();

    return (
        <div className="comparison-container" id="compare">
            {/* Header */}
            <div className="comparison-header">
                <div className="header-content">
                    <div className="header-title">
                        <ScaleIcon className="header-icon" />
                        <h3>{t('comparison.title')}</h3>
                        <span className="compare-count">{selectedLaptops.length}/3</span>
                    </div>
                    <div className="header-actions">
                        {selectedLaptops.length >= 2 && (
                            <>
                                <button className="action-btn" onClick={handleShare} aria-label="Share comparison">
                                    <ShareIcon />
                                </button>
                                <button className="action-btn" onClick={handleSave} aria-label="Save comparison">
                                    <BookmarkIcon />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Laptop Cards Grid */}
            <div className="laptops-compare-grid">
                {selectedLaptops.map((laptop, idx) => (
                    <div
                        key={laptop.id}
                        className={`compare-laptop-card ${overallWinner === laptop.id ? 'winner' : ''}`}
                    >
                        {overallWinner === laptop.id && (
                            <div className="winner-badge">
                                <TrophySolid className="trophy-icon" />
                                <span>{t('comparison.winner')}</span>
                            </div>
                        )}
                        <button
                            className="remove-laptop-btn"
                            onClick={() => removeLaptop(laptop.id)}
                        >
                            <XMarkIcon />
                        </button>
                        <div className="laptop-image-wrapper">
                            <OptimizedImage
                                src={laptop.image}
                                alt={laptop.name}
                                skeletonHeight="200px"
                            />
                        </div>
                        <div className="laptop-info">
                            <span className="laptop-brand">{laptop.brand}</span>
                            <h3 className="laptop-name">{laptop.name}</h3>
                            <div className="laptop-price">
                                {laptop.price?.toLocaleString()} {t('common.currency')}
                            </div>
                        </div>

                        {/* VS Badge */}
                        {idx < selectedLaptops.length - 1 && (
                            <div className="vs-badge">VS</div>
                        )}
                    </div>
                ))}

                {/* Add Slot */}
                {selectedLaptops.length < 3 && (
                    <div className="add-laptop-slot">
                        <div className="add-laptop-content">
                            <PlusIcon className="add-icon" />
                            <span>{t('comparison.addLaptop')}</span>
                            <div className="mini-search">
                                <HeroSearch onSelectLaptop={addLaptop} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Performance Section */}
            {selectedLaptops.length >= 2 && (
                <div className="performance-section">
                    <h4 className="section-title">
                        <TrophyIcon className="section-icon" />
                        {t('comparison.performance')}
                    </h4>

                    <div className="battle-wrapper">
                        <ComparisonBattle laptops={selectedLaptops} />
                    </div>
                </div>
            )}

            {/* Specs Table */}
            {selectedLaptops.length >= 2 && (
                <div className="specs-section">
                    <div className="specs-header">
                        <h4 className="section-title">{t('comparison.specs')}</h4>
                        <button
                            className={`highlight-btn ${showOnlyDifferences ? 'active' : ''}`}
                            onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
                        >
                            <span className="highlight-icon">✨</span>
                            {showOnlyDifferences
                                ? (t('comparison.showAll') || 'Show All')
                                : (t('comparison.highlightDiff') || 'Highlight Differences')}
                        </button>
                    </div>
                    <div className="specs-table">
                        {['cpu', 'gpu', 'ram', 'storage', 'screen'].map(specKey => {
                            const values = selectedLaptops.map(l => l.specs?.[specKey] || '-');
                            const allSame = values.every(v => v === values[0]);

                            // Skip if showing only differences and all are same
                            if (showOnlyDifferences && allSame) return null;

                            return (
                                <div
                                    key={specKey}
                                    className={`spec-row ${allSame ? 'same' : 'different'}`}
                                >
                                    <div className="spec-label">
                                        {t(`product.${specKey === 'cpu' ? 'processor' : specKey}`)}
                                        {!allSame && <span className="diff-indicator">⚡</span>}
                                    </div>
                                    <div className="spec-values">
                                        {selectedLaptops.map((laptop, idx) => {
                                            const value = laptop.specs?.[specKey] || '-';
                                            // Simple heuristic for "better" - higher numbers often better
                                            const isWinner = !allSame && idx === 0; // Simplified for demo
                                            return (
                                                <div
                                                    key={laptop.id}
                                                    className={`spec-value ${!allSame ? 'highlight' : ''} ${isWinner ? 'winner' : ''}`}
                                                >
                                                    {value}
                                                    {isWinner && <span className="winner-star">⭐</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LaptopComparison;
