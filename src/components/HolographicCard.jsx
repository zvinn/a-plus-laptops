import { memo, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import './HolographicCard.css';

const HolographicCard = memo(({ product }) => {
    // Mouse Position State
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Physics for Smooth Tilt
    const rotateX = useSpring(useTransform(y, [-300, 300], [15, -15]), { stiffness: 150, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-300, 300], [-15, 15]), { stiffness: 150, damping: 20 });

    // Glare Movement (Opposite to rotation)
    const glareX = useTransform(rotateY, [-15, 15], ['0%', '100%']);
    const glareY = useTransform(rotateX, [15, -15], ['0%', '100%']);

    const handleMouseMove = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;
        x.set(offsetX);
        y.set(offsetY);
    }, [x, y]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
    }, [x, y]);

    if (!product) return null;

    return (
        <motion.div
            className="holo-container"
            style={{ perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
        >
            <motion.div
                className="holo-card"
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* 1. Background Glow & Gradient */}
                <div className="holo-bg" />

                {/* 2. Content Layer (Floating) */}
                <div className="holo-content" style={{ transform: 'translateZ(30px)' }}>
                    <div className="holo-badge">Top Pick</div>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="holo-image"
                        loading="lazy"
                    />
                    <div className="holo-info">
                        <h3>{product.name}</h3>
                        <p>{product.brand}</p>
                    </div>
                </div>

                {/* 3. Floating Stats (Higher Z) */}
                <div className="holo-stats" style={{ transform: 'translateZ(60px)' }}>
                    <div className="stat-pill">🚀 {product.specs?.cpu || 'High Perf'}</div>
                    <div className="stat-pill">⚡ {product.specs?.ram || '16GB+'}</div>
                </div>

                {/* 4. Glare Overlay */}
                <motion.div
                    className="holo-glare"
                    style={{
                        background: `radial-gradient(circle at ${glareX?.get() || '50%'} ${glareY?.get() || '50%'}, rgba(255,255,255,0.3) 0%, transparent 60%)`
                    }}
                />
            </motion.div>

            {/* Reflection Shadow Floor */}
            <div className="holo-shadow" />
        </motion.div>
    );
});

HolographicCard.displayName = 'HolographicCard';

export default HolographicCard;

