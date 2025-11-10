import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import RunningStrip from './components/RunningStrip';
import AdGrid from './components/AdGrid';
import Footer from './components/Footer';
import Success from './components/Success';
import Purchase from './components/Purchase';
import Checkout from './components/Checkout';
import BusinessDetails from './components/BusinessDetails';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <RunningStrip />
        
        <Routes>
          {/* Home route */}
          <Route path="/" element={
            <div className="container">
              <div className="hero">
                <h1>🚀 Direct Advertising Platform🚀</h1>
                <h5>🔻 Learn more about ClickaLinks in our footer information menu 🔻</h5>
              </div>
              <AdGrid />
            </div>
          } />
          
          {/* Other routes */}
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/business-details" element={<BusinessDetails />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;