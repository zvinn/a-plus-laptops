import { useState, useEffect } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/solid';
import './BackToTop.css';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 500) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) return null;

    return (
        <button
            className="back-to-top"
            onClick={scrollToTop}
            aria-label="Back to top"
        >
            <ChevronUpIcon />
        </button>
    );
};

export default BackToTop;
