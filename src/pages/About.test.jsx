import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import About from './About';

// Mock SEO component
vi.mock('../components/SEO', () => ({
    default: ({ title, description }) => (
        <div data-testid="seo" data-title={title} data-description={description} />
    )
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Gem: (props) => <svg data-testid="gem-icon" {...props} />,
    ShieldCheck: (props) => <svg data-testid="shield-icon" {...props} />,
    Rocket: (props) => <svg data-testid="rocket-icon" {...props} />
}));

describe('About Page', () => {
    const renderAbout = () => {
        return render(
            <MemoryRouter>
                <About />
            </MemoryRouter>
        );
    };

    it('should render the page with SEO component', () => {
        renderAbout();

        const seo = screen.getByTestId('seo');
        expect(seo).toHaveAttribute('data-title', 'About Us');
    });

    it('should render hero section with main heading', () => {
        renderAbout();

        expect(screen.getByText('We Power Your Potential')).toBeInTheDocument();
    });

    it('should render hero description', () => {
        renderAbout();

        expect(screen.getByText(/A\+ Laptops wasn't built to just sell computers/)).toBeInTheDocument();
    });

    it('should render all three value cards', () => {
        renderAbout();

        expect(screen.getByText('Premium Quality')).toBeInTheDocument();
        expect(screen.getByText('Real Warranty')).toBeInTheDocument();
        expect(screen.getByText('Expert Guidance')).toBeInTheDocument();
    });

    it('should render value card descriptions', () => {
        renderAbout();

        expect(screen.getByText(/Every device is hand-picked/)).toBeInTheDocument();
        expect(screen.getByText(/6-month hardware warranty/)).toBeInTheDocument();
        expect(screen.getByText(/explains specs in plain English/)).toBeInTheDocument();
    });

    it('should render all value icons', () => {
        renderAbout();

        expect(screen.getByTestId('gem-icon')).toBeInTheDocument();
        expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
        expect(screen.getByTestId('rocket-icon')).toBeInTheDocument();
    });

    it('should render statistics section', () => {
        renderAbout();

        expect(screen.getByText('500+')).toBeInTheDocument();
        expect(screen.getByText('30+')).toBeInTheDocument();
        expect(screen.getByText('5★')).toBeInTheDocument();
    });

    it('should render stat labels', () => {
        renderAbout();

        expect(screen.getByText('Happy Customers')).toBeInTheDocument();
        expect(screen.getByText('Cities Covered')).toBeInTheDocument();
        expect(screen.getByText('Average Rating')).toBeInTheDocument();
    });

    it('should have correct CSS classes', () => {
        renderAbout();

        const pageContainer = document.querySelector('.page-container');
        expect(pageContainer).toBeInTheDocument();

        const heroSection = document.querySelector('.about-hero');
        expect(heroSection).toBeInTheDocument();

        const valuesGrid = document.querySelector('.values-grid');
        expect(valuesGrid).toBeInTheDocument();
    });
});
