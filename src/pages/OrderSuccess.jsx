import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const OrderSuccess = () => {
    return (
        <div className="page-container container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <SEO
                title="Order Confirmed"
                description="Your order has been placed successfully."
                noIndex={true}
            />
            <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'inline-block',
                padding: '2rem',
                borderRadius: '50%',
                marginBottom: '1.5rem'
            }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <h1>Order Placed Successfully!</h1>
            <p style={{ color: '#888', maxWidth: '500px', margin: '1rem auto 2rem' }}>
                Thank you for your purchase. We have received your order and will contact you shortly to confirm visibility.
            </p>
            <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
        </div>
    );
};

export default OrderSuccess;
