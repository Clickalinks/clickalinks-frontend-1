import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import RunningStrip from './components/RunningStrip';
import AdGrid from './components/AdGrid';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// PERFORMANCE: Lazy load heavy components
const Success = lazy(() => import('./components/Success'));
const Cancel = lazy(() => import('./components/Cancel'));
const CampaignSelection = lazy(() => import('./components/CampaignSelection'));
const BusinessDetails = lazy(() => import('./components/BusinessDetails'));
const Payment = lazy(() => import('./components/Payment'));
const About = lazy(() => import('./components/About'));
const HowItWorks = lazy(() => import('./components/HowItWorks'));
const Terms = lazy(() => import('./components/Terms'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh' 
  }}>
    <div className="loading-spinner"></div>
  </div>
);

// Global keyboard shortcut handler component
const KeyboardShortcutHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+A to navigate to admin portal
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        navigate('/portal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
};

function App() {
  // Create page routes dynamically
  const pages = Array.from({ length: 10 }, (_, i) => i + 1);

  const PageContainer = ({ pageNumber, isHome = false }) => {
    const start = (pageNumber - 1) * 200 + 1;
    const end = pageNumber * 200;
    
    return (
      <div className="container">
        {/* Pass start and end props to AdGrid */}
        <AdGrid pageNumber={pageNumber} start={start} end={end} isHome={isHome} />
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <ScrollToTop />
        <KeyboardShortcutHandler />
        <div className="App">
          <Header />
          <RunningStrip />

        <Routes>
          {/* Home route - Page 1 */}
          <Route path="/" element={<PageContainer pageNumber={1} isHome={true} />} />

          {/* Dynamic page routes */}
          {pages.map(page => (
            <Route
              key={page}
              path={`/page${page}`}
              element={<PageContainer pageNumber={page} />}
            />
          ))}

          {/* Purchase Flow Routes - Lazy loaded */}
          <Route 
            path="/campaign" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <CampaignSelection />
              </Suspense>
            } 
          />
          <Route 
            path="/business-details" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <BusinessDetails />
              </Suspense>
            } 
          />
          <Route 
            path="/payment" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Payment />
              </Suspense>
            } 
          />
          <Route 
            path="/success" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Success />
              </Suspense>
            } 
          />
          <Route 
            path="/cancel" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Cancel />
              </Suspense>
            } 
          />
         
          {/* Information Pages - Lazy loaded */}
          <Route 
            path="/about" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <About />
              </Suspense>
            } 
          />
          <Route 
            path="/how-it-works" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <HowItWorks />
              </Suspense>
            } 
          />
          <Route 
            path="/terms" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Terms />
              </Suspense>
            } 
          />
          <Route 
            path="/privacy" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PrivacyPolicy />
              </Suspense>
            } 
          />

          {/* Admin Route - Lazy loaded (obscured URL for security) */}
          <Route 
            path="/portal" 
            element={
              <Suspense fallback={<LoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            } 
          />
        </Routes>

          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;