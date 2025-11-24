import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import RunningStrip from './components/RunningStrip';
import AutoShuffleTimer from './components/AutoShuffleTimer';
import AdGrid from './components/AdGrid';
import Footer from './components/Footer';
import Success from './components/Success';
import Cancel from './components/Cancel';
import CampaignSelection from './components/CampaignSelection';
import BusinessDetails from './components/BusinessDetails';
import AdminPanel from './components/AdminPanel';
import Payment from './components/Payment';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import Terms from './components/Terms';
import ContactForm from './components/ContactForm';
import PrivacyPolicy from './components/PrivacyPolicy';
import AdminDashboard from './components/AdminDashboard';
import ScrollToTop from './components/ScrollToTop';

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
    <Router>
      <ScrollToTop />
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

          {/* Purchase Flow Routes */}
          <Route path="/campaign" element={<CampaignSelection />} />
          <Route path="/business-details" element={<BusinessDetails />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
         
          {/* Information Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Admin Route - FIXED: Only one route for /admin */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;