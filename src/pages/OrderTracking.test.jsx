import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OrderTracking from './OrderTracking';

// Use vi.hoisted() for all mocks
const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    currentUser: { uid: 'user123' },
    getDocs: vi.fn(),
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mocks.navigate
    };
});

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ currentUser: mocks.currentUser })
}));

// Mock Firestore Lite
vi.mock('firebase/firestore', () => ({
    collection: vi.fn((db, path) => ({ path })),
    query: vi.fn((...args) => ({ args })),
    where: vi.fn(),
    orderBy: vi.fn(),
    getDocs: mocks.getDocs
}));

// Mock firebase config
vi.mock('../firebase', () => ({
    db: {}
}));

// Mock date-fns
vi.mock('date-fns', () => ({
    format: vi.fn((date, formatStr) => {
        if (formatStr === 'PPP') {
            return 'January 15, 2024';
        }
        return date.toString();
    })
}));

// Mock components
vi.mock('../components/SEO', () => ({
    default: () => <div data-testid="seo" />
}));

vi.mock('../components/PageTransition', () => ({
    default: ({ children }) => <div data-testid="page-transition">{children}</div>
}));

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
    ClipboardDocumentListIcon: () => <div data-testid="clipboard-icon" />,
    TruckIcon: () => <div data-testid="truck-icon" />,
    CheckBadgeIcon: () => <div data-testid="check-icon" />,
    ArchiveBoxIcon: () => <div data-testid="archive-icon" />,
    CubeIcon: () => <div data-testid="cube-icon" />
}));

// Mock Lucide React
vi.mock('lucide-react', () => ({
    ClipboardList: () => <div data-testid="clipboard-list-icon" />,
    Truck: () => <div data-testid="truck-icon" />,
    CheckCircle: () => <div data-testid="check-circle-icon" />,
    Archive: () => <div data-testid="archive-icon" />,
    Package: () => <div data-testid="package-icon" />
}));

describe('OrderTracking Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.currentUser = { uid: 'user123' };

        // Default: empty orders
        mocks.getDocs.mockResolvedValue({
            docs: []
        });
    });

    describe('Authentication', () => {
        it('should redirect to /login when user is not authenticated', async () => {
            mocks.currentUser = null;

            render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(mocks.navigate).toHaveBeenCalledWith('/login');
            });
        });

        it('should not redirect when user is authenticated', async () => {
            render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(mocks.getDocs).toHaveBeenCalled();
            });

            expect(mocks.navigate).not.toHaveBeenCalledWith('/login');
        });
    });

    describe('Loading State', () => {
        it('should display loading spinner while fetching orders', () => {
            // Mock getDocs to never resolve (simulate loading)
            mocks.getDocs.mockImplementation(() => new Promise(() => { }));

            render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            expect(screen.getByText(/Loading your orders.../i)).toBeInTheDocument();
            expect(screen.getByText(/Loading your orders.../i).previousElementSibling).toHaveClass('spinner');
        });
    });

    describe('Empty State', () => {
        it('should display empty state when no orders exist', async () => {
            mocks.getDocs.mockResolvedValue({
                docs: []
            });

            render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/No orders found/i)).toBeInTheDocument();
            });

            expect(screen.getByText(/Looks like you haven't bought anything yet./i)).toBeInTheDocument();
            expect(screen.getByTestId('archive-icon')).toBeInTheDocument();
            expect(screen.getByText(/Start Shopping/i)).toBeInTheDocument();
        });

        it('should navigate to /shop when clicking Start Shopping button', async () => {
            mocks.getDocs.mockResolvedValue({
                docs: []
            });

            render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/No orders found/i)).toBeInTheDocument();
            });

            const shopButton = screen.getByText(/Start Shopping/i);
            fireEvent.click(shopButton);

            expect(mocks.navigate).toHaveBeenCalledWith('/shop');
        });
    });

    describe('Order List Display', () => {
        const mockOrders = [
            {
                id: 'order123abc',
                userId: 'user123',
                status: 'shipped',
                createdAt: new Date('2024-01-15'),
                totalAmount: 50000,
                items: [
                    { name: 'Gaming Laptop', price: 30000, quantity: 1 },
                    { name: 'Mouse', price: 500, quantity: 2 }
                ]
            },
            {
                id: 'order456def',
                userId: 'user123',
                status: 'delivered',
                createdAt: new Date('2024-01-10'),
                totalAmount: 25000,
                items: [
                    { name: 'Keyboard', price: 2500, quantity: 2 }
                ]
            }
        ];

        beforeEach(() => {
            mocks.getDocs.mockResolvedValue({
                docs: mockOrders.map(order => ({
                    id: order.id,
                    data: () => ({
                        ...order,
                        createdAt: { toDate: () => order.createdAt }
                    })
                }))
            });
        });

        it('should render orders list correctly', async () => {
            render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/My Orders/i)).toBeInTheDocument();
            });

            // Should display both orders
            expect(screen.getByText(/ORDER123/i)).toBeInTheDocument();
            expect(screen.getByText(/ORDER456/i)).toBeInTheDocument();
        });

        it('should format order ID correctly (first 8 chars uppercase)', async () => {
            render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/Order #ORDER123/i)).toBeInTheDocument();
            });
        });

        it('should display order date, items count, and total amount', async () => {
            render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            await waitFor(() => {
                const dates = screen.getAllByText(/January 15, 2024/i);
                expect(dates.length).toBeGreaterThan(0);
                expect(dates[0]).toBeInTheDocument();
            });

            // Check items count (2 items in first order)
            expect(screen.getByText(/2 Items/i)).toBeInTheDocument();

            // Check total amount
            expect(screen.getByText(/50,000/)).toBeInTheDocument();
            expect(screen.getByText(/25,000/)).toBeInTheDocument();
        });

        it('should display order items with name, quantity, and price', async () => {
            render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/Gaming Laptop/i)).toBeInTheDocument();
            });

            // Check quantities
            expect(screen.getByText(/x1/i)).toBeInTheDocument();
            expect(screen.getAllByText(/x2/i)[0]).toBeInTheDocument();

            // Check item totals (price * quantity)
            expect(screen.getByText(/30,000/)).toBeInTheDocument(); // Laptop: 30000 * 1
            expect(screen.getByText(/1,000/)).toBeInTheDocument(); // Mouse: 500 * 2
        });
    });

    describe('Status Timeline', () => {
        it('should calculate progress width correctly based on status', async () => {
            const ordersWithDifferentStatuses = [
                {
                    id: 'order1',
                    status: 'pending',
                    createdAt: new Date(),
                    totalAmount: 1000,
                    items: [{ name: 'Item 1', price: 1000, quantity: 1 }]
                },
                {
                    id: 'order2',
                    status: 'shipped',
                    createdAt: new Date(),
                    totalAmount: 2000,
                    items: [{ name: 'Item 2', price: 2000, quantity: 1 }]
                },
                {
                    id: 'order3',
                    status: 'delivered',
                    createdAt: new Date(),
                    totalAmount: 3000,
                    items: [{ name: 'Item 3', price: 3000, quantity: 1 }]
                }
            ];

            mocks.getDocs.mockResolvedValue({
                docs: ordersWithDifferentStatuses.map(order => ({
                    id: order.id,
                    data: () => ({
                        ...order,
                        createdAt: { toDate: () => order.createdAt }
                    })
                }))
            });

            const { container } = render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/My Orders/i)).toBeInTheDocument();
            });

            // Find all timeline progress bars
            const progressBars = container.querySelectorAll('.timeline-progress');

            // pending (index 0): 0% progress
            expect(progressBars[0]).toHaveStyle({ width: '0%' });

            // shipped (index 1): 33.33% progress (1/3)
            expect(progressBars[1]).toHaveStyle({ width: '33.33333333333333%' });

            // delivered (index 3): 100% progress (3/3)
            expect(progressBars[2]).toHaveStyle({ width: '100%' });
        });

        it('should apply correct CSS classes to timeline steps', async () => {
            const orderShipped = {
                id: 'order1',
                status: 'shipped',
                createdAt: new Date(),
                totalAmount: 1000,
                items: [{ name: 'Item', price: 1000, quantity: 1 }]
            };

            mocks.getDocs.mockResolvedValue({
                docs: [{
                    id: orderShipped.id,
                    data: () => ({
                        ...orderShipped,
                        createdAt: { toDate: () => orderShipped.createdAt }
                    })
                }]
            });

            const { container } = render(
                <MemoryRouter>
                    <OrderTracking />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText(/My Orders/i)).toBeInTheDocument();
            });

            const timelineSteps = container.querySelectorAll('.timeline-step');

            // For 'shipped' status (index 1):
            // Step 0 (Processing): completed + active
            expect(timelineSteps[0]).toHaveClass('active');
            expect(timelineSteps[0]).toHaveClass('completed');

            // Step 1 (Shipped): active but not completed
            expect(timelineSteps[1]).toHaveClass('active');
            expect(timelineSteps[1]).not.toHaveClass('completed');

            // Step 2 (Out for Delivery): not active
            expect(timelineSteps[2]).not.toHaveClass('active');

            // Step 3 (Delivered): not active
            expect(timelineSteps[3]).not.toHaveClass('active');
        });
    });
});
