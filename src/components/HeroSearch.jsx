import { useState, useEffect, useRef } from 'react';
import { laptops as localLaptops } from '../data/laptops';
import { useNavigate } from 'react-router-dom';
import { trackSearch } from '../utils/analytics';
import OptimizedImage from './OptimizedImage';
import './HeroSearch.css';

const HeroSearch = ({ onSelectLaptop }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [allLaptops, setAllLaptops] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const navigate = useNavigate();

    useEffect(() => {
        // Combine local seed data and potential firestore data
        // For now, we prioritze local data as it has our "Reference" models
        // In a real app, you'd fetch everything or index it
        const fetchLaptops = async () => {
            const laptops = [...localLaptops];
            // Optionally fetch more from Firestore if needed, but localLaptops 
            // is our source of truth for this demo.
            setAllLaptops(laptops);
        };
        fetchLaptops();

        // Click outside listener
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTerm.length < 1) {
            setSuggestions([]);
            return;
        }

        const filtered = allLaptops.filter(laptop =>
            laptop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            laptop.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (laptop.isReference && "reference".includes(searchTerm.toLowerCase()))
        );
        setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    }, [searchTerm, allLaptops]);

    const handleSelect = (laptop) => {
        setSearchTerm(laptop.name);
        setIsOpen(false);
        if (onSelectLaptop) {
            onSelectLaptop(laptop);
        } else {
            trackSearch(laptop.name);
            // Update URL to trigger comparison
            // We use navigate with replace or push. 
            navigate(`?compare=${laptop.id}`);

            setTimeout(() => {
                const compareSection = document.getElementById('compare');
                if (compareSection) {
                    compareSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    const handleKeyDown = (e) => {
        if (!isOpen || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[activeIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            setActiveIndex(-1);
        }
    };

    return (
        <div className="hero-search-wrapper" ref={wrapperRef} role="search">
            <div className="hero-search-input-box">
                <i className="search-icon" aria-hidden="true">🔍</i>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search any laptop (e.g. MacBook M1, Legion...)"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    aria-label="Search laptops"
                    aria-autocomplete="list"
                    aria-expanded={isOpen && suggestions.length > 0}
                    aria-controls="search-suggestions"
                    aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
                    role="combobox"
                />
                {searchTerm && (
                    <button
                        className="clear-btn"
                        onClick={() => {
                            setSearchTerm('');
                            setActiveIndex(-1);
                        }}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <ul
                    id="search-suggestions"
                    className="hero-search-dropdown"
                    role="listbox"
                    aria-label="Laptop suggestions"
                >
                    {suggestions.map((laptop, index) => (
                        <li
                            key={laptop.id}
                            id={`suggestion-${index}`}
                            className={`suggestion-item ${laptop.isReference ? 'is-reference' : ''} ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => handleSelect(laptop)}
                            role="option"
                            aria-selected={index === activeIndex}
                        >
                            <OptimizedImage
                                src={laptop.image}
                                alt={`${laptop.brand} ${laptop.name}`}
                                skeletonHeight="50px"
                            />
                            <div className="suggestion-info">
                                <span className="suggestion-name">
                                    {laptop.brand} {laptop.name}
                                    {laptop.isReference && <span className="ref-tag">Reference</span>}
                                </span>
                                <span className="suggestion-price">
                                    {laptop.isReference ? 'Not for Sale' : `${laptop.price.toLocaleString()} EGP`}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HeroSearch;
