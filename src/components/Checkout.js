import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51SQ6vQR4gvxMxMMr1oW70IdZypVW4M6cI1m3kAvY36bCyWUsi2sdiZkYPu9JtoOrLcITLZCSXWOVQzdEPPuggL4A00oKIe2Wzj');

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state || {};
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Your existing coupon logic
  const availableCoupons = [
    { code: 'WELCOME10', discountPercent: 10, description: '10% off your first campaign' },
    { code: 'FREETRIAL', discountPercent: 100, description: '100% off - Free 10-day trial' },
  ];

  const applyCoupon = () => {
    const coupon = availableCoupons.find(c => c.code === couponCode.toUpperCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const baseAmount = orderData.duration || 0;
  const discountAmount = appliedCoupon 
    ? (baseAmount * appliedCoupon.discountPercent) / 100 
    : 0;
  const finalAmount = Math.max(0, baseAmount - discountAmount);

  // Payment function
  const handleStripePayment = async () => {
    setIsProcessing(true);
    setPaymentError(''); // Clear previous errors
    
    try {
      // Create checkout session via your backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          duration: orderData.duration,
          businessName: orderData.businessName,
          squareNumber: orderData.squareNumber,
          contactEmail: orderData.contactEmail,
          currency: 'gbp'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      const stripe = await stripePromise;
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        console.error('Stripe error:', error);
        setPaymentError('Payment failed: ' + error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('Payment processing error: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFreeCampaign = () => {
    navigate('/success', {
      state: {
        ...orderData,
        orderId: `CLK-FREE-${Date.now()}`,
        paymentDate: new Date().toISOString(),
        couponUsed: appliedCoupon,
        finalAmount: 0,
        discountAmount: discountAmount,
        isRealPayment: false
      }
    });
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>💳 Complete Your Payment</h1>
        <p>Secure payment processed via Stripe</p>
      </div>

      <div className="checkout-content">
        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Details</h3>
          <div className="summary-item">
            <span>Business Name:</span>
            <span>{orderData.businessName}</span>
          </div>
          <div className="summary-item">
            <span>Square Number:</span>
            <span>#{orderData.squareNumber}</span>
          </div>
          <div className="summary-item">
            <span>Campaign Duration:</span>
            <span>{orderData.duration} days</span>
          </div>
          <div className="summary-item">
            <span>Base Amount:</span>
            <span>£{baseAmount}.00</span>
          </div>
          {appliedCoupon && (
            <div className="summary-item discount">
              <span>Discount ({appliedCoupon.discountPercent}%):</span>
              <span>-£{discountAmount}.00</span>
            </div>
          )}
          <div className="summary-item total">
            <span>Final Amount:</span>
            <span>£{finalAmount}.00</span>
          </div>
        </div>

        {/* Coupon Section */}
        <div className="coupon-section">
          <h4>💝 Have a coupon code?</h4>
          <div className="coupon-input-group">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="coupon-input"
            />
            <button onClick={applyCoupon} className="btn-coupon">
              Apply
            </button>
          </div>
          {couponError && <div className="coupon-error">{couponError}</div>}
          {appliedCoupon && (
            <div className="coupon-success">
              ✅ {appliedCoupon.description} applied!
            </div>
          )}
        </div>

        {/* Payment Error Display */}
        {paymentError && (
          <div className="payment-error" style={{ 
            color: 'red', 
            backgroundColor: '#ffe6e6',
            padding: '10px',
            borderRadius: '5px',
            margin: '15px 0',
            border: '1px solid #ffcccc'
          }}>
            ❌ {paymentError}
          </div>
        )}

        {/* Payment Section */}
        {finalAmount > 0 ? (
          <div className="payment-section">
            <h3>💳 Payment Method</h3>
            <p>You'll be redirected to Stripe's secure checkout page to complete your payment.</p>
            
            <button 
              onClick={handleStripePayment}
              disabled={isProcessing}
              className="btn-primary"
            >
              {isProcessing ? 'Redirecting to Secure Payment...' : `Pay £${finalAmount}.00 Now`}
            </button>
            
            <div className="payment-security">
              <small>🔒 Secure payment processed by Stripe. Your card details are never stored on our servers.</small>
            </div>
          </div>
        ) : (
          <div className="free-campaign-notice">
            <h4>🎉 Free Campaign Activated!</h4>
            <p>No payment required. Click below to start your free campaign.</p>
            <button onClick={handleFreeCampaign} className="btn-primary">
              Start Free {orderData.duration}-Day Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;