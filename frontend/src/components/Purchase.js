import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Purchase = () => {
  const [selectedSquare, setSelectedSquare] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const navigate = useNavigate();

  // Fixed handleCheckout function:
  const handleCheckout = () => {
    navigate('/business-details', { 
      state: { 
        square: selectedSquare, 
        duration: selectedDuration 
      }
    });
  };

  // KEEP ALL YOUR EXISTING RETURN JSX CODE HERE
  return (
    <div className="purchase-page">
      <header>
        <a href="/">
          <img src="/logo.PNG" alt="CLICKaLINKS" className="logo-img" />
        </a>
      </header>

      <div className="running-strip">
        <div className="marquee">
          🚀 DIRECTING BUSINESSES TO CUSTOMERS • ONE CLICK AT A TIME • AFFORDABLE ADVERTISING • 
        </div>
      </div>

      <div className="container">
        <h1>Select Your Advertising Square</h1>
        
        {/* Square Selection */}
        <div className="square-selection">
          <h3>Choose a Square</h3>
          <select 
            value={selectedSquare} 
            onChange={(e) => setSelectedSquare(parseInt(e.target.value))}
          >
            {[...Array(100)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Square #{i + 1}</option>
            ))}
          </select>
        </div>

        {/* Duration Selection */}
        <div className="duration-selection">
          <h3>Select Duration</h3>
          <select 
            value={selectedDuration} 
            onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
          >
            <option value={10}>10 days - £10</option>
            <option value={30}>30 days - £30</option>
            <option value={60}>60 days - £60</option>
            <option value={90}>90 days - £90</option>
          </select>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <p><strong>Square:</strong> #{selectedSquare}</p>
          <p><strong>Duration:</strong> {selectedDuration} days</p>
          <p><strong>Total:</strong> £{selectedDuration}.00</p>
        </div>

        <button className="checkout-btn" onClick={handleCheckout}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Purchase;