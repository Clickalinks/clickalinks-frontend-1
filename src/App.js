import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import RunningStrip from './components/RunningStrip';
import AutoShuffleTimer from './components/AutoShuffleTimer';
import AdGrid from './components/AdGrid';
import Footer from './components/Footer';
import Success from './components/Success';
import Purchase from './components/Purchase';
import Checkout from './components/Checkout';
import BusinessDetails from './components/BusinessDetails';
import AdminPanel from './components/AdminPanel';

function App() {
  // Create page routes dynamically
  const pages = Array.from({ length: 10 }, (_, i) => i + 1);
  
  const PageContainer = ({ pageNumber, isHome = false }) => (
    <div className="container">
      <div className="hero">
        <h1>
          🚀 {isHome ? 'Direct Advertising Platform' : `Advertising Page ${pageNumber}`} 🚀
        </h1>
        <h5>
          🔻 {isHome ? 'Learn more about ClickaLinks in our footer information menu' : '200 premium advertising squares available'} 🔻
        </h5>
      </div>
      
      <AdGrid pageNumber={pageNumber} />
    </div>
  );

  return (
    <Router>
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
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/business-details" element={<BusinessDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          
          {/* Admin Route */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;