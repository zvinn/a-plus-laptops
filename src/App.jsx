import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedRoutes from './components/AnimatedRoutes';
import ContextProviders from './components/ContextProviders';
// Lazy load Chatbot to save initial bundle size
import { lazy, Suspense } from 'react';
const Chatbot = lazy(() => import('./components/Chatbot'));
import ScrollToTop from './components/ScrollToTop';
import LiveActivityToast from './components/LiveActivityToast';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import CookieConsent from './components/CookieConsent';
import BottomNav from './components/BottomNav';
import BackToTop from './components/BackToTop';
import { initGA } from './utils/analytics';

function App() {
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

    if (consent === 'true' && gaId && gaId !== 'G-XXXXXXXXXX') {
      initGA(gaId);
    }
  }, []);

  return (
    <ContextProviders>
      <Router>
        <ScrollToTop />
        <div className="app-container">
          {/* Skip Link for Keyboard Accessibility */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <ErrorBoundary name="Navbar" showHomeButton={false}>
            <Navbar />
          </ErrorBoundary>
          <main id="main-content" className="main-content" role="main">
            <ErrorBoundary name="MainContent" fullscreen>
              <AnimatedRoutes />
            </ErrorBoundary>
          </main>
          <ErrorBoundary name="Footer" showHomeButton={false}>
            <Footer />
          </ErrorBoundary>
          <ErrorBoundary name="Chatbot" showHomeButton={false}>
            <Suspense fallback={null}>
              <Chatbot />
            </Suspense>
          </ErrorBoundary>
          <LiveActivityToast />
          <PWAInstallPrompt />
          <CookieConsent />
          <BackToTop />
          <BottomNav />
        </div>
      </Router>
    </ContextProviders>
  );
}

export default App;
