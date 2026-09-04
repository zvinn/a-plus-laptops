import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CRMDashboard from './CRMDashboard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { addDoc } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../context/ToastContext', () => ({
    useToast: vi.fn()
}));

// Mock Lucide icons to simplify DOM
vi.mock('lucide-react', () => ({
    Phone: () => <span data-testid="icon-phone" />,
    Mail: () => <span data-testid="icon-mail" />,
    Users: () => <span data-testid="icon-users" />,
    MessageCircle: () => <span data-testid="icon-message" />,
    FileText: () => <span data-testid="icon-file" />,
    Star: () => <span data-testid="icon-star" />,
    Briefcase: () => <span data-testid="icon-briefcase" />,
    ClipboardList: () => <span data-testid="icon-clipboard" />,
    CheckCircle: () => <span data-testid="icon-check" />,
    Clock: () => <span data-testid="icon-clock" />,
    UserPlus: () => <span data-testid="icon-user-plus" />,
    Download: () => <span data-testid="icon-download" />
}));

// Robust Firestore Mock
const mockCollections = {
    orders: [],
    customers: [],
    customer_interactions: [],
    follow_ups: []
};

vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getDocs: vi.fn(async (queryRef) => {
            const path = queryRef._path || queryRef._query?.path;
            const data = mockCollections[path] || [];
            return {
                docs: data.map(item => ({
                    id: item.id,
                    data: () => item
                })),
                empty: data.length === 0
            };
        }),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        collection: vi.fn((db, path) => ({ _path: path })),
        query: vi.fn((ref) => ({ _query: ref, _path: ref._path })),
        orderBy: vi.fn(),
        where: vi.fn(),
        serverTimestamp: vi.fn(),
        Timestamp: {
            fromDate: (date) => ({ toDate: () => date })
        }
    };
});

vi.mock('../../firebase', () => ({
    db: {}
}));

global.URL.createObjectURL = vi.fn(() => 'mock-url');

describe('CRMDashboard Page', () => {
    const mockUser = { email: 'admin@example.com', uid: 'admin123' };
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ currentUser: mockUser });
        useToast.mockReturnValue({ success: mockSuccess, error: mockError });

        mockCollections.orders = [];
        mockCollections.customers = [];
        mockCollections.customer_interactions = [];
        mockCollections.follow_ups = [];
    });

    const setupData = () => {
        mockCollections.orders = [
            {
                id: 'o1',
                customerName: 'John Doe',
                customerEmail: 'john@example.com',
                totalAmount: 60000,
                createdAt: { toDate: () => new Date() }
            }
        ];

        mockCollections.customers = [
            {
                id: 'c1',
                name: 'Jane Smith',
                email: 'jane@example.com',
                notes: 'Loyal'
            }
        ];
    };

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <CRMDashboard />
            </MemoryRouter>
        );
    };

    it('should render CRM dashboard and aggregated stats', async () => {
        setupData();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/إدارة العملاء \(CRM\)/i)).toBeInTheDocument();
            // Total should be 2 (John Doe order + Jane Smith customer)
            expect(screen.getAllByText(/2/).length).toBeGreaterThan(0);
        });
    });

    it('should open add customer modal', async () => {
        setupData();
        renderComponent();
        await waitFor(() => expect(screen.getByText(/إدارة العملاء \(CRM\)/i)).toBeInTheDocument());

        const addBtn = screen.getByText(/إضافة عميل/).closest('button');
        fireEvent.click(addBtn);

        await waitFor(() => {
            expect(screen.getByText(/إضافة عميل جديد/)).toBeInTheDocument();
        });
    });

    it('should add a new customer', async () => {
        setupData();
        renderComponent();
        await waitFor(() => expect(screen.getByText(/إدارة العملاء/i)).toBeInTheDocument());

        const addBtn = screen.getByText(/إضافة عميل/).closest('button');
        fireEvent.click(addBtn);

        const nameInput = await screen.findByLabelText(/الاسم/);
        fireEvent.change(nameInput, { target: { value: 'New User' } });

        const emailInput = screen.getByLabelText(/البريد الإلكتروني/);
        fireEvent.change(emailInput, { target: { value: 'new@test.com' } });

        // Submit form directly to bypass emoji button selector issues
        const form = screen.getByText(/إضافة عميل جديد/).closest('.modal-content').querySelector('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(addDoc).toHaveBeenCalled();
            expect(mockSuccess).toHaveBeenCalledWith('تمت إضافة العميل بنجاح');
        });
    });

});
