import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { useNotifications } from '../context/NotificationContext';

// Mock NotificationContext
vi.mock('../context/NotificationContext', () => ({
    useNotifications: vi.fn()
}));

// Mock Heroicons
vi.mock('@heroicons/react/24/outline', () => ({
    BellIcon: () => <span data-testid="icon-bell" />
}));

describe('NotificationBell Component', () => {
    const mockMarkAsRead = vi.fn();
    const mockMarkAllAsRead = vi.fn();

    const mockNotifications = [
        { id: '1', title: 'Test 1', message: 'Msg 1', read: false, createdAt: { toDate: () => new Date() } },
        { id: '2', title: 'Test 2', message: 'Msg 2', read: true, createdAt: { toDate: () => new Date() } }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useNotifications.mockReturnValue({
            notifications: mockNotifications,
            unreadCount: 1,
            markAsRead: mockMarkAsRead,
            markAllAsRead: mockMarkAllAsRead
        });
    });

    it('should show unread count badge', () => {
        render(
            <MemoryRouter>
                <NotificationBell />
            </MemoryRouter>
        );
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByLabelText(/Notifications/i)).toBeInTheDocument();
    });

    it('should toggle dropdown on click', () => {
        render(
            <MemoryRouter>
                <NotificationBell />
            </MemoryRouter>
        );

        const bellBtn = screen.getByLabelText(/Notifications/i);
        fireEvent.click(bellBtn);

        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Test 1')).toBeInTheDocument();
        expect(screen.getByText('Test 2')).toBeInTheDocument();
    });

    it('should call markAsRead when individual notification is clicked', () => {
        render(
            <MemoryRouter>
                <NotificationBell />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByLabelText(/Notifications/i));

        const noteItem = screen.getByText('Test 1').closest('.notification-item');
        fireEvent.click(noteItem);

        expect(mockMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('should call markAllAsRead when "Mark all read" is clicked', () => {
        render(
            <MemoryRouter>
                <NotificationBell />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByLabelText(/Notifications/i));

        const markAllBtn = screen.getByText(/Mark all read/i);
        fireEvent.click(markAllBtn);

        expect(mockMarkAllAsRead).toHaveBeenCalled();
    });

    it('should show empty state when no notifications', () => {
        useNotifications.mockReturnValue({
            notifications: [],
            unreadCount: 0,
            markAsRead: mockMarkAsRead,
            markAllAsRead: mockMarkAllAsRead
        });

        render(
            <MemoryRouter>
                <NotificationBell />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByLabelText(/Notifications/i));
        expect(screen.getByText(/No notifications yet/i)).toBeInTheDocument();
    });
});
