import SEO from '../components/SEO';
import './About.css';

const About = () => {
    return (
        <div className="page-container container">
            <SEO
                title="About Us"
                description="A Plus+ Laptops - Your trusted source for premium gaming laptops in Egypt. We bridge the gap between Egyptian professionals and world-class technology."
                url="/about"
                keywords="A Plus, gaming laptops Egypt, laptop store Cairo, premium laptops"
            />
            {/* Hero Section */}
            <div className="about-hero animate-on-scroll fade-in">
                <h1>We Power Your Potential</h1>
                <p>
                    A+ Laptops wasn't built to just sell computers. We are here to bridge the gap between
                    Egyptian professionals and world-class technology. We believe that the right tool
                    can change your career.
                </p>
            </div>

            {/* Values Grid */}
            <div className="values-grid">
                <div className="value-card animate-on-scroll">
                    <span className="value-icon">💎</span>
                    <h3>Premium Quality</h3>
                    <p>
                        We don't deal in "average". Every device is hand-picked, thoroughly tested,
                        and guaranteed to be in pristine condition. No scratches, no hidden faults.
                    </p>
                </div>
                <div className="value-card animate-on-scroll">
                    <span className="value-icon">🛡️</span>
                    <h3>Real Warranty</h3>
                    <p>
                        Our 6-month hardware warranty is iron-clad. If something goes wrong,
                        we fix it or replace it. No runarounds, just support.
                    </p>
                </div>
                <div className="value-card animate-on-scroll">
                    <span className="value-icon">🚀</span>
                    <h3>Expert Guidance</h3>
                    <p>
                        Not sure what "RTX 3060 vs 4050" means for your workflow? We do.
                        Our team explains specs in plain English to help you choose right.
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-section animate-on-scroll">
                <div className="stat-item">
                    <h2>500+</h2>
                    <p>Happy Customers</p>
                </div>
                <div className="stat-item">
                    <h2>30+</h2>
                    <p>Cities Covered</p>
                </div>
                <div className="stat-item">
                    <h2>5★</h2>
                    <p>Average Rating</p>
                </div>
            </div>
        </div>
    );
};

export default About;
