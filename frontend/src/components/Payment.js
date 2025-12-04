import React, { useState, useEffect } from 'react';
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
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmountAfterDiscount, setFinalAmountAfterDiscount] = useState(finalAmount || 10);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';

  // Update finalAmountAfterDiscount when finalAmount changes
  useEffect(() => {
    if (!appliedPromo) {
      setFinalAmountAfterDiscount(finalAmount || 10);
    }
  }, [finalAmount, appliedPromo]);

  // CRITICAL: Cleanup function when component unmounts (user navigates away)
  // This prevents logos from appearing if user cancels payment by navigating away
  useEffect(() => {
    return () => {
      // Only cleanup if payment wasn't completed
      // Check if we're navigating to success page
      const currentPath = window.location.pathname;
      if (currentPath !== '/success' && currentPath !== '/cancel') {
        console.log('🧹 Payment page unmounted without completion - cleaning up...');
        
        // Get the square number from state or localStorage
        const businessFormData = JSON.parse(localStorage.getItem('businessFormData') || '{}');
        const squareNumber = selectedSquare || businessFormData.squareNumber;
        
        if (squareNumber) {
          // Clean up localStorage
          localStorage.removeItem('businessFormData');
          localStorage.removeItem('currentLogoData');
          localStorage.removeItem(`logoData_${squareNumber}`);
          
          // Remove from pendingPurchases
          const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
          Object.keys(pendingPurchases).forEach(key => {
            if (pendingPurchases[key].squareNumber === squareNumber) {
              delete pendingPurchases[key];
            }
          });
          localStorage.setItem('pendingPurchases', JSON.stringify(pendingPurchases));
          
          // Remove from squarePurchases if status is pending
          const squarePurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
          if (squarePurchases[squareNumber] && 
              (squarePurchases[squareNumber].status !== 'active' || 
               squarePurchases[squareNumber].paymentStatus !== 'paid')) {
            delete squarePurchases[squareNumber];
            localStorage.setItem('squarePurchases', JSON.stringify(squarePurchases));
            console.log(`🗑️ Removed unconfirmed purchase from squarePurchases: square ${squareNumber}`);
          }
        }
        
        // Note: Firestore cleanup happens in Cancel.js when user explicitly cancels
      }
    };
  }, [selectedSquare]);

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
      // Check localStorage first, then location state, then businessFormData
      logoData: logoData || 
                businessData?.logoData || 
                businessFormData.logoData || 
                currentLogo ||
                localStorage.getItem(`logoData_${selectedSquare}`),
      
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
      // CRITICAL: Do NOT save to squarePurchases here - that would make logos appear!
      // squarePurchases is only for CONFIRMED payments (status='active', paymentStatus='paid')
      // Save to pendingPurchases instead - AdGrid will NOT read from there
      const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
      pendingPurchases[sessionId] = {
        ...purchaseData,
        status: 'pending', // NOT 'active' until payment confirmed
        paymentStatus: 'pending' // NOT 'paid' until payment confirmed
      };
      localStorage.setItem('pendingPurchases', JSON.stringify(pendingPurchases));
      console.log('✅ Layer 1: Saved to pendingPurchases (will NOT show until payment confirmed)');
      
      // CRITICAL: Remove from squarePurchases if it exists (shouldn't, but safety check)
      const squarePurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
      if (squarePurchases[selectedSquare] && 
          (squarePurchases[selectedSquare].paymentStatus !== 'paid' || 
           squarePurchases[selectedSquare].status !== 'active')) {
        delete squarePurchases[selectedSquare];
        localStorage.setItem('squarePurchases', JSON.stringify(squarePurchases));
        console.log('🗑️ Removed unconfirmed purchase from squarePurchases');
      }

      // Layer 3: Simple key-value backup
      localStorage.setItem(`purchase_${selectedSquare}`, JSON.stringify(purchaseData));
      console.log('✅ Layer 3: Saved to simple backup');

      // Layer 4: Optional debug endpoint (fails silently if unavailable)
      // This is for backend debugging only - purchase works fine without it
      if (BACKEND_URL) {
        // Use a no-op catch to suppress console errors
        fetch(`${BACKEND_URL}/api/debug-purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            squareNumber: selectedSquare,
            step: 'payment_before_redirect',
            data: { ...purchaseData, logoData: purchaseData.logoData ? 'PRESENT' : 'MISSING' }
          })
        }).catch(() => {
          // Silently ignore - debug endpoint is optional
        });
      }

    } catch (error) {
      console.error('❌ Persistence error:', error);
    }

    return purchaseData;
  };

  // Promo code validation
  const handlePromoCode = async () => {
    const code = promoCode.trim().toUpperCase();
    setErrors(prev => ({ ...prev, promo: '' }));
    
    if (!code) {
      setErrors(prev => ({ ...prev, promo: 'Please enter a promo code' }));
      return;
    }

    try {
      // Validate promo code with backend
      const response = await fetch(`${BACKEND_URL}/api/promo-code/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          originalAmount: finalAmount || 10
        })
      });

      if (!response.ok) {
        // If response is not OK, try to get error text
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = `HTTP ${response.status} ${response.statusText}`;
        }
        throw new Error(`Failed to validate promo code: ${errorText}`);
      }
      
      const result = await response.json();

      if (result.valid && result.success) {
        // Promo code is valid
        let discount = result.discountAmount || 0;
        // CRITICAL: Use nullish coalescing to handle 0 correctly
        // If result.finalAmount is 0, we want to use 0, not fall back
        let finalPrice = result.finalAmount ?? finalAmount ?? 10;
        let freeDays = result.freeDays || 0;

        // Handle free_days discount type (extends duration instead of reducing price)
        if (result.discountType === 'free_days' && freeDays > 0) {
          discount = 0; // No price discount
          finalPrice = finalAmount ?? 10; // Price unchanged
        }
        
        // CRITICAL: If discount type is 'free', ensure finalPrice is 0
        if (result.discountType === 'free') {
          finalPrice = 0;
          discount = finalAmount ?? 10;
        }

        setAppliedPromo({
          code: result.code,
          discountType: result.discountType,
          discountValue: result.discountValue,
          discount: discount,
          finalAmount: finalPrice, // Store finalAmount in appliedPromo for reference
          description: result.description || 'Promo code applied',
          freeDays: freeDays,
          promoId: result.promoId
        });
        setDiscountAmount(discount);
        setFinalAmountAfterDiscount(finalPrice);
        
        console.log('✅ Promo code applied:', code, {
          discountType: result.discountType,
          discount: discount,
          finalPrice: finalPrice,
          freeDays: freeDays,
          resultFinalAmount: result.finalAmount,
          originalAmount: finalAmount
        });
      } else {
        // Invalid promo code
        setErrors(prev => ({ ...prev, promo: result.error || 'Invalid promo code' }));
        setAppliedPromo(null);
        setDiscountAmount(0);
        setFinalAmountAfterDiscount(finalAmount || 10);
      }
    } catch (error) {
      console.error('❌ Error validating promo code:', error);
      setErrors(prev => ({ ...prev, promo: 'Error validating promo code. Please try again.' }));
      setAppliedPromo(null);
      setDiscountAmount(0);
      setFinalAmountAfterDiscount(finalAmount || 10);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setDiscountAmount(0);
    setFinalAmountAfterDiscount(finalAmount || 10);
    setErrors(prev => ({ ...prev, promo: '' }));
  };

  const handlePayment = async () => {
    if (!acceptedTerms) {
      setErrors({ terms: 'Please accept the terms and conditions' });
      return;
    }

    setIsProcessing(true);
    setErrors({});

    try {
      // CRITICAL: Check if promo code makes it free
      // Check both the calculated amount AND if appliedPromo exists with discountType 'free'
      const isFreeFromPromo = appliedPromo && (
        appliedPromo.discountType === 'free' || 
        (appliedPromo.finalAmount !== undefined && appliedPromo.finalAmount === 0)
      );
      
      // CRITICAL: Use nullish coalescing (??) instead of || to handle 0 correctly
      // If finalAmountAfterDiscount is 0, we want to use 0, not fall back to finalAmount
      const calculatedAmount = finalAmountAfterDiscount ?? finalAmount ?? 10;
      const amountToCharge = Math.round(calculatedAmount * 100) / 100;
      
      console.log('🔍 Payment check:', {
        finalAmountAfterDiscount,
        finalAmount,
        calculatedAmount,
        amountToCharge,
        appliedPromo: appliedPromo ? appliedPromo.code : 'None',
        isFreeFromPromo,
        discountType: appliedPromo?.discountType,
        discountAmount: appliedPromo?.discount
      });
      
      // If amount is zero or negative (from promo code or otherwise), skip Stripe and go directly to success
      // Also check if promo code explicitly makes it free
      if (amountToCharge <= 0 || isFreeFromPromo) {
        console.log('🎉 Free purchase detected, skipping Stripe payment...');
        console.log('📊 Amount details:', {
          finalAmountAfterDiscount,
          amountToCharge,
          appliedPromo: appliedPromo ? appliedPromo.code : 'None',
          originalAmount: finalAmount
        });
        
        // Create a fake session ID for free purchases
        const fakeSessionId = `free_${Date.now()}_${selectedSquare}`;
        
        // Persist data
        persistPurchaseData(fakeSessionId);
        
        // Calculate final duration (add free days if promo code provides them)
        let finalDuration = selectedDuration || 30;
        if (appliedPromo && appliedPromo.freeDays && appliedPromo.freeDays > 0) {
          finalDuration = finalDuration + appliedPromo.freeDays;
          console.log(`🎁 Adding ${appliedPromo.freeDays} free days from promo code. New duration: ${finalDuration} days`);
        }
        
        // Save directly to Firestore and localStorage
        const purchaseData = {
          squareNumber: selectedSquare,
          pageNumber: pageNumber || 1,
          businessName: businessData?.name,
          contactEmail: businessData?.email,
          website: businessData?.website,
          logoData: logoData || businessData?.logoData || localStorage.getItem(`logoData_${selectedSquare}`),
          amount: 0,
          duration: finalDuration,
          selectedDuration: finalDuration,
          transactionId: fakeSessionId,
          purchaseDate: new Date().toISOString(),
          status: 'active',
          paymentStatus: 'paid',
          promoCode: promoCode.toUpperCase(),
          freeDays: appliedPromo?.freeDays || 0,
          promoId: appliedPromo?.promoId || null
        };

        // Save to localStorage
        const squarePurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
        squarePurchases[selectedSquare] = purchaseData;
        localStorage.setItem('squarePurchases', JSON.stringify(squarePurchases));

        // Import and save to Firestore
        try {
          const { savePurchaseToFirestore } = await import('../utils/savePurchaseToFirestore');
          const firestoreData = {
            ...purchaseData,
            endDate: new Date(Date.now() + finalDuration * 24 * 60 * 60 * 1000).toISOString()
          };
          
          await savePurchaseToFirestore(firestoreData);
          console.log('✅ Firestore save completed');
        } catch (firestoreError) {
          console.warn('⚠️ Firestore save error (non-blocking):', firestoreError);
        }

        // Apply promo code usage tracking
        if (appliedPromo && appliedPromo.promoId) {
          fetch(`${BACKEND_URL}/api/promo-code/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              promoId: appliedPromo.promoId
            })
          }).catch(err => console.warn('Promo code tracking failed:', err));
        }

        setIsProcessing(false);
        
        // Navigate to success page
        const params = new URLSearchParams({
          square: selectedSquare.toString(),
          session_id: fakeSessionId,
          free: 'true'
        });
        window.location.href = `/success?${params.toString()}`;
        
        return;
      }

      // Double-check: Don't create Stripe session if amount is zero or negative
      // CRITICAL: Use nullish coalescing (??) instead of || to handle 0 correctly
      const amountToChargeForStripe = Math.round((finalAmountAfterDiscount ?? finalAmount ?? 10) * 100) / 100;
      
      console.log('🔍 Stripe check:', {
        finalAmountAfterDiscount,
        finalAmount,
        amountToChargeForStripe
      });
      
      if (amountToChargeForStripe <= 0) {
        console.error('❌ ERROR: Attempted to create Stripe session with zero/negative amount:', amountToChargeForStripe);
        setErrors({ payment: 'Invalid amount. Please contact support.' });
        setIsProcessing(false);
        return;
      }

      const payload = {
        amount: amountToChargeForStripe,
        squareNumber: selectedSquare,
        pageNumber: pageNumber,
        duration: selectedDuration,
        businessName: businessData?.name,
        contactEmail: businessData?.email,
        website: businessData?.website,
        promoCode: appliedPromo ? promoCode.toUpperCase() : null
      };

      console.log('💰 Creating Stripe session for square:', selectedSquare, 'Amount: £' + amountToChargeForStripe);
      
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
            {appliedPromo && (
              <>
                <div className="summary-item discount-line">
                  <span>Subtotal:</span>
                  <span>£{(finalAmount || 10).toFixed(2)}</span>
                </div>
                <div className="summary-item discount-line">
                  <span>Discount ({appliedPromo.description}):</span>
                  <span className="discount-amount">-£{discountAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="summary-item total">
              <span>Total Amount:</span>
              <span className="total-amount">£{finalAmountAfterDiscount.toFixed(2)}</span>
            </div>
            {appliedPromo && finalAmountAfterDiscount === 0 && (
              <div className="free-purchase-badge">
                🎉 Free Purchase - No Payment Required!
              </div>
            )}

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

            {/* Promo Code Section */}
            <div className="promo-code-section">
              <h3>Have a Promo Code?</h3>
              <div className="promo-code-input-group">
                <input
                  type="text"
                  className="promo-code-input"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setErrors(prev => ({ ...prev, promo: '' }));
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePromoCode();
                    }
                  }}
                  disabled={isProcessing}
                />
                {appliedPromo ? (
                  <button
                    type="button"
                    className="btn-promo-remove"
                    onClick={removePromoCode}
                    disabled={isProcessing}
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-promo"
                    onClick={handlePromoCode}
                    disabled={isProcessing}
                  >
                    Apply
                  </button>
                )}
              </div>
              {errors.promo && <span className="error-message">{errors.promo}</span>}
              {appliedPromo && (
                <div className="coupon-success">
                  ✅ {appliedPromo.description} applied! {discountAmount > 0 && `You save £${discountAmount.toFixed(2)}`}
                  {appliedPromo.freeDays > 0 && ` + ${appliedPromo.freeDays} free days`}
                </div>
              )}
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
                  finalAmountAfterDiscount === 0 ? 'Complete Free Purchase' : `Pay £${finalAmountAfterDiscount.toFixed(2)} Now`
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