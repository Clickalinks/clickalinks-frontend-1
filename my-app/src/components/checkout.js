import React, { useState, useEffect } from 'react';
import './Checkout.css';

const Checkout = () => {
  const [selectedSquare, setSelectedSquare] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [logoData, setLogoData] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [dealLink, setDealLink] = useState('');
  const [adText, setAdText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    getOrderDetails();
  }, []);

  const getOrderDetails = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const square = urlParams.get('square') || 1;
    const duration = urlParams.get('duration') || 10;
    
    setSelectedSquare(square);
    setSelectedDuration(duration);
  };

  const previewLogo = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        setLogoData(e.target.result);
        validateForm();
      }
      reader.readAsDataURL(file);
    }
  };

  const updateCharCount = (e) => {
    const text = e.target.value;
    setAdText(text);
    setCharCount(text.length);
    validateForm();
  };

  const validateForm = () => {
    const isValid = businessName && contactEmail && dealLink && logoData;
    setIsFormValid(isValid);
  };

  const processPayment = async () => {
    const purchaseData = {
      squareId: selectedSquare,
      duration: selectedDuration,
      businessName: businessName,
      contactEmail: contactEmail,
      dealLink: dealLink,
      logoData: logoData,
      adText: adText,
      purchaseDate: new Date().toISOString(),
      endDate: new Date(Date.now() + selectedDuration * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    };

    try {
      console.log('🔄 Sending request to backend...', {
        squareId: selectedSquare,
        duration: selectedDuration,
        purchaseData: purchaseData
      });

      const response = await fetch('https://clickalinks-backend-1.onrender.com/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          squareId: selectedSquare,
          duration: selectedDuration,
          purchaseData: purchaseData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const session = await response.json();
      console.log('✅ Session created:', session);
      
      localStorage.setItem(`purchase_${selectedSquare}`, JSON.stringify(purchaseData));
      window.location.href = session.url;

    } catch (error) {
      console.error('❌ Payment error:', error);
      let errorMessage = 'Payment processing error: ';
      if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Cannot connect to payment server. Please try again.';
      } else {
        errorMessage += error.message;
      }
      alert(errorMessage);
    }
  };

  return (
    <div>
      <button className="go-back-btn" onClick={() => window.history.back()}>
        <i className="fas fa-arrow-left"></i> Back
      </button>

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
        <div className="checkout-box">
          <h1>🎯 Complete Your Purchase</h1>
          
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div>
              <div><strong>Square:</strong> #{selectedSquare}</div>
              <div><strong>Duration:</strong> {selectedDuration} days</div>
              <div><strong>Total:</strong> £{selectedDuration}.00</div>
            </div>
          </div>
          
          <h2>Business & Advertisement Details</h2>
          <p>Fill in your business information to display on your square</p>
          
          <form>
            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input 
                type="text" 
                id="businessName" 
                required 
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  validateForm();
                }}
              />
            </div>
            
            {/* Add all other form fields similarly */}
            
            <button 
              type="button" 
              className="btn-pay" 
              onClick={processPayment} 
              disabled={!isFormValid}
            >
              <i className="fas fa-lock"></i> Pay Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;