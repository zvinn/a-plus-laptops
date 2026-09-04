import { describe, it, expect, vi } from 'vitest';
import * as lazyPages from './lazyPages';

// We can't actually test lazy loading in unit tests, but we can verify exports
describe('lazyPages utility', () => {
    it('should export Home lazy component', () => {
        expect(lazyPages.Home).toBeDefined();
        expect(lazyPages.Home.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export Shop lazy component', () => {
        expect(lazyPages.Shop).toBeDefined();
        expect(lazyPages.Shop.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export About lazy component', () => {
        expect(lazyPages.About).toBeDefined();
        expect(lazyPages.About.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export Contact lazy component', () => {
        expect(lazyPages.Contact).toBeDefined();
        expect(lazyPages.Contact.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export ProductDetails lazy component', () => {
        expect(lazyPages.ProductDetails).toBeDefined();
        expect(lazyPages.ProductDetails.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export LaptopFinder lazy component', () => {
        expect(lazyPages.LaptopFinder).toBeDefined();
        expect(lazyPages.LaptopFinder.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export Cart lazy component', () => {
        expect(lazyPages.Cart).toBeDefined();
        expect(lazyPages.Cart.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export Checkout lazy component', () => {
        expect(lazyPages.Checkout).toBeDefined();
        expect(lazyPages.Checkout.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export OrderSuccess lazy component', () => {
        expect(lazyPages.OrderSuccess).toBeDefined();
        expect(lazyPages.OrderSuccess.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export OrderTracking lazy component', () => {
        expect(lazyPages.OrderTracking).toBeDefined();
        expect(lazyPages.OrderTracking.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export Login lazy component', () => {
        expect(lazyPages.Login).toBeDefined();
        expect(lazyPages.Login.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export Profile lazy component', () => {
        expect(lazyPages.Profile).toBeDefined();
        expect(lazyPages.Profile.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export Wishlist lazy component', () => {
        expect(lazyPages.Wishlist).toBeDefined();
        expect(lazyPages.Wishlist.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export AdminDashboard lazy component', () => {
        expect(lazyPages.AdminDashboard).toBeDefined();
        expect(lazyPages.AdminDashboard.$$typeof).toBe(Symbol.for('react.lazy'));
    });

    it('should export NotFound lazy component', () => {
        expect(lazyPages.NotFound).toBeDefined();
        expect(lazyPages.NotFound.$$typeof).toBe(Symbol.for('react.lazy'));
    });
});
