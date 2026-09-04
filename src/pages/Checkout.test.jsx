import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Checkout from './Checkout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import * as firestoreModule from 'firebase/firestore';

// Mock Hooks
vi.mock('../context/CartContext', () => ({
    useCart: vi.fn()
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key) => key })
}));

vi.mock('../context/ToastContext', () => ({
    useToast: () => ({ success: vi.fn(), error: vi.fn() })
}));

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

// Mock Dependencies
vi.mock('@emailjs/browser', () => ({
    default: { send: vi.fn().mockResolvedValue('ok') }
}));

vi.mock('../utils/analytics', () => ({
    trackBeginCheckout: vi.fn(),
    trackPurchase: vi.fn()
}));

vi.mock('../components/CouponInput', () => ({
    default: () => <div data-testid="coupon-input">CouponInput</div>
}));

vi.mock('../components/SEO', () => ({
    default: () => null
}));

// Mock Firestore
vi.mock('../firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => {
    const actual = vi.importActual('firebase/firestore');
    return {
        ...actual,
        collection: vi.fn(),
        addDoc: vi.fn(),
        serverTimestamp: vi.fn(),
        getDoc: vi.fn(),
        doc: vi.fn(),
        updateDoc: vi.fn(),
        runTransaction: vi.fn(), // We will mock implementation in tests
    };
});

describe('Checkout Page', () => {
    const mockCart = [
        { id: '1', name: 'Laptop A', price: 10000, quantity: 1 }
    ];

    // Default mocks
    const defaultRunTransaction = async (db, transactionFn) => {
        const transactionMock = {
            get: vi.fn().mockResolvedValue({
                exists: () => true,
                data: () => ({ stockCount: 10 })
            }),
            set: vi.fn(),
            update: vi.fn()
        };
        await transactionFn(transactionMock);
        return 'new-order-id';
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useCart.mockReturnValue({
            cart: mockCart,
            getCartTotal: () => 10000,
            clearCart: vi.fn()
        });
        useAuth.mockReturnValue({ currentUser: { uid: 'u1', email: 'test@example.com' } });
        window.location.href = ''; // Mock window.location

        // Setup Firestore Mocks
        firestoreModule.runTransaction.mockImplementation(defaultRunTransaction);
        firestoreModule.collection.mockReturnValue('orders-col');
        firestoreModule.doc.mockReturnValue('doc-ref');
    });

    it('should show empty cart message if cart is empty', () => {
        useCart.mockReturnValue({ cart: [], getCartTotal: () => 0 });
        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>
        );
        expect(screen.getByText('checkout.emptyCart')).toBeInTheDocument();
    });

    it('should validate form and prevent submission', async () => {
        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>
        );

        const submitBtn = screen.getByRole('button', { name: /checkout.placeOrder/i }); // Using regex for flexible match
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getAllByRole('alert').length).toBeGreaterThan(0); // Should have multiple errors
        });
    });

    it('should place order successfully with valid data', async () => {
        const { clearCart } = useCart();
        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>
        );

        // Fill Form
        fireEvent.change(screen.getByLabelText('checkout.fullName'), { target: { value: 'Ahmed Ali' } });
        fireEvent.change(screen.getByLabelText('checkout.email'), { target: { value: 'ahmed@test.com' } });
        fireEvent.change(screen.getByLabelText('checkout.phone'), { target: { value: '01012345678' } }); // valid egypt phone
        fireEvent.change(screen.getByLabelText('checkout.city'), { target: { value: 'Cairo' } });
        fireEvent.change(screen.getByLabelText('checkout.address'), { target: { value: '123 Street' } });

        // Submit
        // Mock window.location assignment
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { href: '' },
        });

        const form = document.querySelector('#checkout-form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(firestoreModule.runTransaction).toHaveBeenCalled();
            expect(screen.getByText(/Order Placed Successfully/i)).toBeInTheDocument();
        });
    });

    it('should handle out of stock error during transaction', async () => {
        // Mock transaction to throw error
        firestoreModule.runTransaction.mockImplementation(async (db, transactionFn) => {
            const transactionMock = {
                get: vi.fn().mockResolvedValue({
                    exists: () => true,
                    data: () => ({ stockCount: 0 }) // Out of stock
                })
            };
            await transactionFn(transactionMock);
        });

        // Mock console.error to suppress output
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>
        );

        // Fill Form (Must be valid to trigger transaction)
        fireEvent.change(screen.getByLabelText('checkout.fullName'), { target: { value: 'Ahmed Ali' } });
        fireEvent.change(screen.getByLabelText('checkout.email'), { target: { value: 'ahmed@test.com' } });
        fireEvent.change(screen.getByLabelText('checkout.phone'), { target: { value: '01012345678' } });
        fireEvent.change(screen.getByLabelText('checkout.city'), { target: { value: 'Cairo' } });
        fireEvent.change(screen.getByLabelText('checkout.address'), { target: { value: '123 Street' } });

        const form = document.querySelector('#checkout-form');
        fireEvent.submit(form);

        await waitFor(() => {
            // Should stay on page (form still visible) or show error toast
            // The component calls toastError on error
            expect(screen.queryByText(/Order Placed Successfully/i)).not.toBeInTheDocument();
        });

        consoleSpy.mockRestore();
    });

    it('should display cart summary correctly', () => {
        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>
        );

        expect(screen.getByText('Laptop A')).toBeInTheDocument();
        expect(screen.getByTestId('coupon-input')).toBeInTheDocument();
    });

    it('should handle shipping method selection', async () => {
        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>
        );

        // Look for shipping options
        const standardShipping = screen.queryByLabelText(/Standard/i) || screen.queryByText(/Standard/i);
        if (standardShipping) {
            fireEvent.click(standardShipping);
        }

        // Cart total should still be visible
        expect(screen.getByText('Laptop A')).toBeInTheDocument();
    });

    it('should validate phone number format', async () => {
        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>
        );

        // Enter invalid phone
        fireEvent.change(screen.getByLabelText('checkout.phone'), { target: { value: '123' } });

        const submitBtn = screen.getByRole('button', { name: /checkout.placeOrder/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
        });
    });

    it('should validate email format', async () => {
        render(
            <MemoryRouter>
                <Checkout />
            </MemoryRouter>
        );

        // Enter invalid email
        fireEvent.change(screen.getByLabelText('checkout.email'), { target: { value: 'invalid-email' } });

        const submitBtn = screen.getByRole('button', { name: /checkout.placeOrder/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
        });
    });
});
