import { memo } from 'react';
import './Skeleton.css';

const Skeleton = memo(({ type = 'text', width, height, style }) => {
    const customStyle = {
        width,
        height,
        ...style
    };

    return <div className={`skeleton skeleton-${type}`} style={customStyle}></div>;
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;

