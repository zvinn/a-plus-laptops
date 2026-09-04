import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const ConfirmContext = createContext();

export const useConfirm = () => {
    return useContext(ConfirmContext);
};

export const ConfirmProvider = ({ children }) => {
    const [state, setState] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        variant: 'danger', // danger, info, success, warning
        onConfirm: () => { },
        onCancel: () => { }
    });

    const promiseRef = useRef(null);

    const confirm = useCallback(({
        title = 'Are you sure?',
        message = 'This action cannot be undone.',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        variant = 'danger'
    }) => {
        return new Promise((resolve, reject) => {
            promiseRef.current = { resolve, reject };
            setState({
                isOpen: true,
                title,
                message,
                confirmText,
                cancelText,
                variant
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (promiseRef.current) {
            promiseRef.current.resolve(true);
        }
        setState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const handleCancel = useCallback(() => {
        if (promiseRef.current) {
            promiseRef.current.resolve(false);
        }
        setState(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {state.isOpen && (
                <ConfirmModal
                    isOpen={state.isOpen}
                    title={state.title}
                    message={state.message}
                    confirmText={state.confirmText}
                    cancelText={state.cancelText}
                    variant={state.variant}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmContext.Provider>
    );
};
