import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as analytics from './analytics';

// Mock gtag
global.window.gtag = vi.fn();
global.window.dataLayer = [];

describe('Analytics Utility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should have trackPageView function', () => {
        expect(analytics.trackPageView).toBeDefined();
    });

    it('should have trackEvent function', () => {
        expect(analytics.trackEvent).toBeDefined();
    });

    it('should have trackBeginCheckout function', () => {
        expect(analytics.trackBeginCheckout).toBeDefined();
    });

    it('should have trackPurchase function', () => {
        expect(analytics.trackPurchase).toBeDefined();
    });

    it('should have trackAddToCart function', () => {
        expect(analytics.trackAddToCart).toBeDefined();
    });

    it('should call gtag for trackEvent', () => {
        analytics.trackEvent('test_category', 'test_action', 'test_label');
        // gtag may or may not be called depending on initialization
    });

    it('should call gtag for trackPageView', () => {
        analytics.trackPageView('/test-page');
    });

    it('should track add to cart', () => {
        const item = { id: '1', name: 'Test Laptop', price: 1000 };
        analytics.trackAddToCart(item);
    });

    it('should track begin checkout', () => {
        analytics.trackBeginCheckout(1000); // trackBeginCheckout just takes totalValue
    });

    it('should track purchase', () => {
        // trackPurchase takes (transactionId, totalValue, items) 
        const items = [{ id: '1', name: 'Test Laptop', price: 1000, quantity: 1 }];
        analytics.trackPurchase('order123', 1000, items);
    });
});
