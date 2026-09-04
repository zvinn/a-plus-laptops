import * as Sentry from "@sentry/react";

export const initSentry = () => {
    // Only initialize in production
    if (import.meta.env.PROD) {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration(),
            ],
            // Performance Monitoring
            tracesSampleRate: 0.1, // 10% of transactions
            // Session Replay
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0, // 100% when error occurs
            // Environment
            environment: import.meta.env.MODE,
        });
    }
};

// Error boundary wrapper
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Capture custom errors
export const captureError = (error, context = {}) => {
    if (import.meta.env.PROD) {
        Sentry.captureException(error, { extra: context });
    } else {
        console.error('Error captured:', error, context);
    }
};

// Set user context
export const setUserContext = (user) => {
    if (import.meta.env.PROD && user) {
        Sentry.setUser({
            id: user.uid,
            email: user.email,
        });
    }
};
