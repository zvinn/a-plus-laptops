import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Accounting from './Accounting';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getDocs, addDoc } from 'firebase/firestore';

// Mock Dependencies
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../../context/ToastContext', () => ({
    useToast: vi.fn()
}));

// Mock Recharts
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="chart-container">{children}</div>,
    BarChart: () => <div data-testid="bar-chart" />,
    PieChart: () => <div data-testid="pie-chart" />,
    LineChart: () => <div />,
    Bar: () => <div />,
    Pie: () => <div />,
    Line: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Legend: () => <div />,
    Cell: () => <div />
}));

// Mock Firebase
vi.mock('firebase/firestore', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        getDocs: vi.fn(),
        addDoc: vi.fn(),
        deleteDoc: vi.fn(),
        doc: vi.fn(),
        collection: vi.fn(),
        query: vi.fn(),
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

// Mock URL
global.URL.createObjectURL = vi.fn(() => 'mock-url');

describe('Accounting Page', () => {
    const mockUser = { email: 'admin@example.com', uid: 'admin123' };
    const mockSuccess = vi.fn();
    const mockError = vi.fn();

    const mockOrders = [
        { id: 'o1', totalAmount: 5000, createdAt: { toDate: () => new Date() }, status: 'completed' }
    ];

    const mockExpenses = [
        { id: 'e1', description: 'Rent', amount: 1000, category: 'rent', date: { toDate: () => new Date() } }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ currentUser: mockUser });
        useToast.mockReturnValue({ success: mockSuccess, error: mockError });

        getDocs.mockResolvedValue({ empty: true, docs: [] });
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <Accounting />
            </MemoryRouter>
        );
    };

    it('should render dashboard and finish loading', async () => {
        renderComponent();

        // Use Regex to match partial text, ignoring emoji
        await waitFor(() => {
            expect(screen.getAllByText(/النظام المحاسبي/).length).toBeGreaterThan(0);
        });
    });

    it('should display correct stats from data', async () => {
        getDocs
            .mockResolvedValueOnce({ docs: mockOrders.map(o => ({ id: o.id, data: () => o })), empty: false })
            .mockResolvedValueOnce({ docs: mockExpenses.map(e => ({ id: e.id, data: () => e })), empty: false });

        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByText(/النظام المحاسبي/).length).toBeGreaterThan(0);
        });

        await waitFor(() => {
            const revenueElements = screen.getAllByText(/5,000/);
            expect(revenueElements.length).toBeGreaterThan(0);
        });
    });

    it('should open add expense modal', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getAllByText(/النظام المحاسبي/).length).toBeGreaterThan(0));

        const addBtn = screen.getByText(/إضافة مصروف/);
        fireEvent.click(addBtn);

        await waitFor(() => {
            expect(screen.getByText('إضافة مصروف جديد')).toBeInTheDocument();
        });
    });
});
