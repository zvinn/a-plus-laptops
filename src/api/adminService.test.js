import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './adminService';
import { getDoc, getDocs, deleteDoc, setDoc } from 'firebase/firestore';

vi.mock('../firebase', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    setDoc: vi.fn(),
    deleteDoc: vi.fn(),
    collection: vi.fn(),
    doc: vi.fn(),
    serverTimestamp: vi.fn()
}));

const SUPER_ADMIN = 'mhamed.saad.ibrahim@gmail.com';

describe('adminService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('checkAdminStatus', () => {
        it('should return Super Admin status for specific email', async () => {
            const result = await adminService.checkAdminStatus(SUPER_ADMIN);
            expect(result).toEqual({ isAdmin: true, isSuperAdmin: true });
        });

        it('should return isAdmin true for existing admin in Firestore', async () => {
            getDoc.mockResolvedValueOnce({ exists: () => true });
            const result = await adminService.checkAdminStatus('test@admin.com');
            expect(result).toEqual({ isAdmin: true, isSuperAdmin: false });
        });

        it('should return false for non-admin', async () => {
            getDoc.mockResolvedValueOnce({ exists: () => false });
            const result = await adminService.checkAdminStatus('user@test.com');
            expect(result).toEqual({ isAdmin: false, isSuperAdmin: false });
        });
    });

    describe('getAdmins', () => {
        it('should fetch admins list', async () => {
            getDocs.mockResolvedValueOnce({
                docs: [{ id: 'test@admin.com', data: () => ({ addedBy: 'System' }) }]
            });
            const result = await adminService.getAdmins();
            expect(result).toHaveLength(1);
            expect(result[0].email).toBe('test@admin.com');
        });
    });

    describe('addAdmin', () => {
        it('should add admin document', async () => {
            await adminService.addAdmin('new@admin.com', 'admin@test.com');
            expect(setDoc).toHaveBeenCalled();
        });
    });

    describe('removeAdmin', () => {
        it('should prevent removing super admin', async () => {
            await expect(adminService.removeAdmin(SUPER_ADMIN))
                .rejects.toThrow('Cannot remove Super Admin');
        });

        it('should delete admin document', async () => {
            await adminService.removeAdmin('other@admin.com');
            expect(deleteDoc).toHaveBeenCalled();
        });
    });
});
