import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewList from './ReviewList';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as firestoreModule from 'firebase/firestore';

// Mock Hooks
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../context/ToastContext', () => ({
    useToast: () => ({ success: vi.fn(), error: vi.fn() })
}));

vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key) => key })
}));

// Mock Firestore
vi.mock('../firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => {
    return {
        collection: vi.fn(),
        addDoc: vi.fn(),
        getDocs: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        orderBy: vi.fn(),
        serverTimestamp: vi.fn(),
    };
});

describe('ReviewList Component', () => {
    const mockReviews = [
        { id: '1', userName: 'User 1', userRole: 'Verified', rating: 5, text: 'Great product!', createdAt: null }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Default: Review fetch success
        const mockSnapshot = {
            docs: mockReviews.map(r => ({
                id: r.id,
                data: () => r
            })),
            empty: false,
            size: mockReviews.length
        };
        firestoreModule.getDocs.mockResolvedValue(mockSnapshot);
    });

    it('should render reviews', async () => {
        useAuth.mockReturnValue({ currentUser: null });
        render(<ReviewList productId="123" />);

        // Debug: check if loading or empty
        // await screen.findByText('Great product!'); // This throws if not found

        // If it renders "No reviews yet", our mock returned empty or failed
        // Let's verify what happens.
        await waitFor(() => {
            expect(screen.getByText(/Great product!/i)).toBeInTheDocument();
        });
    });

    it('should show write review button only when logged in', async () => {
        // Not logged in
        useAuth.mockReturnValue({ currentUser: null });
        const { rerender } = render(<ReviewList productId="123" />);
        expect(screen.queryByText('Write a Review')).not.toBeInTheDocument();

        // Logged in
        useAuth.mockReturnValue({ currentUser: { uid: 'u1', email: 'test@test.com' } });
        rerender(<ReviewList productId="123" />);
        expect(screen.getByText('Write a Review')).toBeInTheDocument();
    });

    it('should submit a review successfully', async () => {
        useAuth.mockReturnValue({ currentUser: { uid: 'u1', email: 'test@test.com' } });
        render(<ReviewList productId="123" />);

        // Open Form
        fireEvent.click(screen.getByText('Write a Review'));

        // Fill Form
        const textarea = screen.getByPlaceholderText('Share your experience with this product...');
        fireEvent.change(textarea, { target: { value: 'This is a very good product mostly.' } }); // > 10 chars

        // Submit
        fireEvent.click(screen.getByText('Submit Review'));

        await waitFor(() => {
            expect(firestoreModule.addDoc).toHaveBeenCalled();
            expect(screen.getByText('Review Submitted!')).toBeInTheDocument();
        });
    });

    it('should validate short reviews', async () => {
        useAuth.mockReturnValue({ currentUser: { uid: 'u1', email: 'test@test.com' } });
        render(<ReviewList productId="123" />);

        fireEvent.click(screen.getByText('Write a Review'));

        const textarea = screen.getByPlaceholderText('Share your experience with this product...');
        fireEvent.change(textarea, { target: { value: 'Short' } }); // < 10 chars

        fireEvent.click(screen.getByText('Submit Review'));

        await waitFor(() => {
            // Should show error (using mock translation key or fallback)
            // The component returns t('errors.reviewMin') or hardcoded string
            // Our mock returns key 'errors.reviewMin'
            expect(firestoreModule.addDoc).not.toHaveBeenCalled();
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });
});
