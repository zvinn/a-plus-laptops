import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Initialize theme from localStorage or system preference
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme;
            }
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            return 'light';
        } catch {
            return 'light';
        }
    });

    const [isTransitioning, setIsTransitioning] = useState(false);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;

        // Remove both classes first
        body.classList.remove('dark-mode', 'light-mode');
        root.removeAttribute('data-theme');

        // Apply new theme
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            root.setAttribute('data-theme', 'dark');
        } else {
            body.classList.add('light-mode');
            root.setAttribute('data-theme', 'light');
        }

        // Save to localStorage
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }
    }, [theme]);

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            const savedTheme = localStorage.getItem('theme');
            // Only auto-switch if user hasn't set a preference
            if (!savedTheme) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Toggle theme with animation
    const toggleTheme = useCallback(() => {
        setIsTransitioning(true);

        // Small delay for animation
        setTimeout(() => {
            setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');

            setTimeout(() => {
                setIsTransitioning(false);
            }, 300);
        }, 50);
    }, []);

    // Set specific theme
    const setThemeMode = useCallback((newTheme) => {
        if (newTheme === 'dark' || newTheme === 'light') {
            setTheme(newTheme);
        }
    }, []);

    const isDark = theme === 'dark';

    const value = {
        theme,
        isDark,
        isTransitioning,
        toggleTheme,
        setTheme: setThemeMode
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeContext;
