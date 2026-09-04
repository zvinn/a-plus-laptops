import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock translations to make testing deterministic
vi.mock('../translations', () => ({
    translations: {
        en: {
            hello: "Hello",
            nested: {
                key: "Nested Value"
            }
        },
        ar: {
            hello: "مرحبا"
        }
    }
}));

describe('LanguageContext', () => {
    beforeEach(() => {
        window.localStorage.clear();
        vi.clearAllMocks();
        document.documentElement.dir = '';
        document.documentElement.lang = '';
    });

    it('should start with default language (en)', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });
        expect(result.current.language).toBe('en');
    });

    it('should toggle language', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });

        act(() => {
            result.current.toggleLanguage();
        });

        expect(result.current.language).toBe('ar');
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('ar');

        act(() => {
            result.current.toggleLanguage();
        });

        expect(result.current.language).toBe('en');
        expect(document.documentElement.dir).toBe('ltr');
    });

    it('should translate keys correctly', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });

        expect(result.current.t('hello')).toBe('Hello');
        expect(result.current.t('nested.key')).toBe('Nested Value');

        // Test fallback for missing key
        expect(result.current.t('missing.key')).toBe('missing.key');
    });

    it('should translate keys correctly in Arabic', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });

        act(() => {
            result.current.toggleLanguage();
        });

        expect(result.current.t('hello')).toBe('مرحبا');

        // Fallback to English if missing in Arabic
        expect(result.current.t('nested.key')).toBe('nested.key'); // The mock implementation in actual code falls back to en if entire dictionary is missing, but here 'ar' exists, just key is missing? 
        // Let's re-read the code. 
        // const current = translations[language] || translations['en']; 
        // It selects the dictionary ONCE. If 'ar' exists, it uses 'ar'. It does NOT fallback per key. 
        // So 'nested.key' in 'ar' will be undefined -> returns path.
    });

    it('should persist language to localStorage', () => {
        const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });

        act(() => {
            result.current.toggleLanguage();
        });

        expect(window.localStorage.setItem).toHaveBeenCalledWith('app_lang', 'ar');
    });

    it('should load language from localStorage', () => {
        window.localStorage.getItem.mockReturnValue('ar');
        const { result } = renderHook(() => useLanguage(), { wrapper: LanguageProvider });

        expect(result.current.language).toBe('ar');
    });
});
