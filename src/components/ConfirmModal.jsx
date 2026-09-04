import React from 'react';
import './ConfirmModal.css';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    variant = 'danger',
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'danger': return <AlertTriangle size={24} />;
            case 'warning': return <AlertTriangle size={24} />;
            case 'success': return <CheckCircle size={24} />;
            case 'info': return <Info size={24} />;
            default: return <Info size={24} />;
        }
    };

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="confirm-modal-header">
                    <div className={`confirm-modal-icon ${variant}`}>
                        {getIcon()}
                    </div>
                    <h3>{title}</h3>
                    <p>{message}</p>
                </div>

                <div className="confirm-modal-actions">
                    <button className="confirm-modal-btn cancel" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`confirm-modal-btn confirm ${variant}`}
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
