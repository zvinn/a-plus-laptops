import { memo } from 'react';
import './Skeleton.css';

/**
 * Enhanced Skeleton Component with multiple variants and animations
 * @param {Object} props
 * @param {'text'|'rect'|'circle'|'avatar'|'button'|'card'|'paragraph'} props.type - Type of skeleton
 * @param {'shimmer'|'pulse'|'wave'} props.animation - Animation style
 * @param {string|number} props.width - Custom width
 * @param {string|number} props.height - Custom height
 * @param {number} props.lines - Number of lines for paragraph type
 * @param {object} props.style - Additional inline styles
 * @param {string} props.className - Additional CSS classes
 */
const Skeleton = memo(({
    type = 'text',
    animation = 'shimmer',
    width,
    height,
    lines = 3,
    style,
    className = ''
}) => {
    const customStyle = {
        width,
        height,
        ...style
    };

    // Paragraph skeleton renders multiple lines
    if (type === 'paragraph') {
        return (
            <div className={`skeleton-paragraph ${className}`}>
                {Array.from({ length: lines }, (_, i) => (
                    <div
                        key={i}
                        className={`skeleton skeleton-text skeleton-${animation}`}
                        style={{
                            width: i === lines - 1 ? '60%' : '100%',
                            animationDelay: `${i * 0.1}s`
                        }}
                    />
                ))}
            </div>
        );
    }

    // Card skeleton renders a complete card placeholder
    if (type === 'card') {
        return (
            <div className={`skeleton-card ${className}`} style={customStyle}>
                <div className={`skeleton skeleton-rect skeleton-${animation}`} style={{ height: '180px', marginBottom: '1rem' }} />
                <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '80%', marginBottom: '0.5rem' }} />
                <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '60%', marginBottom: '0.75rem' }} />
                <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '40%' }} />
            </div>
        );
    }

    return (
        <div
            className={`skeleton skeleton-${type} skeleton-${animation} ${className}`}
            style={customStyle}
        />
    );
});

Skeleton.displayName = 'Skeleton';

// ============================================
// SKELETON COMPOSITIONS
// ============================================

/**
 * Product Card Skeleton
 */
export const ProductCardSkeleton = memo(({ animation = 'shimmer' }) => (
    <div className="product-card-skeleton">
        <div className={`skeleton skeleton-rect skeleton-${animation}`} style={{ height: '200px', borderRadius: '12px 12px 0 0' }} />
        <div className="product-card-skeleton-content">
            <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '70%', height: '1.2rem' }} />
            <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '90%', marginTop: '0.5rem' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '35%', height: '1.5rem' }} />
                <div className={`skeleton skeleton-circle skeleton-${animation}`} style={{ width: '36px', height: '36px' }} />
            </div>
        </div>
    </div>
));
ProductCardSkeleton.displayName = 'ProductCardSkeleton';

/**
 * Product Grid Skeleton - renders multiple product cards
 */
export const ProductGridSkeleton = memo(({ count = 8, columns = 4, animation = 'shimmer' }) => (
    <div
        className="product-grid-skeleton"
        style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: '1.5rem'
        }}
    >
        {Array.from({ length: count }, (_, i) => (
            <ProductCardSkeleton key={i} animation={animation} />
        ))}
    </div>
));
ProductGridSkeleton.displayName = 'ProductGridSkeleton';

/**
 * Page Header Skeleton
 */
export const PageHeaderSkeleton = memo(({ animation = 'shimmer' }) => (
    <div className="page-header-skeleton" style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '40%', height: '2.5rem', margin: '0 auto 1rem' }} />
        <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '60%', height: '1rem', margin: '0 auto' }} />
    </div>
));
PageHeaderSkeleton.displayName = 'PageHeaderSkeleton';

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton = memo(({ columns = 5, animation = 'shimmer' }) => (
    <div className="table-row-skeleton" style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid var(--border-primary)' }}>
        {Array.from({ length: columns }, (_, i) => (
            <div key={i} className={`skeleton skeleton-text skeleton-${animation}`} style={{ flex: 1 }} />
        ))}
    </div>
));
TableRowSkeleton.displayName = 'TableRowSkeleton';

/**
 * Form Skeleton
 */
export const FormSkeleton = memo(({ fields = 4, animation = 'shimmer' }) => (
    <div className="form-skeleton" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {Array.from({ length: fields }, (_, i) => (
            <div key={i}>
                <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '25%', height: '0.875rem', marginBottom: '0.5rem' }} />
                <div className={`skeleton skeleton-rect skeleton-${animation}`} style={{ height: '44px', borderRadius: '8px' }} />
            </div>
        ))}
        <div className={`skeleton skeleton-rect skeleton-${animation}`} style={{ width: '150px', height: '44px', borderRadius: '8px', marginTop: '0.5rem' }} />
    </div>
));
FormSkeleton.displayName = 'FormSkeleton';

/**
 * Profile Skeleton
 */
export const ProfileSkeleton = memo(({ animation = 'shimmer' }) => (
    <div className="profile-skeleton" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className={`skeleton skeleton-circle skeleton-${animation}`} style={{ width: '80px', height: '80px' }} />
        <div style={{ flex: 1 }}>
            <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '60%', height: '1.5rem', marginBottom: '0.5rem' }} />
            <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '40%' }} />
        </div>
    </div>
));
ProfileSkeleton.displayName = 'ProfileSkeleton';

/**
 * Stats Card Skeleton
 */
export const StatsCardSkeleton = memo(({ animation = 'shimmer' }) => (
    <div className="stats-card-skeleton" style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-primary)' }}>
        <div className={`skeleton skeleton-circle skeleton-${animation}`} style={{ width: '48px', height: '48px', marginBottom: '1rem' }} />
        <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '50%', height: '2rem', marginBottom: '0.5rem' }} />
        <div className={`skeleton skeleton-text skeleton-${animation}`} style={{ width: '70%' }} />
    </div>
));
StatsCardSkeleton.displayName = 'StatsCardSkeleton';

export default Skeleton;
