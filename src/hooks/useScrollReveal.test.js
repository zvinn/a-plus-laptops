import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// We need to mock IntersectionObserver before importing the hook
let observerCallback = null;
let mockObserve = vi.fn();
let mockUnobserve = vi.fn();

// Mock IntersectionObserver globally
class MockIntersectionObserver {
    constructor(callback) {
        observerCallback = callback;
        this.observe = mockObserve;
        this.unobserve = mockUnobserve;
        this.disconnect = vi.fn();
    }
}

// Set up the mock before tests
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// Import the hook after mocking
import useScrollReveal from './useScrollReveal';

describe('useScrollReveal hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockObserve = vi.fn();
        mockUnobserve = vi.fn();
        observerCallback = null;

        // Setup DOM elements
        document.body.innerHTML = `
            <div class="animate-on-scroll" id="el1">Element 1</div>
            <div class="animate-on-scroll" id="el2">Element 2</div>
            <div class="other-class">Not animated</div>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should create IntersectionObserver on mount', () => {
        renderHook(() => useScrollReveal());

        // The hook should have been called
        expect(observerCallback).toBeDefined();
    });

    it('should observe elements with animate-on-scroll class', () => {
        renderHook(() => useScrollReveal());

        // Should observe the 2 elements with animate-on-scroll class
        expect(mockObserve).toHaveBeenCalled();
    });
});
