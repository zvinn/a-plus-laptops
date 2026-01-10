import { useState, useEffect } from 'react';
import { initGA } from '../utils/analytics';
import './CookieConsent.css';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        try {
            const consent = localStorage.getItem('cookieConsent');
            if (consent === null) {
                setIsVisible(true);
            }
        } catch (e) {
            // If localStorage is blocked, we might want to assume no consent or just hide banner to avoid annoyance
            // blocking it usually means strict privacy anyway.
            console.warn("localStorage access denied in CookieConsent");
        }
    }, []);

    const handleAccept = () => {
        try {
            localStorage.setItem('cookieConsent', 'true');
        } catch (e) { }
        setIsVisible(false);
        initGA('G-XXXXXXXXXX'); // Replace with actual ID
    };

    const handleDecline = () => {
        try {
            localStorage.setItem('cookieConsent', 'false');
        } catch (e) { }
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent-container">
            <div className="cookie-content">
                <p>
                    We use cookies to improve your experience and analyze site usage.
                    By clicking "Accept", you agree to our use of cookies.
                </p>
            </div>
            <div className="cookie-actions">
                <button onClick={handleDecline} className="cookie-btn decline">
                    Decline
                </button>
                <button onClick={handleAccept} className="cookie-btn accept">
                    Accept
                </button>
            </div>
        </div>
    );
};

export default CookieConsent;
