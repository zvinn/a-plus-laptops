import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import AnalyticsListener from './AnalyticsListener';
import { useAuth } from '../context/AuthContext';
import { setUserId } from '../utils/analytics';

// Mock dependencies
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

vi.mock('../utils/analytics', () => ({
    setUserId: vi.fn()
}));

describe('AnalyticsListener', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render null', () => {
        useAuth.mockReturnValue({ currentUser: null });
        const { container } = render(<AnalyticsListener />);
        expect(container.firstChild).toBeNull();
    });

    it('should set user ID when user is logged in', () => {
        const mockUser = { uid: 'test-user-123' };
        useAuth.mockReturnValue({ currentUser: mockUser });

        render(<AnalyticsListener />);

        expect(setUserId).toHaveBeenCalledWith('test-user-123');
    });

    it('should set user ID to null when user is logged out', () => {
        useAuth.mockReturnValue({ currentUser: null });

        render(<AnalyticsListener />);

        expect(setUserId).toHaveBeenCalledWith(null);
    });

    it('should update user ID when currentUser changes', () => {
        const { rerender } = render(<AnalyticsListener />);

        // Initially logged out
        useAuth.mockReturnValue({ currentUser: null });
        rerender(<AnalyticsListener />);
        expect(setUserId).toHaveBeenCalledWith(null);

        // Then logged in
        useAuth.mockReturnValue({ currentUser: { uid: 'new-user' } });
        rerender(<AnalyticsListener />);
        expect(setUserId).toHaveBeenCalledWith('new-user');
    });
});
