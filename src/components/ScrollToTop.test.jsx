import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';

describe('ScrollToTop Component', () => {
    it('should call window.scrollTo(0, 0) on mount and route change', () => {
        const scrollToMock = vi.fn();
        window.scrollTo = scrollToMock;

        render(
            <MemoryRouter initialEntries={['/']}>
                <ScrollToTop />
            </MemoryRouter>
        );

        expect(scrollToMock).toHaveBeenCalledWith(0, 0);
    });
});
