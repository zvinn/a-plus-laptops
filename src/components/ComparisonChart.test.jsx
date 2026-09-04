import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComparisonChart from './ComparisonChart';

describe('ComparisonChart Component', () => {
    const mockLaptops = [
        {
            id: 'l1',
            name: 'Laptop A',
            brand: 'Asus',
            performance: { gaming: 80, workstation: 70, battery: 60 },
            specs: { cpuScore: 90 }
        },
        {
            id: 'l2',
            name: 'Laptop B',
            brand: 'Apple',
            performance: { gaming: 50, workstation: 90, battery: 95 },
            specs: { cpuScore: 85 }
        }
    ];

    it('should render SVG chart with metrics labels', () => {
        render(<ComparisonChart laptops={mockLaptops} />);

        // Check for common radar chart elements
        expect(screen.getByText('Gaming')).toBeInTheDocument();
        expect(screen.getByText('Work')).toBeInTheDocument();
        expect(screen.getByText('Battery')).toBeInTheDocument();
        expect(screen.getByText('Screen')).toBeInTheDocument();
        expect(screen.getByText('Portable')).toBeInTheDocument();
    });

    it('should render polygons for each laptop', () => {
        const { container } = render(<ComparisonChart laptops={mockLaptops} />);

        const polygons = container.querySelectorAll('polygon');
        expect(polygons.length).toBe(2);
    });

    it('should handle zero laptops', () => {
        const { container } = render(<ComparisonChart laptops={[]} />);
        const polygons = container.querySelectorAll('polygon');
        expect(polygons.length).toBe(0);
    });
});
