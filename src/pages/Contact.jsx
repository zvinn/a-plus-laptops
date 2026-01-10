import { useState, useCallback } from 'react';
import SEO from '../components/SEO';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import './Contact.css';

const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "A Plus+ Laptops",
    "description": "Premium gaming laptops and accessories store in Egypt",
    "url": "https://a-plus-laptops.vercel.app",
    "telephone": "+201040663348",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Nasr City",
        "addressLocality": "Cairo",
        "addressCountry": "EG"
    },
    "openingHours": "Su-Th 10:00-20:00",
    "priceRange": "$$"
};

const Contact = () => {
    const { success, error: toastError } = useToast();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Debounce utility
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = t('errors.required');
        } else if (formData.name.trim().length < 2) {
            newErrors.name = t('errors.nameMin');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('errors.required');
        } else if (!validateEmail(formData.email)) {
            newErrors.email = t('errors.emailInvalid');
        }

        if (!formData.message.trim()) {
            newErrors.message = t('errors.required');
        } else if (formData.message.trim().length < 10) {
            newErrors.message = t('errors.messageMin');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Debounced validation
    const debouncedValidation = useCallback(
        debounce((field, value) => {
            let error = null;

            if (field === 'name') {
                if (!value.trim()) error = t('errors.required');
                else if (value.trim().length < 2) error = t('errors.nameMin');
            } else if (field === 'email') {
                if (!value.trim()) error = t('errors.required');
                else if (!validateEmail(value)) error = t('errors.emailInvalid');
            } else if (field === 'message') {
                if (!value.trim()) error = t('errors.required');
                else if (value.trim().length < 10) error = t('errors.messageMin');
            }

            setErrors(prev => ({ ...prev, [field]: error }));
        }, 500),
        [t]
    );

    // Real-time validation on blur
    const handleBlur = (field) => {
        const value = formData[field];
        let error = null;

        if (field === 'name') {
            if (!value.trim()) error = t('errors.required');
            else if (value.trim().length < 2) error = t('errors.nameMin');
        } else if (field === 'email') {
            if (!value.trim()) error = t('errors.required');
            else if (!validateEmail(value)) error = t('errors.emailInvalid');
        } else if (field === 'message') {
            if (!value.trim()) error = t('errors.required');
            else if (value.trim().length < 10) error = t('errors.messageMin');
        }

        setErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Debounced validation if field has error
        if (errors[name]) {
            debouncedValidation(name, value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            // Simulate API call (replace with actual EmailJS or Firebase function)
            await new Promise(resolve => setTimeout(resolve, 1500));

            setShowSuccess(true);
            success(t('errors.successContact'));
            setFormData({ name: '', email: '', message: '' });
            setErrors({});

            // Reset to form after 3 seconds
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            toastError(t('errors.message') || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container container contact-page">
            <SEO
                title="Contact Us"
                description="Get in touch with A Plus+ Laptops. Visit our showroom in Nasr City, Cairo or contact us via WhatsApp for instant support."
                url="/contact"
                keywords="contact A Plus, laptop store Cairo, WhatsApp support, Nasr City"
                structuredData={localBusinessSchema}
            />
            <div className="contact-layout animate-on-scroll fade-in">

                {/* Left: Contact Info */}
                <aside className="contact-info-card">
                    <h2>Get in Touch</h2>

                    <div className="info-item">
                        <div className="info-icon">📍</div>
                        <div className="info-content">
                            <h4>Visit Our Showroom</h4>
                            <p>Nasr City, Cairo, Egypt<br />(By Appointment)</p>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon">📞</div>
                        <div className="info-content">
                            <h4>Call Us</h4>
                            <p>01040663348<br /><span style={{ fontSize: '0.9rem', color: '#64748b' }}>Sun-Thu, 10am - 8pm</span></p>
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon">💬</div>
                        <div className="info-content">
                            <h4>WhatsApp Support</h4>
                            <p>Instant replies for pricing & stock.</p>
                            <a href="https://wa.me/201040663348" style={{ color: '#25D366', fontWeight: 600 }}>Start Chat →</a>
                        </div>
                    </div>

                    {/* Google Map Embed */}
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.61185045434!2d31.18842358514131!3d30.059611343369845!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79df8294e8c238de!2sCairo%2C%20Cairo%20Governorate!5e0!3m2!1sen!2seg!4v1715000000000!5m2!1sen!2seg"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Location map"
                        ></iframe>
                    </div>
                </aside>

                {/* Right: Contact Form */}
                <main className="contact-form-glass">
                    {showSuccess ? (
                        <div className="success-state">
                            <div className="success-checkmark">
                                <svg viewBox="0 0 52 52">
                                    <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle" />
                                    <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
                                </svg>
                            </div>
                            <h3>Message Sent! 🎉</h3>
                            <p>We'll get back to you soon.</p>
                        </div>
                    ) : (
                        <>
                            <h2>Send a Message</h2>
                            <p style={{ marginBottom: '2rem', color: '#64748b' }}>Have a specific laptop in mind? Let us know specs.</p>

                            <form onSubmit={handleSubmit} noValidate>
                                <div className={`form-group floating-group ${errors.name ? 'has-error' : ''}`}>
                                    <input
                                        id="contact-name"
                                        type="text"
                                        name="name"
                                        placeholder=" "
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('name')}
                                        disabled={loading}
                                        aria-describedby={errors.name ? 'name-error' : undefined}
                                    />
                                    <label htmlFor="contact-name">Your Name</label>
                                    {errors.name && (
                                        <span id="name-error" className="field-error" role="alert">
                                            {errors.name}
                                        </span>
                                    )}
                                </div>

                                <div className={`form-group floating-group ${errors.email ? 'has-error' : ''}`}>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        name="email"
                                        placeholder=" "
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('email')}
                                        disabled={loading}
                                        aria-describedby={errors.email ? 'email-error' : undefined}
                                    />
                                    <label htmlFor="contact-email">Email Address</label>
                                    {errors.email && (
                                        <span id="email-error" className="field-error" role="alert">
                                            {errors.email}
                                        </span>
                                    )}
                                </div>

                                <div className={`form-group floating-group ${errors.message ? 'has-error' : ''}`}>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        rows="5"
                                        placeholder=" "
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        onBlur={() => handleBlur('message')}
                                        disabled={loading}
                                        aria-describedby={errors.message ? 'message-error' : undefined}
                                    ></textarea>
                                    <label htmlFor="contact-message">Message / Inquiry</label>
                                    {errors.message && (
                                        <span id="message-error" className="field-error" role="alert">
                                            {errors.message}
                                        </span>
                                    )}
                                </div>

                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? (
                                        <span className="btn-loading">
                                            <span className="spinner"></span>
                                            {t('errors.submitting') || 'Submitting...'}
                                        </span>
                                    ) : (
                                        <>Send Message ✈️</>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </main>

            </div>
        </div>
    );
};

export default Contact;
