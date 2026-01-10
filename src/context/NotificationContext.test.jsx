import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Helper to create mock Firestore timestamp
const createMockTimestamp = (date) => ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0
});

// Use vi.hoisted() for all mocks
const mocks = vi.hoisted(() => {
    const mockUnsubscribe = vi.fn();
    const mockOnSnapshot = vi.fn();
    const mockUpdateDoc = vi.fn();
    const mockBatchUpdate = vi.fn();
    const mockBatchCommit = vi.fn();
    const mockAddDoc = vi.fn();
    const mockGetToken = vi.fn();
    const mockOnMessage = vi.fn();

    return {
        // Firebase Firestore mocks
        onSnapshot: mockOnSnapshot,
        updateDoc: mockUpdateDoc,
        writeBatch: vi.fn(() => ({
            update: mockBatchUpdate,
            commit: mockBatchCommit
        })),
        addDoc: mockAddDoc,
        serverTimestamp: vi.fn(() => new Date()),

        // Firebase Messaging mocks
        getToken: mockGetToken,
        onMessage: mockOnMessage,

        // Auth context mock
        currentUser: { uid: 'user123' },

        // Toast context mock
        toastInfo: vi.fn(),

        // Helper
        unsubscribe: mockUnsubscribe
    };
});

// Mock Firebase modules
vi.mock('../firebase', () => ({
    app: {},
    messaging: {}
}));

vi.mock('firebase/messaging', () => ({
    getToken: mocks.getToken,
    onMessage: mocks.onMessage
}));

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn((db, path) => ({ path })),
    query: vi.fn((...args) => ({ args })),
    where: vi.fn(),
    orderBy: vi.fn(),
    doc: vi.fn((db, collection, id) => ({ collection, id })),
    onSnapshot: mocks.onSnapshot,
    updateDoc: mocks.updateDoc,
    writeBatch: mocks.writeBatch,
    addDoc: mocks.addDoc,
    serverTimestamp: mocks.serverTimestamp
}));

// Mock AuthContext
vi.mock('./AuthContext', () => ({
    useAuth: () => ({ currentUser: mocks.currentUser })
}));

// Mock ToastContext
vi.mock('./ToastContext', () => ({
    useToast: () => ({ info: mocks.toastInfo })
}));

// Mock global Notification API
global.Notification = {
    requestPermission: vi.fn(() => Promise.resolve('granted'))
};

// NOW import the module under test
import { NotificationProvider, useNotifications } from './NotificationContext';

describe('NotificationContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.currentUser = { uid: 'user123' };

        // Default onSnapshot behavior - call callback immediately with empty snapshot
        mocks.onSnapshot.mockImplementation((query, callback) => {
            const mockSnapshot = {
                docs: [],
                docChanges: () => []
            };
            callback(mockSnapshot);
            return mocks.unsubscribe;
        });
    });

    describe('Provider Setup', () => {
        it('should provide notification context to children', async () => {
            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current).toBeDefined();
                expect(result.current).toHaveProperty('notifications');
                expect(result.current).toHaveProperty('unreadCount');
                expect(result.current).toHaveProperty('markAsRead');
                expect(result.current).toHaveProperty('markAllAsRead');
                expect(result.current).toHaveProperty('triggerNotification');
            });
        });

        it('should start with empty notifications and zero unread count', async () => {
            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current.notifications).toEqual([]);
                expect(result.current.unreadCount).toBe(0);
            });
        });
    });

    describe('Authentication Integration', () => {
        it('should setup Firestore listener when user is logged in', async () => {
            renderHook(() => useNotifications(), { wrapper: NotificationProvider });

            await waitFor(() => {
                expect(mocks.onSnapshot).toHaveBeenCalled();
            });
        });

        it('should clear notifications when user logs out', async () => {
            mocks.currentUser = null;

            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current.notifications).toEqual([]);
                expect(result.current.unreadCount).toBe(0);
            });
        });

        it('should cleanup listener on unmount', async () => {
            const { unmount } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(mocks.onSnapshot).toHaveBeenCalled();
            });

            unmount();
            expect(mocks.unsubscribe).toHaveBeenCalled();
        });
    });

    describe('Notification State Management', () => {
        it('should update notifications from Firestore snapshot', async () => {
            const mockNotifications = [
                {
                    id: '1',
                    userId: 'user123',
                    title: 'Test 1',
                    message: 'Message 1',
                    read: false,
                    createdAt: createMockTimestamp(new Date('2024-01-01'))
                },
                {
                    id: '2',
                    userId: 'user123',
                    title: 'Test 2',
                    message: 'Message 2',
                    read: true,
                    createdAt: createMockTimestamp(new Date('2024-01-02'))
                }
            ];

            mocks.onSnapshot.mockImplementation((query, callback) => {
                const mockSnapshot = {
                    docs: mockNotifications.map(note => ({
                        id: note.id,
                        data: () => note
                    })),
                    docChanges: () => []
                };
                callback(mockSnapshot);
                return mocks.unsubscribe;
            });

            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current.notifications).toHaveLength(2);
                expect(result.current.notifications[0].title).toBe('Test 1');
            });
        });

        it('should calculate unread count correctly', async () => {
            const mockNotifications = [
                { id: '1', read: false, createdAt: createMockTimestamp(new Date()) },
                { id: '2', read: false, createdAt: createMockTimestamp(new Date()) },
                { id: '3', read: true, createdAt: createMockTimestamp(new Date()) }
            ];

            mocks.onSnapshot.mockImplementation((query, callback) => {
                const mockSnapshot = {
                    docs: mockNotifications.map(note => ({
                        id: note.id,
                        data: () => note
                    })),
                    docChanges: () => []
                };
                callback(mockSnapshot);
                return mocks.unsubscribe;
            });

            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current.unreadCount).toBe(2);
            });
        });

        it('should show toast for new notifications (< 10 seconds old)', async () => {
            const recentNotification = {
                id: '1',
                title: 'New Notification',
                message: 'Just arrived',
                read: false,
                createdAt: createMockTimestamp(new Date()) // Current time
            };

            mocks.onSnapshot.mockImplementation((query, callback) => {
                const mockSnapshot = {
                    docs: [{
                        id: recentNotification.id,
                        data: () => recentNotification
                    }],
                    docChanges: () => [{
                        type: 'added',
                        doc: {
                            data: () => recentNotification
                        }
                    }]
                };
                callback(mockSnapshot);
                return mocks.unsubscribe;
            });

            renderHook(() => useNotifications(), { wrapper: NotificationProvider });

            await waitFor(() => {
                expect(mocks.toastInfo).toHaveBeenCalledWith('New Notification');
            });
        });

        it('should not show toast for old notifications (> 10 seconds old)', async () => {
            const oldNotification = {
                id: '1',
                title: 'Old Notification',
                read: false,
                createdAt: createMockTimestamp(new Date(Date.now() - 20000)) // 20 seconds ago
            };

            mocks.onSnapshot.mockImplementation((query, callback) => {
                const mockSnapshot = {
                    docs: [{
                        id: oldNotification.id,
                        data: () => oldNotification
                    }],
                    docChanges: () => [{
                        type: 'added',
                        doc: {
                            data: () => oldNotification
                        }
                    }]
                };
                callback(mockSnapshot);
                return mocks.unsubscribe;
            });

            renderHook(() => useNotifications(), { wrapper: NotificationProvider });

            await waitFor(() => {
                expect(mocks.toastInfo).not.toHaveBeenCalled();
            });
        });
    });

    describe('Mark as Read Operations', () => {
        it('should mark single notification as read', async () => {
            mocks.updateDoc.mockResolvedValue(undefined);

            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current.markAsRead).toBeDefined();
            });

            await act(async () => {
                await result.current.markAsRead('notification-123');
            });

            expect(mocks.updateDoc).toHaveBeenCalledWith(
                expect.objectContaining({ collection: 'notifications', id: 'notification-123' }),
                { read: true }
            );
        });

        it('should handle errors when marking as read fails', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            mocks.updateDoc.mockRejectedValue(new Error('Firestore error'));

            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current.markAsRead).toBeDefined();
            });

            await act(async () => {
                await result.current.markAsRead('notification-123');
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error marking read:', expect.any(Error));
            consoleErrorSpy.mockRestore();
        });

        it('should mark all notifications as read using batch', async () => {
            const mockNotifications = [
                { id: '1', read: false },
                { id: '2', read: false },
                { id: '3', read: true }
            ];

            mocks.onSnapshot.mockImplementation((query, callback) => {
                const mockSnapshot = {
                    docs: mockNotifications.map(note => ({
                        id: note.id,
                        data: () => note
                    })),
                    docChanges: () => []
                };
                callback(mockSnapshot);
                return mocks.unsubscribe;
            });

            const mockBatch = {
                update: vi.fn(),
                commit: vi.fn().mockResolvedValue(undefined)
            };
            mocks.writeBatch.mockReturnValue(mockBatch);

            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current.notifications).toHaveLength(3);
            });

            await act(async () => {
                await result.current.markAllAsRead();
            });

            // Should only update unread notifications (2 out of 3)
            expect(mockBatch.update).toHaveBeenCalledTimes(2);
            expect(mockBatch.commit).toHaveBeenCalled();
        });
    });

    describe('Trigger Notification', () => {
        it('should create new notification in Firestore', async () => {
            mocks.addDoc.mockResolvedValue({ id: 'new-notification-id' });

            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current.triggerNotification).toBeDefined();
            });

            await act(async () => {
                await result.current.triggerNotification(
                    'user456',
                    'Test Title',
                    'Test Message',
                    'success'
                );
            });

            expect(mocks.addDoc).toHaveBeenCalledWith(
                expect.objectContaining({ path: 'notifications' }),
                expect.objectContaining({
                    userId: 'user456',
                    title: 'Test Title',
                    message: 'Test Message',
                    type: 'success',
                    read: false
                })
            );
        });

        it('should use default type "info" if not provided', async () => {
            mocks.addDoc.mockResolvedValue({ id: 'new-notification-id' });

            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current.triggerNotification).toBeDefined();
            });

            await act(async () => {
                await result.current.triggerNotification(
                    'user456',
                    'Test Title',
                    'Test Message'
                );
            });

            expect(mocks.addDoc).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ type: 'info' })
            );
        });

        it('should handle errors when creating notification fails', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            mocks.addDoc.mockRejectedValue(new Error('Firestore error'));

            const { result } = renderHook(() => useNotifications(), {
                wrapper: NotificationProvider
            });

            await waitFor(() => {
                expect(result.current.triggerNotification).toBeDefined();
            });

            await act(async () => {
                await result.current.triggerNotification('user456', 'Test', 'Message');
            });

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending notification:', expect.any(Error));
            consoleErrorSpy.mockRestore();
        });
    });
});
