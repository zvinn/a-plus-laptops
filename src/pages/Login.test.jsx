import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';

// Mock Hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// Mock Contexts
const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockResetPassword = vi.fn();
const mockGoogleSignIn = vi.fn();

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
        signup: mockSignup,
        resetPassword: mockResetPassword,
        googleSignIn: mockGoogleSignIn
    })
}));

const mockSuccess = vi.fn();
const mockError = vi.fn();
vi.mock('../context/ToastContext', () => ({
    useToast: () => ({
        success: mockSuccess,
        error: mockError
    })
}));

const mockT = vi.fn((key) => key);
vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => ({ t: mockT })
}));

vi.mock('../components/SEO', () => ({
    default: () => <div data-testid="seo" />
}));

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render login form by default', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('should toggle to sign up', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument(); // The submit button
    });

    it('should show validation errors', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Submit empty form
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(mockT).toHaveBeenCalledWith('errors.required');
        });
    });

    it('should handle successful login', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

        mockLogin.mockResolvedValueOnce();

        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        });

        await waitFor(() => {
            expect(mockSuccess).toHaveBeenCalledWith(expect.stringContaining('Successfully logged in'));
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('should handle successful signup', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        // Switch to signup
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@example.com' } });
        // Assuming signup requires valid strong password
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'StrongPass123!' } });

        mockSignup.mockResolvedValueOnce();

        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        await waitFor(() => {
            expect(mockSignup).toHaveBeenCalledWith('new@example.com', 'StrongPass123!');
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('should handle Google Sign In', async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        mockGoogleSignIn.mockResolvedValueOnce({ user: { email: 'google@test.com' } });

        const googleBtn = screen.getByText('common.continueUsingGoogle');
        fireEvent.click(googleBtn);

        await waitFor(() => {
            expect(mockGoogleSignIn).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('should open forgot password modal', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Forgot Password?'));

        expect(screen.getByText('Reset Password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    });

    it('should submit password reset request', async () => {
        mockResetPassword.mockResolvedValueOnce();

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Forgot Password?'));

        const emailInput = screen.getByPlaceholderText('you@example.com');
        fireEvent.change(emailInput, { target: { value: 'reset@test.com' } });

        const resetBtn = screen.getByText('Send Reset Link');
        fireEvent.click(resetBtn);

        await waitFor(() => {
            expect(mockResetPassword).toHaveBeenCalledWith('reset@test.com');
        });
    });

});
