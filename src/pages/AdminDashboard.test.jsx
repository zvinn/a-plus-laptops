import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { adminService } from '../api/adminService';
import { productService } from '../api/productService';
import { orderService } from '../api/orderService';

// Mock Contexts
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));
vi.mock('../context/ToastContext', () => ({
    useToast: vi.fn()
}));
vi.mock('../context/ConfirmContext', () => ({
    useConfirm: vi.fn()
}));

// Mock Services
vi.mock('../api/adminService', () => ({
    adminService: {
        checkAdminStatus: vi.fn(),
        getAdmins: vi.fn(),
        addAdmin: vi.fn(),
        removeAdmin: vi.fn()
    }
}));
vi.mock('../api/productService', () => ({
    productService: {
        getProducts: vi.fn(),
        addProduct: vi.fn(),
        deleteProduct: vi.fn()
    }
}));
vi.mock('../api/orderService', () => ({
    orderService: {
        getOrders: vi.fn(),
        updateOrderStatus: vi.fn()
    }
}));

// Mock UI Components
vi.mock('../components/AdminOnboarding', () => ({
    default: () => <div data-testid="onboarding" />
}));
// Stub charts to avoid resizing issues
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    LineChart: () => null,
    PieChart: () => null,
    Line: () => null,
    Pie: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Cell: () => null
}));

describe('AdminDashboard Page', () => {
    const mockUser = { email: 'admin@example.com', uid: 'admin123' };
    const mockSuccess = vi.fn();
    const mockError = vi.fn();
    const mockConfirm = vi.fn();

    const mockProductsData = [
        { id: '1', name: 'Laptop Pro', brand: 'Asus', price: 25000, stockCount: 10, lowStockThreshold: 5, image: 'url', specs: {} }
    ];
    const mockOrdersData = [
        { id: 'o1', totalAmount: 25000, status: 'pending', shippingAddress: { fullName: 'John Doe' }, items: [], createdAt: { toDate: () => new Date() } }
    ];
    const mockAdminsData = [
        { email: 'admin@example.com', addedBy: 'System' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Context setup
        useAuth.mockReturnValue({ currentUser: mockUser, logout: vi.fn() });
        useToast.mockReturnValue({ success: mockSuccess, error: mockError });
        useConfirm.mockReturnValue({ confirm: mockConfirm });
        mockConfirm.mockResolvedValue(true);

        // Service setup
        adminService.checkAdminStatus.mockResolvedValue({ isAdmin: true, isSuperAdmin: true });
        adminService.getAdmins.mockResolvedValue(mockAdminsData);
        productService.getProducts.mockResolvedValue(mockProductsData);
        orderService.getOrders.mockResolvedValue(mockOrdersData);
    });

    const renderComponent = () => {
        return render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );
    };

    it('should redirect if not admin', async () => {
        adminService.checkAdminStatus.mockResolvedValueOnce({ isAdmin: false });
        renderComponent();
        await waitFor(() => {
            expect(adminService.checkAdminStatus).toHaveBeenCalled();
        });
        // Since we can't test navigation easily without testing-library/router-testing, 
        // we check if dashboard content is NOT rendered
        expect(screen.queryByText('Dashboard Overview')).not.toBeInTheDocument();
    });

    it('should render dashboard for admin', async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
            expect(screen.getByText('Total Revenue')).toBeInTheDocument();
            expect(screen.getByText('25,000 EGP')).toBeInTheDocument();
        });
    });

    it('should switch tabs', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText('Dashboard Overview')).toBeInTheDocument());

        // Click Products Tab (Using Regex for robustness against whitespace/icons)
        fireEvent.click(screen.getByRole('button', { name: /products/i }));

        await waitFor(() => {
            expect(screen.getByText('Product Management')).toBeInTheDocument();
            expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
        });
    });

    it('should add a new product', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText('Dashboard Overview')).toBeInTheDocument());

        // Go to Products
        fireEvent.click(screen.getByRole('button', { name: /products/i }));

        // Open Form
        fireEvent.click(screen.getByText('+ Add New Product'));

        // Fill Form
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Gaming Laptop' } });
        fireEvent.change(screen.getByLabelText('Brand'), { target: { value: 'Asus' } });
        fireEvent.change(screen.getByLabelText('Price (EGP)'), { target: { value: '30000' } });
        fireEvent.change(screen.getByLabelText('Image URL'), { target: { value: 'http://img.com' } });
        // Specs
        fireEvent.change(screen.getByLabelText('CPU'), { target: { value: 'i7' } });
        fireEvent.change(screen.getByLabelText('GPU'), { target: { value: 'RTX 3060' } });
        fireEvent.change(screen.getByLabelText('RAM'), { target: { value: '16GB' } });
        fireEvent.change(screen.getByLabelText('Storage'), { target: { value: '1TB' } });
        fireEvent.change(screen.getByLabelText('Stock Count'), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText('Low Stock Threshold'), { target: { value: '5' } });

        // Submit
        fireEvent.click(screen.getByText('Save Product'));

        await waitFor(() => {
            expect(productService.addProduct).toHaveBeenCalled();
            expect(mockSuccess).toHaveBeenCalledWith('Product added successfully!');
        });
    });

    it('should update order status', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText('Dashboard Overview')).toBeInTheDocument());

        // Go to Orders
        fireEvent.click(screen.getByRole('button', { name: /orders/i }));
        await waitFor(() => expect(screen.getByText('Order Management')).toBeInTheDocument());

        // Find status dropdown
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'shipped' } });

        await waitFor(() => {
            expect(orderService.updateOrderStatus).toHaveBeenCalledWith('o1', 'shipped');
            expect(mockSuccess).toHaveBeenCalledWith('Order status updated to shipped');
        });
    });

    it('should delete product with confirmation', async () => {
        renderComponent();
        await waitFor(() => expect(screen.getByText('Dashboard Overview')).toBeInTheDocument());
        fireEvent.click(screen.getByRole('button', { name: /products/i }));

        fireEvent.click(screen.getByText('Delete'));

        await waitFor(() => {
            expect(mockConfirm).toHaveBeenCalled();
            expect(productService.deleteProduct).toHaveBeenCalledWith('1');
            expect(mockSuccess).toHaveBeenCalledWith('Product deleted');
        });
    });
});
