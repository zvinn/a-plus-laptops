import React, { useState, useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, BoltIcon, BriefcaseIcon, Battery100Icon } from '@heroicons/react/24/solid';
import './ComparisonBattle.css';
import { useLanguage } from '../context/LanguageContext';

const COMPONENTS = {
    gaming: { icon: BoltIcon, color: '#3b82f6', label: 'Gaming' },
    workstation: { icon: BriefcaseIcon, color: '#10b981', label: 'Workstation' },
    battery: { icon: Battery100Icon, color: '#f59e0b', label: 'Battery' }
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <span className="tooltip-brand">{data.brand}</span>
                <span className="tooltip-label">{data.name}</span>
                <div className="tooltip-score" style={{ color: data.fill }}>
                    <BoltIcon className="icon" />
                    {payload[0].value}
                </div>
            </div>
        );
    }
    return null;
};

const ComparisonBattle = ({ laptops }) => {
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState('gaming');

    // Use useMemo ensures data is ready for Recharts
    const chartData = useMemo(() => {
        return laptops.map(laptop => ({
            id: laptop.id,
            name: (laptop.name.length > 15 ? laptop.name.substring(0, 15) + '...' : laptop.name), // Truncate for axis
            fullName: laptop.name,
            brand: laptop.brand,
            score: laptop.performance?.[activeCategory] || 0,
            fill: COMPONENTS[activeCategory].color
        }));
    }, [laptops, activeCategory]);

    const winner = useMemo(() => {
        if (!chartData.length) return null;
        return chartData.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    }, [chartData]);

    return (
        <div className="battle-container">
            <div className="battle-header">
                <div className="battle-categories">
                    {Object.entries(COMPONENTS).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                            <button
                                key={key}
                                className={`category-tab ${activeCategory === key ? 'active' : ''}`}
                                onClick={() => setActiveCategory(key)}
                            >
                                <Icon style={{ width: 18, height: 18 }} />
                                <span>{t(`comparison.${key}`) || config.label}</span>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence mode='wait'>
                    {winner && (
                        <motion.div
                            key={winner.id + activeCategory}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="winner-spotlight"
                        >
                            <TrophyIcon className="spotlight-trophy" />
                            <div className="spotlight-content">
                                <span className="winner-label">{t('comparison.categoryWinner')}</span>
                                <span className="winner-name">{winner.fullName}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="battle-arena" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        barSize={40}
                    >
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            width={100}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Bar dataKey="score" radius={[0, 4, 4, 0]} animationDuration={1500}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.id === winner?.id ? entry.fill : '#334155'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ComparisonBattle;
