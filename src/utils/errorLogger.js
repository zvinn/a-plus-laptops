/**
 * Error Logger Utility
 * Centralized error logging with remote logging and global error handling
 */

// Store last N errors in memory for debugging
const MAX_STORED_ERRORS = 20;
const errorHistory = [];

// Configuration for remote logging (can be set via initErrorLogging)
let remoteConfig = {
    enabled: false,
    endpoint: '/api/log-error',
    apiKey: null
};

/**
 * Initialize error logging configuration
 */
export const initErrorLogging = (config = {}) => {
    remoteConfig = { ...remoteConfig, ...config };
    setupGlobalHandlers();
};

/**
 * Setup global error handlers
 */
const setupGlobalHandlers = () => {
    // Handle uncaught errors
    window.onerror = (message, source, lineno, colno, error) => {
        logError(
            error || new Error(message),
            { source, lineno, colno },
            'GlobalErrorHandler'
        );
        return false; // Allow default browser handling
    };

    // Handle unhandled promise rejections
    window.onunhandledrejection = (event) => {
        logError(
            event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
            { type: 'unhandledrejection' },
            'PromiseRejectionHandler'
        );
    };
};

/**
 * Log an error with full context
 * @param {Error} error - The error object
 * @param {Object} errorInfo - React error info with componentStack
 * @param {string} boundary - Name of the error boundary that caught it
 */
export const logError = (error, errorInfo = {}, boundary = 'Unknown') => {
    const errorLog = {
        id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        boundary,
        message: error?.message || 'Unknown error',
        name: error?.name || 'Error',
        stack: error?.stack || '',
        componentStack: errorInfo?.componentStack || '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        ...errorInfo
    };

    // Console logging with styling
    console.group(`🚨 Error Caught by ${boundary}`);
    console.error('Error:', error);
    console.log('Error ID:', errorLog.id);
    console.log('Timestamp:', errorLog.timestamp);
    console.log('URL:', errorLog.url);
    if (errorInfo?.componentStack) {
        console.log('Component Stack:', errorInfo.componentStack);
    }
    console.groupEnd();

    // Store in history
    errorHistory.unshift(errorLog);
    if (errorHistory.length > MAX_STORED_ERRORS) {
        errorHistory.pop();
    }

    // Send to remote logging service if enabled
    if (remoteConfig.enabled) {
        sendToRemoteLogger(errorLog);
    }

    return errorLog;
};

/**
 * Get error history for debugging
 */
export const getErrorHistory = () => [...errorHistory];

/**
 * Get the last error
 */
export const getLastError = () => errorHistory[0] || null;

/**
 * Clear error history
 */
export const clearErrorHistory = () => {
    errorHistory.length = 0;
};

/**
 * Generate WhatsApp message for error reporting
 */
export const generateWhatsAppReport = (error, additionalInfo = '') => {
    const lastError = error || getLastError();
    if (!lastError) return null;

    const message = `🚨 *تقرير خطأ / Error Report*

📅 التوقيت: ${lastError.timestamp}
🆔 رقم الخطأ: ${lastError.id || 'N/A'}
📍 الصفحة: ${lastError.url}
⚠️ نوع الخطأ: ${lastError.name}
💬 الرسالة: ${lastError.message}

${additionalInfo ? `📝 ملاحظات إضافية: ${additionalInfo}` : ''}

---
User Agent: ${lastError.userAgent}`;

    // A Plus+ WhatsApp number (you can change this)
    const phoneNumber = '201000000000'; // Replace with actual number
    const encodedMessage = encodeURIComponent(message);

    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

/**
 * Send error to remote logging service
 */
const sendToRemoteLogger = async (errorLog) => {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (remoteConfig.apiKey) {
            headers['Authorization'] = `Bearer ${remoteConfig.apiKey}`;
        }

        await fetch(remoteConfig.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(errorLog),
        });
    } catch (e) {
        console.warn('Failed to send error to remote logger:', e);
    }
};

/**
 * Check if error is retryable (network errors, timeouts, etc.)
 */
export const isRetryableError = (error) => {
    const retryablePatterns = [
        /network/i,
        /timeout/i,
        /fetch/i,
        /connection/i,
        /ECONNRESET/i,
        /ETIMEDOUT/i,
        /Failed to fetch/i,
        /NetworkError/i,
        /Load failed/i
    ];

    const message = error?.message || '';
    const name = error?.name || '';

    return retryablePatterns.some(pattern =>
        pattern.test(message) || pattern.test(name)
    );
};

export default {
    logError,
    getErrorHistory,
    getLastError,
    clearErrorHistory,
    initErrorLogging,
    generateWhatsAppReport,
    isRetryableError
};

