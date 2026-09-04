import { describe, it, expect, vi } from 'vitest';
import { db, auth, storage } from './firebase';

// Mock firebase/app
vi.mock('firebase/app', () => ({
    initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
    getApps: vi.fn(() => []),
    getApp: vi.fn(() => ({ name: '[DEFAULT]' }))
}));

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(() => ({})),
    connectFirestoreEmulator: vi.fn()
}));

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({})),
    connectAuthEmulator: vi.fn(),
    GoogleAuthProvider: vi.fn()
}));

// Mock firebase/storage
vi.mock('firebase/storage', () => ({
    getStorage: vi.fn(() => ({})),
    connectStorageEmulator: vi.fn()
}));

describe('Firebase Configuration', () => {
    it('should export db', () => {
        expect(db).toBeDefined();
    });

    it('should export auth', () => {
        expect(auth).toBeDefined();
    });
});
