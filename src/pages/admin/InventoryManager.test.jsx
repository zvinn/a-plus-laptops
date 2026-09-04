import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InventoryManager from './InventoryManager';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../context/ToastContext', () => ({
    useToast: vi.fn()
}));

vi.mock('../../context/ConfirmContext', () => ({
    useConfirm: vi.fn(() => ({
        confirm: vi.fn(() => Promise.resolve(true))
    }))
}));

// Mock OptimizedImage
vi.mock('../../components/OptimizedImage', () => ({
    default: ({ src, alt }) => <img src={src} alt={alt} data-testid="optimized-image" />
}));

// Mock Firebase
vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getDocs: vi.fn(),
        addDoc: vi.fn(() => Promise.resolve({ id: 'new-id' })),
        updateDoc: vi.fn(() => Promise.resolve()),
        deleteDoc: vi.fn(() => Promise.resolve()),
        doc: vi.fn(() => 'doc-ref'),
        collection: vi.fn(),
        query: vi.fn(),
        orderBy: vi.fn(),
        serverTimestamp: vi.fn(() => new Date()),
        increment: vi.fn((n) => n)
    };
});

vi.mock('../../firebase', () => ({
    db: {}
}));

describe('InventoryManager Page', () => {
    const mockUser = { email: 'admin@example.com', uid: 'admin123' };
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    const mockProducts = [
        { id: 'p1', name: 'Laptop A', brand: 'Dell', price: 10000, stockCount: 10, lowStockThreshold: 5, image: '/laptop-a.jpg' },
        { id: 'p2', name: 'Laptop B', brand: 'HP', price: 15000, stockCount: 2, lowStockThreshold: 5, image: '/laptop-b.jpg' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        useAuth.mockReturnValue({ currentUser: mockUser });
        useToast.mockReturnValue({ success: mockSuccess, error: mockError });

        getDocs.mockResolvedValue({
            empty: true,
            docs: []
        });
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <InventoryManager />
            </MemoryRouter>
        );
    };

    it('should render inventory page', async () => {
        getDocs
            .mockResolvedValueOnce({
                docs: mockProducts.map(p => ({ id: p.id, data: () => p })),
                empty: false
            })
            .mockResolvedValueOnce({ docs: [], empty: true })
            .mockResolvedValueOnce({ docs: [], empty: true });

        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByText(/إدارة المخزون/i).length).toBeGreaterThan(0);
        });
    });

    it('should render stats section', async () => {
        getDocs
            .mockResolvedValueOnce({
                docs: mockProducts.map(p => ({ id: p.id, data: () => p })),
                empty: false
            })
            .mockResolvedValueOnce({ docs: [], empty: true })
            .mockResolvedValueOnce({ docs: [], empty: true });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/إجمالي المنتجات/i)).toBeInTheDocument();
        });
    });

    it('should switch to suppliers tab', async () => {
        getDocs
            .mockResolvedValueOnce({ docs: mockProducts.map(p => ({ id: p.id, data: () => p })), empty: false })
            .mockResolvedValueOnce({ docs: [], empty: true })
            .mockResolvedValueOnce({ docs: [], empty: true });

        renderComponent();
        await waitFor(() => expect(screen.getAllByText(/إدارة المخزون/i).length).toBeGreaterThan(0));

        const suppliersTab = screen.getByText(/الموردين/);
        fireEvent.click(suppliersTab);

        await waitFor(() => {
            expect(screen.getByText('لا يوجد موردين مضافين')).toBeInTheDocument();
        });
    });
});
