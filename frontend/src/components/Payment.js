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

  const validateForm = () => {
    const newErrors = {};

    if (!acceptedTerms) {
      newErrors.terms = 'Please accept the terms and conditions to proceed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const processPayment = async () => {
  try {
    setIsProcessing(true);
    
    const BACKEND_URL = 'https://clickalinks-backend.onrender.com';
    
    // ✅ FIXED: Proper payload with couponCode as empty string (not missing)
    const paymentPayload = {
      campaignDuration: selectedDuration,
      amount: finalAmount * 100, // Convert to pence
      squareId: selectedSquare,
      pageNumber: pageNumber,
      businessName: businessData?.name || '',
      contactEmail: businessData?.email || '',
      logoData: logoData || '',
      dealLink: businessData?.website || '',
      couponCode: '' // ✅ Always include as empty string
    };

    console.log('🔍 DEBUG - Payment payload:', paymentPayload);
    
    // ✅ FIXED: Only check for truly undefined/null, not empty strings
    const missingFields = [];
    Object.entries(paymentPayload).forEach(([key, value]) => {
      // Don't check couponCode as it's optional
      if (key === 'couponCode') return;
      
      // Only flag if truly undefined or null
      if (value === undefined || value === null) {
        missingFields.push(key);
      }
    });

    if (missingFields.length > 0) {
      console.error('❌ MISSING FIELDS:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    console.log('🔄 Creating Stripe checkout session...');

    const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload)
    });

    // Check if response is OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Payment session creation failed');
    }

    console.log('✅ Stripe session created, redirecting to:', data.url);
    
    // Save purchase data to localStorage before redirecting
    const purchaseData = {
      squareNumber: selectedSquare,
      pageNumber: pageNumber,
      businessName: businessData.name,
      contactEmail: businessData.email,
      website: businessData.website,
      logoData: logoData,
      amount: finalAmount,
      duration: selectedDuration,
      purchaseDate: new Date().toISOString(),
      status: 'pending',
      endDate: new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'stripe',
      sessionId: data.sessionId
    };

    // Save to localStorage temporarily
    const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
    pendingPurchases[data.sessionId] = purchaseData;
    localStorage.setItem('pendingPurchases', JSON.stringify(pendingPurchases));

    // Redirect to Stripe Checkout
    window.location.href = data.url;
    
  } catch (error) {
    console.error('❌ Payment error details:', error);
    alert(`Payment failed: ${error.message}`);
    setIsProcessing(false);
  }
};
  const handlePayment = async () => {
    if (!validateForm()) return;
    await processPayment();
  };

  if (!selectedSquare || !businessData) {
    return (
      <div className="payment-container">
        <div className="payment-content">
          <div className="error-message">
            <h2>Session Expired</h2>
            <p>Please go back and start your purchase again.</p>
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
            {/* Payment Method Selection */}
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

            {/* Card Payment - Stripe Checkout Info */}
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
                  <div className="feature-item">
                    <span className="feature-icon">🛡️</span>
                    <span>PCI DSS Compliant</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <span>Fast & Secure Checkout</span>
                  </div>
                </div>
                <div className="redirect-notice">
                  <p>You'll be redirected to <strong>Stripe's secure payment page</strong> to complete your card details. This ensures your payment information is handled with the highest security standards.</p>
                </div>
              </div>
            )}

            {/* PayPal Payment */}
            {paymentMethod === 'paypal' && (
              <div className="paypal-section">
                <div className="paypal-logo">PayPal</div>
                <p>You will be redirected to PayPal to complete your payment securely.</p>
                <div className="paypal-features">
                  <div className="feature-item">
                    <span className="feature-icon">🔒</span>
                    <span>PayPal Buyer Protection</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💳</span>
                    <span>Pay with PayPal Balance or Card</span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
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

            {/* Payment Actions */}
            <div className="payment-actions">
              <button 
                onClick={handlePayment} 
                className="btn-primary pay-button"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Connecting to Secure Payment...
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

            {/* Security Assurance */}
            <div className="security-assurance">
              <div className="assurance-item">
                <div className="assurance-icon">🔒</div>
                <span>256-bit SSL Secure</span>
              </div>
              <div className="assurance-item">
                <div className="assurance-icon">🛡️</div>
                <span>PCI DSS Compliant</span>
              </div>
              <div className="assurance-item">
                <div className="assurance-icon">💳</div>
                <span>Card details never stored</span>
              </div>
              <div className="assurance-item">
                <div className="assurance-icon">⭐</div>
                <span>Stripe Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;