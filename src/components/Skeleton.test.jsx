import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton, {
    ProductCardSkeleton,
    ProductGridSkeleton,
    PageHeaderSkeleton,
    TableRowSkeleton,
    FormSkeleton,
    ProfileSkeleton,
    StatsCardSkeleton
} from './Skeleton';

describe('Skeleton Component', () => {
    describe('Base Skeleton', () => {
        it('should render with default type (text)', () => {
            render(<Skeleton />);
            const skeleton = document.querySelector('.skeleton-text');
            expect(skeleton).toBeInTheDocument();
        });

        it('should render with default animation (shimmer)', () => {
            render(<Skeleton />);
            const skeleton = document.querySelector('.skeleton-shimmer');
            expect(skeleton).toBeInTheDocument();
        });

        it('should render rect type', () => {
            render(<Skeleton type="rect" />);
            const skeleton = document.querySelector('.skeleton-rect');
            expect(skeleton).toBeInTheDocument();
        });

        it('should render circle type', () => {
            render(<Skeleton type="circle" />);
            const skeleton = document.querySelector('.skeleton-circle');
            expect(skeleton).toBeInTheDocument();
        });

        it('should render avatar type', () => {
            render(<Skeleton type="avatar" />);
            const skeleton = document.querySelector('.skeleton-avatar');
            expect(skeleton).toBeInTheDocument();
        });

        it('should render button type', () => {
            render(<Skeleton type="button" />);
            const skeleton = document.querySelector('.skeleton-button');
            expect(skeleton).toBeInTheDocument();
        });

        it('should apply pulse animation', () => {
            render(<Skeleton animation="pulse" />);
            const skeleton = document.querySelector('.skeleton-pulse');
            expect(skeleton).toBeInTheDocument();
        });

        it('should apply wave animation', () => {
            render(<Skeleton animation="wave" />);
            const skeleton = document.querySelector('.skeleton-wave');
            expect(skeleton).toBeInTheDocument();
        });

        it('should apply custom width and height', () => {
            render(<Skeleton width="200px" height="50px" />);
            const skeleton = document.querySelector('.skeleton');
            expect(skeleton).toHaveStyle({ width: '200px', height: '50px' });
        });

        it('should apply additional className', () => {
            render(<Skeleton className="custom-class" />);
            const skeleton = document.querySelector('.custom-class');
            expect(skeleton).toBeInTheDocument();
        });

        it('should apply custom style', () => {
            render(<Skeleton style={{ marginTop: '20px' }} />);
            const skeleton = document.querySelector('.skeleton');
            expect(skeleton).toHaveStyle({ marginTop: '20px' });
        });
    });

    describe('Paragraph Skeleton', () => {
        it('should render multiple lines', () => {
            render(<Skeleton type="paragraph" lines={4} />);
            const lines = document.querySelectorAll('.skeleton-text');
            expect(lines.length).toBe(4);
        });

        it('should render 3 lines by default', () => {
            render(<Skeleton type="paragraph" />);
            const lines = document.querySelectorAll('.skeleton-text');
            expect(lines.length).toBe(3);
        });

        it('should have last line at 60% width', () => {
            render(<Skeleton type="paragraph" lines={3} />);
            const lines = document.querySelectorAll('.skeleton-text');
            const lastLine = lines[lines.length - 1];
            expect(lastLine).toHaveStyle({ width: '60%' });
        });

        it('should have staggered animation delays', () => {
            render(<Skeleton type="paragraph" lines={3} />);
            const lines = document.querySelectorAll('.skeleton-text');
            expect(lines[0]).toHaveStyle({ animationDelay: '0s' });
            expect(lines[1]).toHaveStyle({ animationDelay: '0.1s' });
            expect(lines[2]).toHaveStyle({ animationDelay: '0.2s' });
        });
    });

    describe('Card Skeleton', () => {
        it('should render card skeleton structure', () => {
            render(<Skeleton type="card" />);
            const card = document.querySelector('.skeleton-card');
            expect(card).toBeInTheDocument();
        });

        it('should have image placeholder', () => {
            render(<Skeleton type="card" />);
            const rects = document.querySelectorAll('.skeleton-rect');
            expect(rects.length).toBeGreaterThan(0);
        });

        it('should have text placeholders', () => {
            render(<Skeleton type="card" />);
            const texts = document.querySelectorAll('.skeleton-text');
            expect(texts.length).toBeGreaterThan(0);
        });
    });
});

describe('ProductCardSkeleton', () => {
    it('should render product card skeleton', () => {
        render(<ProductCardSkeleton />);
        const skeleton = document.querySelector('.product-card-skeleton');
        expect(skeleton).toBeInTheDocument();
    });

    it('should have image area', () => {
        render(<ProductCardSkeleton />);
        const rects = document.querySelectorAll('.skeleton-rect');
        expect(rects.length).toBeGreaterThan(0);
    });

    it('should have content area', () => {
        render(<ProductCardSkeleton />);
        const content = document.querySelector('.product-card-skeleton-content');
        expect(content).toBeInTheDocument();
    });

    it('should accept animation prop', () => {
        render(<ProductCardSkeleton animation="pulse" />);
        const skeleton = document.querySelector('.skeleton-pulse');
        expect(skeleton).toBeInTheDocument();
    });
});

describe('ProductGridSkeleton', () => {
    it('should render 8 cards by default', () => {
        render(<ProductGridSkeleton />);
        const cards = document.querySelectorAll('.product-card-skeleton');
        expect(cards.length).toBe(8);
    });

    it('should render custom number of cards', () => {
        render(<ProductGridSkeleton count={4} />);
        const cards = document.querySelectorAll('.product-card-skeleton');
        expect(cards.length).toBe(4);
    });

    it('should use 4 columns by default', () => {
        render(<ProductGridSkeleton />);
        const grid = document.querySelector('.product-grid-skeleton');
        expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(4, 1fr)' });
    });

    it('should accept custom columns', () => {
        render(<ProductGridSkeleton columns={3} />);
        const grid = document.querySelector('.product-grid-skeleton');
        expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(3, 1fr)' });
    });
});

describe('PageHeaderSkeleton', () => {
    it('should render page header skeleton', () => {
        render(<PageHeaderSkeleton />);
        const skeleton = document.querySelector('.page-header-skeleton');
        expect(skeleton).toBeInTheDocument();
    });

    it('should have centered text', () => {
        render(<PageHeaderSkeleton />);
        const skeleton = document.querySelector('.page-header-skeleton');
        expect(skeleton).toHaveStyle({ textAlign: 'center' });
    });
});

describe('TableRowSkeleton', () => {
    it('should render 5 columns by default', () => {
        render(<TableRowSkeleton />);
        const columns = document.querySelectorAll('.table-row-skeleton .skeleton-text');
        expect(columns.length).toBe(5);
    });

    it('should render custom number of columns', () => {
        render(<TableRowSkeleton columns={3} />);
        const columns = document.querySelectorAll('.table-row-skeleton .skeleton-text');
        expect(columns.length).toBe(3);
    });
});

describe('FormSkeleton', () => {
    it('should render 4 fields by default', () => {
        render(<FormSkeleton />);
        const labels = document.querySelectorAll('.form-skeleton > div');
        // 4 field divs + 1 submit button div
        expect(labels.length).toBe(5);
    });

    it('should render custom number of fields', () => {
        render(<FormSkeleton fields={2} />);
        const fields = document.querySelectorAll('.form-skeleton > div');
        // 2 field divs + 1 submit button div
        expect(fields.length).toBe(3);
    });
});

describe('ProfileSkeleton', () => {
    it('should render profile skeleton', () => {
        render(<ProfileSkeleton />);
        const skeleton = document.querySelector('.profile-skeleton');
        expect(skeleton).toBeInTheDocument();
    });

    it('should have avatar circle', () => {
        render(<ProfileSkeleton />);
        const circle = document.querySelector('.skeleton-circle');
        expect(circle).toBeInTheDocument();
    });
});

describe('StatsCardSkeleton', () => {
    it('should render stats card skeleton', () => {
        render(<StatsCardSkeleton />);
        const skeleton = document.querySelector('.stats-card-skeleton');
        expect(skeleton).toBeInTheDocument();
    });

    it('should have icon circle', () => {
        render(<StatsCardSkeleton />);
        const circle = document.querySelector('.skeleton-circle');
        expect(circle).toBeInTheDocument();
    });
});
