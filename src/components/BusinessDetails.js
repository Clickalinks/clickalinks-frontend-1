import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BusinessDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { squareNumber, duration, pageNumber } = location.state || {};
  
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [dealLink, setDealLink] = useState('');
  const [logoData, setLogoData] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const validateForm = () => {
    const isValid = businessName && contactEmail && dealLink && logoData;
    setIsFormValid(isValid);
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

  const handleContinue = () => {
    const purchaseData = {
      squareNumber,
      duration,
      pageNumber,
      businessName,
      contactEmail,
      dealLink,
      logoData
    };
    
    navigate('/checkout', { state: purchaseData });
  };

  const totalAmount = duration;

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>🛍️ Business & Advertisement Details</h1>
        <p>Complete your advertising campaign setup</p>
      </div>

      <div className="checkout-content">
        {/* Order Summary */}
        <div className="order-summary">
          <h3>📋 Order Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span>Square Number:</span>
              <strong>#{squareNumber}</strong>
            </div>
            <div className="summary-item">
              <span>Page:</span>
              <strong>Page {pageNumber}</strong>
            </div>
            <div className="summary-item">
              <span>Duration:</span>
              <strong>{duration} days</strong>
            </div>
            <div className="summary-item">
              <span>Daily Rate:</span>
              <strong>£1.00/day</strong>
            </div>
            <div className="summary-item total">
              <span>Total Amount:</span>
              <strong>£{totalAmount}.00</strong>
            </div>
          </div>
        </div>

        {/* Fixed Form with proper attributes */}
        <form className="business-form">
          <div className="form-section">
            <h3>🏢 Business Information</h3>
            
            <div className="form-group">
              <label htmlFor="businessName">Business Name *</label>
              <input 
                type="text" 
                id="businessName"
                name="businessName" 
                required 
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  validateForm();
                }}
                autoComplete="organization"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email *</label>
              <input 
                type="email" 
                id="contactEmail"
                name="email" 
                required 
                placeholder="Enter your email address"
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(e.target.value);
                  validateForm();
                }}
                autoComplete="email"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dealLink">Deal/Discount Page URL *</label>
              <input 
                type="url" 
                id="dealLink"
                name="dealLink" 
                required 
                placeholder="https://yourwebsite.com/deals"
                value={dealLink}
                onChange={(e) => {
                  setDealLink(e.target.value);
                  validateForm();
                }}
                autoComplete="url"
              />
              <small>This is where customers will be directed when they click your logo</small>
            </div>
          </div>

          <div className="form-section">
            <h3>🖼️ Company Logo</h3>
            
            <div className="form-group">
              <label htmlFor="logoUpload">Upload Logo *</label>
              <input 
                type="file" 
                id="logoUpload"
                name="logo" 
                accept="image/*"
                onChange={previewLogo}
                autoComplete="off"
              />
              <small>PNG, JPG up to 2MB. Recommended: Square logo for best display</small>
            </div>

            {logoData && (
              <div className="logo-preview">
                <h4>Logo Preview:</h4>
                <img src={logoData} alt="Logo preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleContinue}
              disabled={!isFormValid}
            >
              Continue to Payment →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessDetails;