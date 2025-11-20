import React, { useState } from 'react';

const PaymentButton = ({ 
  squareId = "1", 
  duration = 10, 
  businessName = "Your Business", 
  contactEmail = "", 
  adText = "Amazing business offer!",
  onPaymentStart,
  onPaymentComplete,
  onPaymentError 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Working Stripe test links for different durations
  const stripeLinks = {
    10: 'https://buy.stripe.com/test_14k5mweUJ0CB7OEbII',  // £10 for 10 days
    20: 'https://buy.stripe.com/test_14k5mweUJ0CB7OEbII',  // £20 for 20 days (use same for demo)
    30: 'https://buy.stripe.com/test_14k5mweUJ0CB7OEbII'   // £30 for 30 days (use same for demo)
  };

  const handlePayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Call optional callback
      if (onPaymentStart) {
        onPaymentStart({ squareId, duration, businessName });
      }

      console.log('🚀 Starting payment process...');
      console.log('Square ID:', squareId);
      console.log('Duration:', duration, 'days');
      console.log('Business:', businessName);
      
      // ✅ 100% CLIENT-SIDE - NO API CALLS
      // Save booking info to localStorage
      const bookingData = {
        squareNumber: squareId,
        businessName: businessName,
        contactEmail: contactEmail,
        adText: adText,
        duration: duration,
        amount: duration, // £1 per day
        purchaseDate: new Date().toISOString(),
        status: 'pending',
        stripeSessionId: `session_${Date.now()}_${squareId}`
      };

      console.log('💾 Saving booking data:', bookingData);

      // Get existing purchases
      const existingPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
      existingPurchases[squareId] = bookingData;
      localStorage.setItem('squarePurchases', JSON.stringify(existingPurchases));

      // Save current session for success page
      localStorage.setItem('currentPaymentSession', JSON.stringify({
        squareId: squareId,
        duration: duration,
        amount: duration,
        timestamp: Date.now()
      }));

      // ✅ DIRECT STRIPE REDIRECT - NO BACKEND
      const stripeUrl = stripeLinks[duration] || stripeLinks[10];
      
      // Add success URL parameters
      const successUrl = `${window.location.origin}/success?square=${squareId}&duration=${duration}&amount=${duration}`;
      console.log('🎯 Success URL will be:', successUrl);
      
      console.log('🔗 Redirecting to Stripe checkout...');
      
      // Simple redirect - Stripe will handle the rest
      window.location.href = stripeUrl;
      
      // Call optional completion callback
      if (onPaymentComplete) {
        onPaymentComplete({ squareId, duration });
      }
      
    } catch (error) {
      console.error('❌ Payment error:', error);
      setIsProcessing(false);
      
      // Call optional error callback
      if (onPaymentError) {
        onPaymentError(error);
      } else {
        alert('Payment error: ' + error.message);
      }
    }
  };

  const getButtonText = () => {
    if (isProcessing) {
      return (
        <>
          <div className="spinner"></div>
          Processing...
        </>
      );
    }
    
    const amount = duration; // £1 per day
    return (
      <>
        <i className="fas fa-credit-card"></i>
        Get Started with ClickaLinks - £{amount}.00
      </>
    );
  };

  const getDurationText = () => {
    switch(duration) {
      case 10: return '10-Day Campaign';
      case 20: return '20-Day Campaign';
      case 30: return '30-Day Campaign';
      default: return `${duration}-Day Campaign`;
    }
  };

  return (
    <div className="payment-button-container">
      <button 
        onClick={handlePayment}
        disabled={isProcessing}
        className={`pay-button ${isProcessing ? 'processing' : ''}`}
      >
        {getButtonText()}
      </button>
      
      <div className="payment-details">
        <small>
          <strong>{getDurationText()}</strong> • £1 per day • Secure payment via Stripe
        </small>
      </div>
    </div>
  );
};

export default PaymentButton;