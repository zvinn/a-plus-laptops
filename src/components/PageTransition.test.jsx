import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageTransition from './PageTransition';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, initial, animate, exit, transition, ...props }) => (
            <div
                data-testid="motion-div"
                data-initial={JSON.stringify(initial)}
                data-animate={JSON.stringify(animate)}
                data-exit={JSON.stringify(exit)}
                data-transition={JSON.stringify(transition)}
                {...props}
            >
                {children}
            </div>
        )
    }
}));

describe('PageTransition', () => {
    it('should render children correctly', () => {
        render(
            <PageTransition>
                <div data-testid="child-content">Page Content</div>
            </PageTransition>
        );

        expect(screen.getByTestId('child-content')).toBeInTheDocument();
        expect(screen.getByText('Page Content')).toBeInTheDocument();
    });

    it('should wrap children in motion.div', () => {
        render(
            <PageTransition>
                <span>Test</span>
            </PageTransition>
        );

        expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    });

    it('should have correct initial animation props', () => {
        render(
            <PageTransition>
                <div>Content</div>
            </PageTransition>
        );

        const motionDiv = screen.getByTestId('motion-div');
        const initial = JSON.parse(motionDiv.dataset.initial);

        expect(initial).toEqual({ opacity: 0, y: 20 });
    });

    it('should have correct animate props', () => {
        render(
            <PageTransition>
                <div>Content</div>
            </PageTransition>
        );

        const motionDiv = screen.getByTestId('motion-div');
        const animate = JSON.parse(motionDiv.dataset.animate);

        expect(animate).toEqual({ opacity: 1, y: 0 });
    });

    it('should have correct exit animation props', () => {
        render(
            <PageTransition>
                <div>Content</div>
            </PageTransition>
        );

        const motionDiv = screen.getByTestId('motion-div');
        const exit = JSON.parse(motionDiv.dataset.exit);

        expect(exit).toEqual({ opacity: 0, y: -20 });
    });

    it('should have 0.3s transition duration', () => {
        render(
            <PageTransition>
                <div>Content</div>
            </PageTransition>
        );

        const motionDiv = screen.getByTestId('motion-div');
        const transition = JSON.parse(motionDiv.dataset.transition);

        expect(transition.duration).toBe(0.3);
    });
});
