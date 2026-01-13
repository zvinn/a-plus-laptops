import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AnimatedRoutes from './components/AnimatedRoutes';
import ContextProviders from './components/ContextProviders';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { initGA } from './utils/analytics';

// Lazy load non-critical components to reduce initial bundle size
const Chatbot = lazy(() => import('./components/Chatbot'));
const LiveActivityToast = lazy(() => import('./components/LiveActivityToast'));
const PWAInstallPrompt = lazy(() => import('./components/PWAInstallPrompt'));
const CookieConsent = lazy(() => import('./components/CookieConsent'));
const BottomNav = lazy(() => import('./components/BottomNav'));
const BackToTop = lazy(() => import('./components/BackToTop'));

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
          <Suspense fallback={null}>
            <LiveActivityToast />
            <PWAInstallPrompt />
            <CookieConsent />
            <BackToTop />
            <BottomNav />
          </Suspense>
        </div>
      </Router>
    </ContextProviders>
  );
}

export default App;
