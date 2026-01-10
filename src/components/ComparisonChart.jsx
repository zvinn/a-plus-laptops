// React import removed if not needed or just keep if React is used (Vite auto-imports React usually)
import { useEffect } from 'react'; // Actually I don't see other hooks used here? 
// Wait, the file uses NO hooks now.
// It just takes props.
// So no imports needed from 'react' if using JSX transform (Vite does).

const ComparisonChart = ({ laptops }) => {
    // We want a radar chart. Implementing a pure SVG radar chart is reliable and lightweight.
    // Laptops: Array of laptop objects.
    // Metrics: Gaming, Workstation, Battery, Portability (derived from weight/screen?), Screen(refresh/res?), Price(Inverse?)
    // Let's stick to the 3 main ones for simplicity + maybe Screen Score if available. 
    // Data: Normalized 0-100.

    const metrics = [
        { key: 'gaming', label: 'Gaming', getValue: (l) => l.performance.gaming },
        { key: 'workstation', label: 'Work', getValue: (l) => l.performance.workstation },
        { key: 'battery', label: 'Battery', getValue: (l) => l.performance.battery },
        { key: 'screen', label: 'Screen', getValue: (l) => l.specs.cpuScore ? Math.min(l.specs.cpuScore * 0.8 + 20, 100) : 50 }, // Approximation for demo
        { key: 'portability', label: 'Portable', getValue: (l) => l.brand === 'Apple' ? 90 : (l.brand === 'Lenovo' ? 60 : 70) } // Mock
    ];

    const size = 300;
    const center = size / 2;
    const radius = size * 0.35; // 35% of container
    const angleSlice = (Math.PI * 2) / metrics.length;

    // Helper: coordinates
    const getCoords = (value, index) => {
        const factor = value / 100;
        const angle = index * angleSlice - Math.PI / 2; // Start at top
        return {
            x: center + Math.cos(angle) * (radius * factor),
            y: center + Math.sin(angle) * (radius * factor)
        };
    };

    const colors = ['#3b82f6', '#10b981', '#f59e0b']; // Blue, Green, Orange/Yellow

    return (
        <div className="radar-chart-container" style={{ width: '100%', height: '320px', display: 'flex', justifyContent: 'center' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Axis Visual */}
                <g stroke="rgba(255,255,255,0.1)" strokeWidth="1">
                    {metrics.map((m, i) => {
                        const pos = getCoords(100, i);
                        return (
                            <g key={i}>
                                <line x1={center} y1={center} x2={pos.x} y2={pos.y} />
                                <text
                                    x={pos.x * 1.15 - center * 0.15}
                                    y={pos.y * 1.15 - center * 0.15}
                                    fill="#94a3b8"
                                    fontSize="10"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {m.label}
                                </text>
                            </g>
                        );
                    })}
                    {/* Grid circles */}
                    {[25, 50, 75, 100].map(r => (
                        <circle
                            key={r}
                            cx={center}
                            cy={center}
                            r={radius * (r / 100)}
                            fill="none"
                            stroke="rgba(255,255,255,0.05)"
                        />
                    ))}
                </g>

                {laptops.map((laptop, i) => {
                    const points = metrics.map((m, idx) => {
                        const val = m.getValue(laptop);
                        const c = getCoords(val, idx);
                        return `${c.x},${c.y}`;
                    }).join(" ");

                    const color = laptop.isReference ? '#94a3b8' : colors[i % colors.length];

                    return (
                        <g key={laptop.id} className="chart-shape">
                            <polygon
                                points={points}
                                fill={color}
                                fillOpacity="0.15"
                                stroke={color}
                                strokeWidth="2"
                                style={{ transition: 'all 0.5s ease' }}
                            />
                            {/* Dots */}
                            {metrics.map((m, idx) => {
                                const val = m.getValue(laptop);
                                const c = getCoords(val, idx);
                                return <circle key={idx} cx={c.x} cy={c.y} r="3" fill={color} />;
                            })}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default ComparisonChart;
