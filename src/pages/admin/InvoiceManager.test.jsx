import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InvoiceManager from './InvoiceManager';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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

vi.mock('lucide-react', () => ({
    Printer: () => <span />,
    Download: () => <span />,
    Eye: () => <span />,
    Plus: () => <span />,
    Search: () => <span />,
    FileText: () => <span />,
    Phone: () => <span />,
    Mail: () => <span />,
    MapPin: () => <span />,
    ShieldCheck: () => <span />,
    X: () => <span />
}));

vi.mock('qrcode.react', () => ({
    QRCodeCanvas: () => <div data-testid="qr-code" />
}));

// Mock Firestore
const mockInvoices = [
    {
        id: 'inv1',
        invoiceNumber: 'INV-001',
        customerName: 'Client A',
        total: 15000,
        status: 'draft',
        createdAt: { toDate: () => new Date() },
        dueDate: { toDate: () => new Date() }
    }
];

vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getDocs: vi.fn(async () => {
            // Simple mock: if it's counting invoices, return mockInvoices
            // We can rely on rendering to check correctness
            return {
                docs: mockInvoices.map(inv => ({ id: inv.id, data: () => inv })),
                empty: false
            };
        }),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        doc: vi.fn((db, col, id) => ({ _path: col + '/' + id })), // Mock doc ref
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

describe('InvoiceManager Page', () => {
    const mockUser = { email: 'admin@example.com', uid: 'admin123' };
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ currentUser: mockUser });
        useToast.mockReturnValue({ success: mockSuccess, error: mockError });

        // Setup window mocks
        global.confirm = vi.fn(() => true);
        global.print = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <InvoiceManager />
            </MemoryRouter>
        );
    };

    it('should render invoice manager and list invoices', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('🧾 نظام الفواتير')).toBeInTheDocument();
            expect(screen.getByText('INV-001')).toBeInTheDocument();
        });
    });

    it('should open create invoice modal', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText('🧾 نظام الفواتير')).toBeInTheDocument());

        const createBtns = screen.getAllByText(/فاتورة جديدة/);
        fireEvent.click(createBtns.find(b => b.tagName === 'BUTTON') || createBtns[0]);

        await waitFor(() => {
            expect(screen.getByText('🧾 إنشاء فاتورة جديدة')).toBeInTheDocument();
        });
    });

    it('should delete an invoice', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument());

        const deleteBtn = screen.getByTitle('حذف');
        fireEvent.click(deleteBtn);

        // useConfirm is mocked to return true, so delete should proceed
        await waitFor(() => {
            expect(deleteDoc).toHaveBeenCalled();
        });
    });

    it('should update invoice status', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument());

        const sendBtn = screen.getByTitle('إرسال');
        fireEvent.click(sendBtn);

        await waitFor(() => {
            expect(updateDoc).toHaveBeenCalled();
            expect(mockSuccess).toHaveBeenCalledWith(expect.stringContaining('تم تحديث حالة الفاتورة'));
        });
    });
});
