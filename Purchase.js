import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Purchase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { squareNumber, pageNumber } = location.state || {};
  
  const [selectedDuration, setSelectedDuration] = useState(10);

  const handleCheckout = () => {
    navigate('/business-details', { 
      state: { 
        squareNumber: squareNumber || 1,
        pageNumber: pageNumber || 1,
        duration: selectedDuration
      }
    });
  };

  const durations = [
    { days: 10, price: 10, label: '10 days - £10' },
    { days: 20, price: 20, label: '20 days - £20' },
    { days: 30, price: 30, label: '30 days - £30' },
    { days: 60, price: 60, label: '60 days - £60' }
  ];

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>🎯 Select Your Advertising Duration</h1>
        <p>Choose how long you want your advertisement to run</p>
      </div>

      <div className="checkout-content">
        {/* Order Summary */}
        <div className="order-summary">
          <h3>📋 Selected Square</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span>Square Number:</span>
              <strong>#{squareNumber || 'Not selected'}</strong>
            </div>
            <div className="summary-item">
              <span>Page:</span>
              <strong>Page {pageNumber || 1}</strong>
            </div>
            <div className="summary-item total">
              <span>Selected Duration:</span>
              <strong>{selectedDuration} days</strong>
            </div>
            <div className="summary-item total">
              <span>Total Amount:</span>
              <strong>£{selectedDuration}.00</strong>
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="business-form">
          <div className="form-section">
            <h3>⏰ Campaign Duration</h3>
            <p>Choose how long you want your advertisement to be visible to customers.</p>
            
            <div className="duration-options">
              {durations.map((duration) => (
                <div 
                  key={duration.days}
                  className={`duration-option ${selectedDuration === duration.days ? 'selected' : ''}`}
                  onClick={() => setSelectedDuration(duration.days)}
                >
                  <div className="duration-days">{duration.days} days</div>
                  <div className="duration-price">£{duration.price}.00</div>
                  <div className="duration-rate">(£1 per day)</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate(-1)}
            >
              ← Back to Squares
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleCheckout}
            >
              Continue to Business Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchase;