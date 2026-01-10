import React, { Component } from 'react';
import { logError, generateWhatsAppReport, isRetryableError, getLastError } from '../utils/errorLogger';
import { trackException } from '../utils/analytics';
import OfflineFallback from './OfflineFallback';
import './ErrorBoundary.css';

// Constants
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 * Features: Retry mechanism, WhatsApp error reporting, bilingual UI
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorLog: null,
            retryCount: 0,
            isRetrying: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        const { name = 'ErrorBoundary', enableAutoRetry = true } = this.props;
        const errorLog = logError(error, errorInfo, name);

        // Track error in Analytics
        trackException(`${name}: ${error.message}`, false);

        this.setState({ errorInfo, errorLog });

        // Auto-retry for retryable errors (network, timeout, etc.)
        if (enableAutoRetry && isRetryableError(error) && this.state.retryCount < MAX_RETRY_ATTEMPTS) {
            this.scheduleRetry();
        }
    }

    scheduleRetry = () => {
        this.setState({ isRetrying: true });

        setTimeout(() => {
            this.setState(prevState => ({
                hasError: false,
                error: null,
                errorInfo: null,
                retryCount: prevState.retryCount + 1,
                isRetrying: false
            }));
        }, RETRY_DELAY_MS * (this.state.retryCount + 1)); // Exponential backoff
    };

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorLog: null,
            retryCount: 0
        });

        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleReportError = () => {
        const { errorLog } = this.state;
        const whatsappUrl = generateWhatsAppReport(errorLog);

        if (whatsappUrl) {
            window.open(whatsappUrl, '_blank');
        }
    };

    handleManualRetry = () => {
        if (this.state.retryCount < MAX_RETRY_ATTEMPTS) {
            this.scheduleRetry();
        } else {
            // Force reset even after max retries
            this.handleReset();
        }
    };

    render() {
        const { hasError, isRetrying, retryCount, error } = this.state;
        const {
            children,
            fallback,
            fullscreen = false,
            showHomeButton = true,
            showReportButton = true,
            enableAutoRetry = true
        } = this.props;

        // Show loading during retry
        if (isRetrying) {
            return (
                <div className={`error-boundary-fallback ${fullscreen ? 'fullscreen' : ''}`}>
                    <div className="error-boundary-icon retry-spinner">🔄</div>
                    <h2 className="error-boundary-title">
                        جاري إعادة المحاولة...
                    </h2>
                    <p className="error-boundary-message">
                        المحاولة {retryCount + 1} من {MAX_RETRY_ATTEMPTS}
                        <br />
                        <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
                            Retrying... Attempt {retryCount + 1} of {MAX_RETRY_ATTEMPTS}
                        </span>
                    </p>
                </div>
            );
        }

        if (hasError) {
            // Use custom fallback if provided
            if (fallback) {
                return typeof fallback === 'function'
                    ? fallback({ error, reset: this.handleReset, report: this.handleReportError })
                    : fallback;
            }

            const canRetry = enableAutoRetry && retryCount < MAX_RETRY_ATTEMPTS;
            const isNetworkError = isRetryableError(error);

            if (isNetworkError) {
                return <OfflineFallback />;
            }

            // Default fallback UI
            return (
                <div className={`error-boundary-fallback ${fullscreen ? 'fullscreen' : ''}`}>
                    <div className="error-boundary-icon">
                        {isNetworkError ? '📡' : '⚠️'}
                    </div>
                    <h2 className="error-boundary-title">
                        {isNetworkError ? 'مشكلة في الاتصال' : 'حدث خطأ غير متوقع'}
                    </h2>
                    <p className="error-boundary-message">
                        {isNetworkError
                            ? 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى.'
                            : 'عذراً، حدث خطأ أثناء تحميل هذا المحتوى.'
                        }
                        <br />
                        <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
                            {isNetworkError
                                ? 'Check your internet connection and try again.'
                                : 'Something went wrong. Please try again.'
                            }
                        </span>
                    </p>

                    {retryCount > 0 && (
                        <p className="error-boundary-retry-info">
                            تمت المحاولة {retryCount} مرة / Tried {retryCount} time{retryCount > 1 ? 's' : ''}
                        </p>
                    )}

                    <div className="error-boundary-actions">
                        <button
                            className="error-boundary-btn error-boundary-btn-primary"
                            onClick={canRetry ? this.handleManualRetry : this.handleReset}
                        >
                            🔄 {canRetry ? 'حاول مرة أخرى / Retry' : 'إعادة التحميل / Reload'}
                        </button>

                        {showHomeButton && (
                            <button
                                className="error-boundary-btn error-boundary-btn-secondary"
                                onClick={this.handleGoHome}
                            >
                                🏠 الرئيسية / Home
                            </button>
                        )}

                        {showReportButton && (
                            <button
                                className="error-boundary-btn error-boundary-btn-report"
                                onClick={this.handleReportError}
                                title="الإبلاغ عن المشكلة / Report Issue"
                            >
                                📱 إبلاغ عن المشكلة / Report
                            </button>
                        )}
                    </div>
                </div>
            );
        }

        return children;
    }
}

/**
 * Page-level Error Boundary with route-specific reset
 */
export class PageErrorBoundary extends Component {
    handleReset = () => {
        // Reload current route
        window.location.reload();
    };

    render() {
        const { children, pageName = 'Page' } = this.props;
        return (
            <ErrorBoundary
                name={`Page_${pageName}`}
                fullscreen
                showHomeButton
                showReportButton
                onReset={this.handleReset}
            >
                {children}
            </ErrorBoundary>
        );
    }
}

/**
 * Higher-order component to wrap any component with error boundary
 */
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
    const WithErrorBoundary = (props) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <WrappedComponent {...props} />
        </ErrorBoundary>
    );

    WithErrorBoundary.displayName = `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return WithErrorBoundary;
};

export default ErrorBoundary;
