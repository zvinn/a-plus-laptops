import { WifiIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';

const OfflineFallback = () => {
    const { t } = useLanguage();

    return (
        <div style={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
            gap: '1.5rem',
            color: 'var(--text-secondary)'
        }}>
            <div style={{
                background: 'var(--bg-secondary)',
                padding: '2rem',
                borderRadius: '50%',
                marginBottom: '1rem'
            }}>
                <WifiIcon style={{ width: '64px', height: '64px', opacity: 0.5 }} />
            </div>

            <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem'
            }}>
                {t('offline.title') || "You're Offline"}
            </h2>

            <p style={{ maxWidth: '400px', lineHeight: '1.6' }}>
                {t('offline.message') || "It seems you've lost your internet connection. Please check your connection and try again."}
            </p>

            <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
            >
                {t('offline.retry') || "Try Again"}
            </button>
        </div>
    );
};

export default OfflineFallback;
