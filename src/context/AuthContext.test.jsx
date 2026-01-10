import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Create mocks using vi.hoisted - must be at the very top
const mocks = vi.hoisted(() => {
    return {
        auth: { currentUser: null },
        createUserWithEmailAndPassword: vi.fn(),
        signInWithEmailAndPassword: vi.fn(),
        signOut: vi.fn(),
        sendPasswordResetEmail: vi.fn(),
        signInWithPopup: vi.fn(),
        onAuthStateChanged: vi.fn(),
        GoogleAuthProvider: vi.fn(),
    };
});

// Mock Firebase module
vi.mock('../firebase', () => ({
    auth: mocks.auth,
}));

// Mock Firebase Auth functions
vi.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
    signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
    signOut: mocks.signOut,
    sendPasswordResetEmail: mocks.sendPasswordResetEmail,
    signInWithPopup: mocks.signInWithPopup,
    onAuthStateChanged: mocks.onAuthStateChanged,
    GoogleAuthProvider: mocks.GoogleAuthProvider,
}));

// NOW import the module under test
import { AuthProvider, useAuth } from './AuthContext';

describe('AuthContext', () => {
    let unsubscribeMock;

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock for onAuthStateChanged
        unsubscribeMock = vi.fn();
        mocks.onAuthStateChanged.mockImplementation((auth, callback) => {
            // Simulate no user initially
            setTimeout(() => callback(null), 0);
            return unsubscribeMock;
        });
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe('Provider Setup', () => {
        it('should provide auth context to children', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(result.current).toBeDefined();
                expect(result.current).toHaveProperty('currentUser');
                expect(result.current).toHaveProperty('signup');
                expect(result.current).toHaveProperty('login');
                expect(result.current).toHaveProperty('logout');
                expect(result.current).toHaveProperty('resetPassword');
                expect(result.current).toHaveProperty('googleSignIn');
            });
        });

        it('should start with null currentUser when no user is logged in', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(result.current.currentUser).toBeNull();
            });
        });

        it('should set currentUser when user is authenticated', async () => {
            const mockUser = {
                uid: '123',
                email: 'test@example.com',
                displayName: 'Test User'
            };

            mocks.onAuthStateChanged.mockImplementation((auth, callback) => {
                setTimeout(() => callback(mockUser), 0);
                return unsubscribeMock;
            });

            const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(result.current.currentUser).toEqual(mockUser);
            });
        });

        it('should cleanup auth listener on unmount', async () => {
            const { unmount } = renderHook(() => useAuth(), { wrapper: AuthProvider });

            await waitFor(() => {
                expect(mocks.onAuthStateChanged).toHaveBeenCalled();
            });

            unmount();
            expect(unsubscribeMock).toHaveBeenCalled();
        });
    });

    describe('Authentication Methods', () => {
        describe('signup', () => {
            it('should call createUserWithEmailAndPassword with correct arguments', async () => {
                const email = 'newuser@example.com';
                const password = 'password123';
                const mockUserCredential = { user: { uid: '123', email } };

                mocks.createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);

                const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

                await waitFor(() => {
                    expect(result.current.signup).toBeDefined();
                });

                let signupResult;
                await act(async () => {
                    signupResult = await result.current.signup(email, password);
                });

                expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(mocks.auth, email, password);
                expect(signupResult).toEqual(mockUserCredential);
            });

            it('should throw error when signup fails', async () => {
                const error = new Error('Email already in use');
                mocks.createUserWithEmailAndPassword.mockRejectedValue(error);

                const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

                await waitFor(() => {
                    expect(result.current.signup).toBeDefined();
                });

                await expect(async () => {
                    await act(async () => {
                        await result.current.signup('test@example.com', 'password');
                    });
                }).rejects.toThrow('Email already in use');
            });
        });

        describe('login', () => {
            it('should call signInWithEmailAndPassword with correct arguments', async () => {
                const email = 'user@example.com';
                const password = 'password123';
                const mockUserCredential = { user: { uid: '456', email } };

                mocks.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);

                const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

                await waitFor(() => {
                    expect(result.current.login).toBeDefined();
                });

                let loginResult;
                await act(async () => {
                    loginResult = await result.current.login(email, password);
                });

                expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(mocks.auth, email, password);
                expect(loginResult).toEqual(mockUserCredential);
            });

            it('should throw error when login fails', async () => {
                const error = new Error('Invalid credentials');
                mocks.signInWithEmailAndPassword.mockRejectedValue(error);

                const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

                await waitFor(() => {
                    expect(result.current.login).toBeDefined();
                });

                await expect(async () => {
                    await act(async () => {
                        await result.current.login('wrong@example.com', 'wrongpassword');
                    });
                }).rejects.toThrow('Invalid credentials');
            });
        });

        describe('logout', () => {
            it('should call signOut', async () => {
                mocks.signOut.mockResolvedValue(undefined);

                const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

                await waitFor(() => {
                    expect(result.current.logout).toBeDefined();
                });

                await act(async () => {
                    await result.current.logout();
                });

                expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
            });

            it('should throw error when logout fails', async () => {
                const error = new Error('Logout failed');
                mocks.signOut.mockRejectedValue(error);

                const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

                await waitFor(() => {
                    expect(result.current.logout).toBeDefined();
                });

                await expect(async () => {
                    await act(async () => {
                        await result.current.logout();
                    });
                }).rejects.toThrow('Logout failed');
            });
        });

        describe('resetPassword', () => {
            it('should call sendPasswordResetEmail with correct email', async () => {
                const email = 'user@example.com';
                mocks.sendPasswordResetEmail.mockResolvedValue(undefined);

                const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

                await waitFor(() => {
                    expect(result.current.resetPassword).toBeDefined();
                });

                await act(async () => {
                    await result.current.resetPassword(email);
                });

                expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(mocks.auth, email);
            });

            it('should throw error when email is not found', async () => {
                const error = new Error('User not found');
                mocks.sendPasswordResetEmail.mockRejectedValue(error);

                const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

                await waitFor(() => {
                    expect(result.current.resetPassword).toBeDefined();
                });

                await expect(async () => {
                    await act(async () => {
                        await result.current.resetPassword('notfound@example.com');
                    });
                }).rejects.toThrow('User not found');
            });
        });

        describe('googleSignIn', () => {
            it('should call signInWithPopup with GoogleAuthProvider', async () => {
                const mockUserCredential = {
                    user: { uid: '789', email: 'google@example.com' }
                };
                mocks.signInWithPopup.mockResolvedValue(mockUserCredential);

                const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

                await waitFor(() => {
                    expect(result.current.googleSignIn).toBeDefined();
                });

                let googleSignInResult;
                await act(async () => {
                    googleSignInResult = await result.current.googleSignIn();
                });

                expect(mocks.signInWithPopup).toHaveBeenCalled();
                expect(googleSignInResult).toEqual(mockUserCredential);
            });

            it('should throw error when Google sign-in fails', async () => {
                const error = new Error('Popup closed by user');
                mocks.signInWithPopup.mockRejectedValue(error);

                const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

                await waitFor(() => {
                    expect(result.current.googleSignIn).toBeDefined();
                });

                await expect(async () => {
                    await act(async () => {
                        await result.current.googleSignIn();
                    });
                }).rejects.toThrow('Popup closed by user');
            });
        });
    });

    describe('Auth State Changes', () => {
        it('should update currentUser when auth state changes', async () => {
            let authCallback;
            mocks.onAuthStateChanged.mockImplementation((auth, callback) => {
                authCallback = callback;
                // Initially no user
                setTimeout(() => callback(null), 0);
                return unsubscribeMock;
            });

            const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

            // Wait for initial state
            await waitFor(() => {
                expect(result.current.currentUser).toBeNull();
            });

            // Simulate user login
            const mockUser = { uid: '999', email: 'newuser@example.com' };
            act(() => {
                authCallback(mockUser);
            });

            await waitFor(() => {
                expect(result.current.currentUser).toEqual(mockUser);
            });

            // Simulate user logout
            act(() => {
                authCallback(null);
            });

            await waitFor(() => {
                expect(result.current.currentUser).toBeNull();
            });
        });
    });
});
