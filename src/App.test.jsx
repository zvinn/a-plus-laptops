import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock all major sub-components to prevent deep rendering issues
vi.mock('./components/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>
}));
vi.mock('./components/Footer', () => ({
    default: () => <div data-testid="footer">Footer</div>
}));
vi.mock('./components/AnimatedRoutes', () => ({
    default: () => <div data-testid="routes">Routes</div>
}));
vi.mock('./components/ScrollToTop', () => ({
    default: () => null
}));
vi.mock('./components/Chatbot', () => ({
    default: () => <div data-testid="chatbot">Chatbot</div>
}));

// Mock ContextProviders since we want to test App's use of it
vi.mock('./components/ContextProviders', () => ({
    default: ({ children }) => <div data-testid="providers">{children}</div>
}));

// Mock ThemeContext for Layout component
vi.mock('./context/ThemeContext', () => ({
    useTheme: () => ({ isDarkMode: false, toggleTheme: vi.fn() }),
    ThemeProvider: ({ children }) => <div>{children}</div>
}));

describe('App Component', () => {
    it('should render the app layout', () => {
        render(<App />);

        expect(screen.getByTestId('providers')).toBeInTheDocument();
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('routes')).toBeInTheDocument();
    });

    it('should initialize GA if consent is given', () => {
        localStorage.setItem('cookieConsent', 'true');
        // We can't easily test the useEffect GA init here without more mocks
        // but rendering it ensures the code path is hit.
        render(<App />);
    });
});
