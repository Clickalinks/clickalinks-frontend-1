import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSquare, pageNumber, selectedDuration, finalAmount, businessData, logoData } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const BACKEND_URL = 'https://clickalinks-backend-2.onrender.com';

  // 🚀 SENIOR FIX: Comprehensive data persistence
  const persistPurchaseData = (sessionId) => {
    console.log('💾 STARTING DATA PERSISTENCE FOR SESSION:', sessionId);
    
    // Get data from ALL possible sources
    const businessFormData = JSON.parse(localStorage.getItem('businessFormData') || '{}');
    const currentLogo = localStorage.getItem('currentLogoData');
    
    // Build robust purchase data
    const purchaseData = {
      // Square info
      squareNumber: selectedSquare,
      pageNumber: pageNumber || 1,
      
      // Business info - multiple fallbacks
      businessName: businessData?.name || businessFormData.name,
      contactEmail: businessData?.email || businessFormData.email,
      website: businessData?.website || businessFormData.website,
      
      // Logo data - CRITICAL: multiple fallbacks with priority
      logoData: logoData || businessData?.logoData || businessFormData.logoData || currentLogo,
      
      // Payment info
      amount: finalAmount || 10,
      duration: selectedDuration || 30,
      purchaseDate: new Date().toISOString(),
      status: 'pending',
      sessionId: sessionId
    };

    console.log('📦 FINAL PURCHASE DATA:', {
      square: purchaseData.squareNumber,
      hasLogo: !!purchaseData.logoData,
      logoSource: logoData ? 'location' : 
                 businessData?.logoData ? 'businessData' : 
                 businessFormData.logoData ? 'businessFormData' : 
                 currentLogo ? 'currentLogo' : 'NONE'
    });

    // 🚀 MULTI-LAYER PERSISTENCE STRATEGY
    try {
      // Layer 1: Session-specific storage
      const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
      pendingPurchases[sessionId] = purchaseData;
      localStorage.setItem('pendingPurchases', JSON.stringify(pendingPurchases));
      console.log('✅ Layer 1: Saved to pendingPurchases');

      // Layer 2: Square-specific storage (most reliable)
      const squarePurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
      squarePurchases[selectedSquare] = {
        ...purchaseData,
        status: 'processing',
        paymentStatus: 'pending'
      };
      localStorage.setItem('squarePurchases', JSON.stringify(squarePurchases));
      console.log('✅ Layer 2: Saved to squarePurchases');

      // Layer 3: Simple key-value backup
      localStorage.setItem(`purchase_${selectedSquare}`, JSON.stringify(purchaseData));
      console.log('✅ Layer 3: Saved to simple backup');

      // Layer 4: Send to backend for redundancy
      fetch(`${BACKEND_URL}/api/debug-purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          squareNumber: selectedSquare,
          step: 'payment_before_redirect',
          data: { ...purchaseData, logoData: purchaseData.logoData ? 'PRESENT' : 'MISSING' }
        })
      }).catch(e => console.log('Backend debug failed (normal)'));

    } catch (error) {
      console.error('❌ Persistence error:', error);
    }

    return purchaseData;
  };

  const handlePayment = async () => {
    if (!acceptedTerms) {
      setErrors({ terms: 'Please accept the terms and conditions' });
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      const payload = {
        amount: Math.round(finalAmount),
        squareNumber: selectedSquare,
        pageNumber: pageNumber,
        duration: selectedDuration,
        businessName: businessData?.name,
        contactEmail: businessData?.email,
        website: businessData?.website
      };

      console.log('💰 Creating Stripe session for square:', selectedSquare);
      
      const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (response.ok && responseData.success && responseData.url) {
        console.log('✅ Stripe session created:', responseData.sessionId);
        
        // 🚀 CRITICAL: Persist data BEFORE redirect
        persistPurchaseData(responseData.sessionId);
        
        // Small delay to ensure persistence completes
        setTimeout(() => {
          console.log('🔗 Redirecting to Stripe...');
          window.location.href = responseData.url;
        }, 100);
        
      } else {
        console.error('❌ Stripe session failed:', responseData.error);
        setErrors({ payment: responseData.error || 'Payment failed' });
        setIsProcessing(false);
      }
      
    } catch (error) {
      console.error('❌ Network error:', error);
      setErrors({ payment: 'Network error. Please try again.' });
      setIsProcessing(false);
    }
  };

  // Rest of component remains the same...
  if (!selectedSquare || !businessData) {
    return (
      <div className="payment-container">
        <div className="payment-content">
          <div className="error-message">
            <h2>Missing Information</h2>
            <p>Required purchase data is missing:</p>
            <ul>
              <li>Selected Square: {selectedSquare ? `#${selectedSquare}` : 'MISSING'}</li>
              <li>Business Data: {businessData ? 'PRESENT' : 'MISSING'}</li>
              <li>Page: {pageNumber || 'MISSING'}</li>
              <li>Duration: {selectedDuration || 'MISSING'}</li>
              <li>Amount: {finalAmount || 'MISSING'}</li>
            </ul>
            <button onClick={() => navigate('/')} className="btn-primary">
              Return to Grid
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-content">
        {/* Header */}
        <div className="payment-header">
          <div className="progress-steps">
            <div className="step completed">
              <div className="step-number">1</div>
              <div className="step-label">Campaign</div>
            </div>
            <div className="step completed">
              <div className="step-number">2</div>
              <div className="step-label">Details</div>
            </div>
            <div className="step active">
              <div className="step-number">3</div>
              <div className="step-label">Payment</div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-label">Complete</div>
            </div>
          </div>
          
          <h1>Secure Payment</h1>
          <p>Complete your purchase with secure payment processing</p>
        </div>

        {errors.payment && (
          <div className="global-error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <strong>Payment Error</strong>
              <p>{errors.payment}</p>
            </div>
          </div>
        )}

        <div className="payment-body">
          {/* Order Summary */}
          <div className="order-summary-sidebar">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>Square Number:</span>
              <span>#{selectedSquare}</span>
            </div>
            <div className="summary-item">
              <span>Page:</span>
              <span>Page {pageNumber}</span>
            </div>
            <div className="summary-item">
              <span>Duration:</span>
              <span>{selectedDuration} days</span>
            </div>
            <div className="summary-item">
              <span>Business:</span>
              <span>{businessData?.name}</span>
            </div>
            <div className="summary-item">
              <span>Contact Email:</span>
              <span>{businessData?.email}</span>
            </div>
            <div className="summary-item">
              <span>Website:</span>
              <span>{businessData?.website}</span>
            </div>
            <div className="summary-item total">
              <span>Total Amount:</span>
              <span className="total-amount">£{finalAmount}</span>
            </div>

            <div className="security-badge">
              <div className="lock-icon">🔒</div>
              <div>
                <strong>Secure Payment</strong>
                <p>256-bit SSL encryption</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-section">
            <div className="payment-methods">
              <h3>Select Payment Method</h3>
              <div className="method-options">
                <div 
                  className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="method-icon">💳</div>
                  <div className="method-info">
                    <div className="method-name">Credit/Debit Card</div>
                    <div className="method-description">Pay with Visa, Mastercard, or Amex</div>
                  </div>
                </div>
                
                <div 
                  className={`method-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <div className="method-icon">💰</div>
                  <div className="method-info">
                    <div className="method-name">PayPal</div>
                    <div className="method-description">Fast and secure payment</div>
                  </div>
                </div>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <div className="stripe-checkout-info">
                <h3>Secure Card Payment</h3>
                <div className="checkout-features">
                  <div className="feature-item">
                    <span className="feature-icon">🔒</span>
                    <span>Secure SSL Encryption</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💳</span>
                    <span>All Major Cards Accepted</span>
                  </div>
                </div>
              </div>
            )}

            <div className="terms-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    setErrors(prev => ({ ...prev, terms: '' }));
                  }}
                />
                <span className="checkmark"></span>
                I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
              </label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>

            <div className="payment-actions">
              <button 
                onClick={handlePayment} 
                className="btn-primary pay-button"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Processing...
                  </>
                ) : (
                  `Pay £${finalAmount} Now`
                )}
              </button>
              
              <button 
                onClick={() => navigate(-1)} 
                className="btn-secondary"
                disabled={isProcessing}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;