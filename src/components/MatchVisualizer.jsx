
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const MatchVisualizer = ({ score, reasons }) => {
    const { t, language } = useLanguage();

    // Color based on score
    const getColor = (s) => {
        if (s >= 90) return '#10B981'; // Emerald
        if (s >= 70) return '#3B82F6'; // Blue
        return '#F59E0B'; // Amber
    };

    const color = getColor(score);
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            {/* Circular Score Indicator */}
            <div style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        fill="transparent"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                    />
                    <circle
                        cx="20"
                        cy="20"
                        r={radius}
                        fill="transparent"
                        stroke={color}
                        strokeWidth="4"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>
                <span style={{ position: 'absolute', fontSize: '10px', fontWeight: 'bold', color: color }}>
                    {score}%
                </span>
            </div>

            {/* Match Reasons */}
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '2px' }}>
                    {language === 'ar' ? 'نسبة التطابق' : 'Match Score'}
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {reasons.slice(0, 2).map((reason, idx) => (
                        <span key={idx} style={{
                            fontSize: '0.7rem',
                            background: `${color}15`,
                            color: color,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap'
                        }}>
                            {reason}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatchVisualizer;
