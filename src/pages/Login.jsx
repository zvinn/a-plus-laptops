import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import './Login.css';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const { login, signup, resetPassword, googleSignIn } = useAuth();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { success, error: toastError } = useToast();

    // Password strength calculation
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { score: 0, label: '', color: '' };

        let score = 0;
        if (pwd.length >= 6) score += 1;
        if (pwd.length >= 8) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

        const levels = [
            { score: 0, label: '', color: '' },
            { score: 1, label: 'Weak', color: 'var(--error)' },
            { score: 2, label: 'Fair', color: '#f59e0b' },
            { score: 3, label: 'Good', color: '#eab308' },
            { score: 4, label: 'Strong', color: '#22c55e' },
            { score: 5, label: 'Very Strong', color: '#16a34a' }
        ];

        return levels[Math.min(score, 5)];
    };

    const passwordStrength = getPasswordStrength(password);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        return password.length >= 6;
    };

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = t('errors.required');
        } else if (!validateEmail(email)) {
            newErrors.email = t('errors.emailInvalid');
        }

        if (!password.trim()) {
            newErrors.password = t('errors.required');
        } else if (!validatePassword(password)) {
            newErrors.password = t('errors.passwordMin');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Debounced validation
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    const debouncedEmailValidation = useCallback(
        debounce((value) => {
            if (!value.trim()) {
                setErrors(prev => ({ ...prev, email: t('errors.required') }));
            } else if (!validateEmail(value)) {
                setErrors(prev => ({ ...prev, email: t('errors.emailInvalid') }));
            } else {
                setErrors(prev => ({ ...prev, email: null }));
            }
        }, 500),
        [t]
    );

    const debouncedPasswordValidation = useCallback(
        debounce((value) => {
            if (!value.trim()) {
                setErrors(prev => ({ ...prev, password: t('errors.required') }));
            } else if (!validatePassword(value)) {
                setErrors(prev => ({ ...prev, password: t('errors.passwordMin') }));
            } else {
                setErrors(prev => ({ ...prev, password: null }));
            }
        }, 500),
        [t]
    );

    // Handle input changes with debounced validation
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        if (errors.email) {
            debouncedEmailValidation(value);
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (errors.password) {
            debouncedPasswordValidation(value);
        }
    };

    // Real-time validation on blur
    const handleEmailBlur = () => {
        if (!email.trim()) {
            setErrors(prev => ({ ...prev, email: t('errors.required') }));
        } else if (!validateEmail(email)) {
            setErrors(prev => ({ ...prev, email: t('errors.emailInvalid') }));
        } else {
            setErrors(prev => ({ ...prev, email: null }));
        }
    };

    const handlePasswordBlur = () => {
        if (!password.trim()) {
            setErrors(prev => ({ ...prev, password: t('errors.required') }));
        } else if (!validatePassword(password)) {
            setErrors(prev => ({ ...prev, password: t('errors.passwordMin') }));
        } else {
            setErrors(prev => ({ ...prev, password: null }));
        }
    };

    // Parse Firebase error codes into user-friendly messages
    const getFirebaseErrorMessage = (errorCode) => {
        const errorMessages = {
            'auth/user-not-found': t('errors.loginFailed'),
            'auth/wrong-password': t('errors.loginFailed'),
            'auth/invalid-credential': t('errors.loginFailed'),
            'auth/email-already-in-use': t('errors.emailExists'),
            'auth/weak-password': t('errors.passwordMin'),
            'auth/invalid-email': t('errors.emailInvalid'),
            'auth/too-many-requests': 'Too many attempts. Please try again later.',
        };

        const codeMatch = errorCode.match(/\(auth\/[^)]+\)/);
        const code = codeMatch ? codeMatch[0].slice(1, -1) : errorCode;

        return errorMessages[code] || (isLogin ? t('errors.loginFailed') : t('errors.signupFailed'));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            if (isLogin) {
                await login(email, password);
                setShowSuccess(true);
                setTimeout(() => {
                    if (email === 'mhamed.saad.ibrahim@gmail.com') {
                        navigate('/admin');
                        success("Welcome back, Admin!");
                    } else {
                        navigate('/');
                        success("Successfully logged in!");
                    }
                }, 800);
            } else {
                await signup(email, password);
                setShowSuccess(true);
                setTimeout(() => {
                    navigate('/');
                    success("Account created successfully!");
                }, 800);
            }
        } catch (err) {
            const msg = getFirebaseErrorMessage(err.message);
            setErrors({ form: msg });
            toastError(msg);
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await googleSignIn();
            const userEmail = result?.user?.email?.toLowerCase();
            setShowSuccess(true);
            setTimeout(() => {
                if (userEmail === 'mhamed.saad.ibrahim@gmail.com') {
                    navigate('/admin');
                    success("Welcome back, Admin!");
                } else {
                    navigate('/');
                    success("Successfully logged in with Google!");
                }
            }, 800);
        } catch (err) {
            console.error("Google Sign In Error:", err);
            const msg = getFirebaseErrorMessage(err.message);
            toastError(msg);
        }
    };

    // Forgot Password handler
    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!resetEmail.trim() || !validateEmail(resetEmail)) {
            toastError(t('errors.emailInvalid'));
            return;
        }

        setResetLoading(true);

        try {
            await resetPassword(resetEmail);
            success('Password reset email sent! Check your inbox.');
            setShowForgotPassword(false);
            setResetEmail('');
        } catch (err) {
            toastError('Failed to send reset email. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="login-page page-container container">
            <SEO
                title={isLogin ? 'Login' : 'Sign Up'}
                description="Login or create an account at A Plus+ Laptops."
            />
            <div className={`login-card ${showSuccess ? 'success-state' : ''}`}>
                {showSuccess ? (
                    <div className="success-animation">
                        <div className="success-checkmark">
                            <svg viewBox="0 0 52 52">
                                <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle" />
                                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
                            </svg>
                        </div>
                        <p>{isLogin ? 'Welcome back!' : 'Account created!'}</p>
                    </div>
                ) : (
                    <>
                        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

                        {errors.form && (
                            <div className="error-alert" role="alert">
                                <span className="error-icon">⚠️</span>
                                {errors.form}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <div className={`form-group floating-group ${errors.email ? 'has-error' : ''}`}>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    onBlur={handleEmailBlur}
                                    disabled={loading}
                                    placeholder=" "
                                    autoComplete="email"
                                    aria-describedby={errors.email ? 'email-error' : undefined}
                                />
                                <label htmlFor="email">Email</label>
                                {errors.email && (
                                    <span id="email-error" className="field-error" role="alert">
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            <div className={`form-group floating-group ${errors.password ? 'has-error' : ''}`}>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={handlePasswordChange}
                                    onBlur={handlePasswordBlur}
                                    disabled={loading}
                                    placeholder=" "
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                />
                                <label htmlFor="password">Password</label>
                                {errors.password && (
                                    <span id="password-error" className="field-error" role="alert">
                                        {errors.password}
                                    </span>
                                )}

                                {/* Password Strength Indicator - only on signup */}
                                {!isLogin && password && (
                                    <div className="password-strength">
                                        <div className="strength-bar">
                                            <div
                                                className="strength-fill"
                                                style={{
                                                    width: `${(passwordStrength.score / 5) * 100}%`,
                                                    backgroundColor: passwordStrength.color
                                                }}
                                            />
                                        </div>
                                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Forgot Password Link */}
                            {isLogin && (
                                <button
                                    type="button"
                                    className="forgot-password-link"
                                    onClick={() => setShowForgotPassword(true)}
                                >
                                    Forgot Password?
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-100"
                            >
                                {loading ? (
                                    <span className="btn-loading">
                                        <span className="spinner"></span>
                                        {t('errors.submitting') || 'Submitting...'}
                                    </span>
                                ) : (
                                    isLogin ? 'Login' : 'Sign Up'
                                )}
                            </button>

                            <div className="auth-divider">
                                <span>or</span>
                            </div>

                            <button
                                type="button"
                                className="google-btn w-100"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                            >
                                <svg viewBox="0 0 24 24" className="google-icon">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                {t('common.continueUsingGoogle')}
                            </button>
                        </form>

                        <div className="toggle-auth">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                className="btn-link"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setErrors({});
                                    setPassword('');
                                }}
                                disabled={loading}
                            >
                                {isLogin ? 'Sign Up' : 'Login'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowForgotPassword(false)}>×</button>
                        <h3>Reset Password</h3>
                        <p>Enter your email address and we'll send you a link to reset your password.</p>
                        <form onSubmit={handleForgotPassword}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    disabled={resetLoading}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100" disabled={resetLoading}>
                                {resetLoading ? (
                                    <span className="btn-loading">
                                        <span className="spinner"></span>
                                        Sending...
                                    </span>
                                ) : 'Send Reset Link'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
