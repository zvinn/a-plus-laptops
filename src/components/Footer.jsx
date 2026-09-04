import { useState } from 'react';
import './Footer.css';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import {
    ShieldCheck,
    MessageCircle,
    Truck,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

const Footer = () => {
    const { t } = useLanguage();
    const { success, error: toastError } = useToast();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (emailError) setEmailError('');
    };

    const handleEmailBlur = () => {
        if (email && !validateEmail(email)) {
            setEmailError(t('errors.emailInvalid') || 'Please enter a valid email');
        }
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setEmailError(t('errors.required') || 'This field is required');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError(t('errors.emailInvalid') || 'Please enter a valid email');
            return;
        }

        setLoading(true);
        setEmailError('');

        try {
            // Simulate API call (replace with actual implementation)
            await new Promise(resolve => setTimeout(resolve, 1000));
            success(t('errors.successSubscribe') || 'Subscribed successfully!');
            setEmail('');
        } catch (err) {
            toastError('Failed to subscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="footer">
            <div className="footer-glow"></div>

            <div className="container footer-content">
                {/* Brand & Mission */}
                <div className="footer-section brand-section">
                    <div className="footer-logo">
                        <span className="logo-icon">A+</span>
                        <span className="logo-text">Laptops</span>
                    </div>
                    <p className="footer-tagline">{t('footer.subtitle')}</p>

                    <div className="policy-badges">
                        <span className="policy-badge">
                            <ShieldCheck size={18} className="badge-icon" />
                            {t('features.warranty')}
                        </span>
                        <span className="policy-badge">
                            <MessageCircle size={18} className="badge-icon" />
                            {t('features.qualityService')}
                        </span>
                        <span className="policy-badge">
                            <Truck size={18} className="badge-icon" />
                            {t('features.shipping')}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <div className="footer-section links-section">
                    <h4>{t('footer.quickLinks')}</h4>
                    <ul className="footer-links">
                        <li><Link to="/">{t('nav.home')}</Link></li>
                        <li><Link to="/shop">{t('footer.shopCollection')}</Link></li>
                        <li><Link to="/about">{t('footer.ourStory')}</Link></li>
                        <li><Link to="/finder">{t('footer.laptopFinder')}</Link></li>
                    </ul>
                </div>

                {/* Newsletter & Contact */}
                <div className="footer-section newsletter-section">
                    <h4>{t('footer.stayUpdated')}</h4>
                    <p className="newsletter-desc">{t('footer.newsletterDesc')}</p>

                    <form
                        className="newsletter-form"
                        aria-label="Newsletter subscription"
                        onSubmit={handleSubscribe}
                        noValidate
                    >
                        <div className={`input-wrapper ${emailError ? 'has-error' : ''}`}>
                            <Mail size={20} className="input-icon" aria-hidden="true" />
                            <label htmlFor="newsletter-email" className="visually-hidden">Email address</label>
                            <input
                                id="newsletter-email"
                                type="email"
                                placeholder={t('footer.emailPlaceholder')}
                                aria-label="Enter your email for newsletter"
                                value={email}
                                onChange={handleEmailChange}
                                onBlur={handleEmailBlur}
                                disabled={loading}
                                aria-describedby={emailError ? 'newsletter-error' : undefined}
                            />
                        </div>
                        {emailError && (
                            <span id="newsletter-error" className="newsletter-error" role="alert">
                                {emailError}
                            </span>
                        )}
                        <button
                            type="submit"
                            className="btn btn-accent"
                            aria-label="Subscribe to newsletter"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="btn-loading">
                                    <span className="spinner-sm"></span>
                                </span>
                            ) : t('footer.subscribe')}
                        </button>
                    </form>

                    <address className="contact-info">
                        <p><Phone size={20} className="contact-icon" aria-hidden="true" /> <a href="tel:01040663348" aria-label="Call us at 01040663348">01040663348</a></p>
                        <p><MapPin size={20} className="contact-icon" aria-hidden="true" /> {t('footer.contact')}</p>
                    </address>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container footer-bottom-content">
                    <p>&copy; {new Date().getFullYear()} {t('common.rights')}</p>
                    <div className="social-links">
                        <a href="#" className="social-link" aria-label="Facebook">FB</a>
                        <a href="#" className="social-link" aria-label="Instagram">IG</a>
                        <a href="#" className="social-link" aria-label="LinkedIn">LI</a>
                    </div>
                </div>
            </div>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/201040663348"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-float"
                aria-label="Chat on WhatsApp"
            >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
            </a>
        </footer>
    );
};

export default Footer;
