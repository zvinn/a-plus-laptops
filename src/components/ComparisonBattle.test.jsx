import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ComparisonBattle from './ComparisonBattle';
import { useLanguage } from '../context/LanguageContext';

// Mock LanguageContext
vi.mock('../context/LanguageContext', () => ({
    useLanguage: vi.fn().mockReturnValue({ t: (s) => s })
}));

// Mock Recharts
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div data-testid="bar" />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    Cell: () => <div />
}));

// Mock Heroicons
vi.mock('@heroicons/react/24/solid', () => ({
    TrophyIcon: () => <span data-testid="icon-trophy" />,
    BoltIcon: () => <span data-testid="icon-bolt" />,
    BriefcaseIcon: () => <span data-testid="icon-briefcase" />,
    Battery100Icon: () => <span data-testid="icon-battery" />
}));

describe('ComparisonBattle Component', () => {
    const mockLaptops = [
        {
            id: '1',
            name: 'Gaming Pro',
            brand: 'Asus',
            performance: { gaming: 90, workstation: 70, battery: 60 }
        },
        {
            id: '2',
            name: 'Office Air',
            brand: 'Dell',
            performance: { gaming: 30, workstation: 50, battery: 95 }
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render correct winner for default category (Gaming)', () => {
        render(<ComparisonBattle laptops={mockLaptops} />);

        expect(screen.getByText(/Gaming Pro/i)).toBeInTheDocument();
        expect(screen.getByTestId('icon-trophy')).toBeInTheDocument();
    });

    it('should update winner when category is changed (Battery)', async () => {
        render(<ComparisonBattle laptops={mockLaptops} />);

        const batteryTab = screen.getByText(/comparison\.battery/i).closest('button');
        fireEvent.click(batteryTab);

        expect(await screen.findByText(/Office Air/i)).toBeInTheDocument();
    });

    it('should render the bar chart', () => {
        render(<ComparisonBattle laptops={mockLaptops} />);
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('should handle laptops with no performance data', () => {
        const minimalLaptops = [{ id: '3', name: 'Unknown', brand: 'Generic' }];
        render(<ComparisonBattle laptops={minimalLaptops} />);

        expect(screen.getByText(/Unknown/i)).toBeInTheDocument();
    });
});
