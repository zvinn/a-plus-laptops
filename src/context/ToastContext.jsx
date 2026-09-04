import React, { createContext, useContext, useState, useCallback } from 'react';
import '../components/Toast.css';

const ToastContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', title) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, title }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const success = (msg) => addToast(msg, 'success', 'Success');
    const error = (msg) => addToast(msg, 'error', 'Error');
    const info = (msg) => addToast(msg, 'info', 'Info');

    return (
        <ToastContext.Provider value={{ addToast, success, error, info }}>
            {children}

            <div className="toast-container" role="region" aria-label="Notifications" aria-live="polite">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`toast ${toast.type}`}
                        role="alert"
                        aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
                    >
                        <div className="toast-icon" aria-hidden="true">
                            {toast.type === 'success' && '✅'}
                            {toast.type === 'error' && '❌'}
                            {toast.type === 'info' && 'ℹ️'}
                        </div>
                        <div className="toast-content">
                            <div className="toast-title">{toast.title}</div>
                            <div className="toast-message">{toast.message}</div>
                        </div>
                        <button
                            className="toast-close"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Dismiss notification"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
