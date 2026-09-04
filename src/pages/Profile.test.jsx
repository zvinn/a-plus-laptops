import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDoc, getDocs } from 'firebase/firestore';

// Mock dependencies
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn()
}));

vi.mock('../components/SEO', () => ({
    default: () => <div data-testid="seo" />
}));

// Mock Firebase
vi.mock('firebase/firestore', () => ({
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    doc: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    updateDoc: vi.fn()
}));

vi.mock('../firebase', () => ({
    db: {}
}));

describe('Profile Page', () => {
    const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User'
    };

    const mockOrders = [
        {
            id: 'order1',
            createdAt: { toDate: () => new Date('2023-01-01') },
            status: 'completed',
            totalAmount: 5000,
            items: [{ name: 'Laptop', quantity: 1, price: 5000 }]
        }
    ];

    const mockLogout = vi.fn();
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        useAuth.mockReturnValue({
            currentUser: mockUser,
            logout: mockLogout
        });

        useToast.mockReturnValue({
            success: mockSuccess,
            error: mockError
        });

        // Default: Found user data and orders
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ phoneNumber: '01000000000', address: 'Cairo' })
        });

        getDocs.mockResolvedValue({
            empty: false,
            docs: mockOrders.map(order => ({
                id: order.id,
                data: () => order
            }))
        });
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );
    };

    it('should render profile with user data', async () => {
        renderComponent();

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();

        // Wait for orders to load
        await waitFor(() => {
            expect(screen.getByText('#order1')).toBeInTheDocument();
            // Price appears in item row and total
            expect(screen.getAllByText('5,000 EGP').length).toBeGreaterThan(0);
        });
    });

    it('should navigate to settings and update profile', async () => {
        renderComponent();

        // Wait for initial load
        await waitFor(() => {
            // My Orders appears in Nav and Header
            expect(screen.getAllByText('My Orders').length).toBeGreaterThan(0);
        });

        // Switch to settings
        fireEvent.click(screen.getByText('Account Settings'));

        await waitFor(() => {
            expect(screen.queryByDisplayValue('01000000000')).toBeInTheDocument();
        });

        // Update Phone
        const phoneInput = screen.getByDisplayValue('01000000000');
        fireEvent.change(phoneInput, { target: { value: '01111111111' } });

        // Save
        const saveBtn = screen.getByText('Save Changes');
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(mockSuccess).toHaveBeenCalledWith('Profile updated successfully');
        });
    });

    it('should handle logout', async () => {
        renderComponent();

        // Wait for load
        await waitFor(() => {
            expect(screen.getByText('Sign Out')).toBeInTheDocument();
        });

        const logoutBtn = screen.getByText('Sign Out');
        fireEvent.click(logoutBtn);

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });
    });

    it('should show empty state if no orders', async () => {
        getDocs.mockResolvedValue({
            empty: true,
            docs: []
        });

        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByText('No orders yet').length).toBeGreaterThan(0);
            expect(screen.getByText('Go to Shop')).toBeInTheDocument();
        });
    });

    it('should redirect to login if no user', () => {
        useAuth.mockReturnValue({ currentUser: null });
        renderComponent();

        expect(screen.queryByText('My Orders')).not.toBeInTheDocument();
    });
});
