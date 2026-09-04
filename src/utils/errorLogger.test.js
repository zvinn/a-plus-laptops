import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logError, getErrorHistory, clearErrorHistory, isRetryableError, generateWhatsAppReport } from './errorLogger';

describe('errorLogger utility', () => {
    beforeEach(() => {
        clearErrorHistory();
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    it('should log an error and return log object', () => {
        const error = new Error('Test Error');
        const log = logError(error, { componentStack: 'App > Main' }, 'TestBoundary');

        expect(log.message).toBe('Test Error');
        expect(log.boundary).toBe('TestBoundary');
        expect(log.componentStack).toBe('App > Main');
        expect(getErrorHistory()).toHaveLength(1);
    });

    it('should maintain history limit', () => {
        for (let i = 0; i < 30; i++) {
            logError(new Error(`Error ${i}`));
        }
        expect(getErrorHistory()).toHaveLength(20); // MAX_STORED_ERRORS
    });

    it('should identify retryable errors', () => {
        expect(isRetryableError(new Error('Failed to fetch'))).toBe(true);
        expect(isRetryableError(new Error('Network error'))).toBe(true);
        expect(isRetryableError(new Error('Syntax error'))).toBe(false);
    });

    it('should generate WhatsApp report link', () => {
        const error = new Error('Urgent Error');
        const log = logError(error);
        const link = generateWhatsAppReport(log, 'User needs help');

        expect(link).toContain('wa.me');
        expect(link).toContain(encodeURIComponent('Urgent Error'));
        expect(link).toContain(encodeURIComponent('User needs help'));
    });
});
