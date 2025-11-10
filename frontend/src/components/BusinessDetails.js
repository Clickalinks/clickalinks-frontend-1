import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BusinessDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { square, duration } = location.state || {};
  
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
      square,
      duration,
      businessName,
      contactEmail,
      dealLink,
      logoData
    };
    
    navigate('/checkout', { state: purchaseData });
  };

  return (
    <div className="business-details-page">
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
        <h1>Business & Advertisement Details</h1>
        
        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <p><strong>Square:</strong> #{square}</p>
          <p><strong>Duration:</strong> {duration} days</p>
          <p><strong>Total:</strong> £{duration}.00</p>
        </div>

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
          
          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email *</label>
            <input 
              type="email" 
              id="contactEmail" 
              required 
              placeholder="Enter your email address"
              value={contactEmail}
              onChange={(e) => {
                setContactEmail(e.target.value);
                validateForm();
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dealLink">Deal/Discount Page URL *</label>
            <input 
              type="url" 
              id="dealLink" 
              required 
              placeholder="https://yourwebsite.com/deals"
              value={dealLink}
              onChange={(e) => {
                setDealLink(e.target.value);
                validateForm();
              }}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="logoUpload">Company Logo *</label>
            <input 
              type="file" 
              id="logoUpload" 
              accept="image/*"
              onChange={previewLogo}
            />
            {logoData && (
              <div className="logo-preview">
                <img src={logoData} alt="Logo preview" />
              </div>
            )}
          </div>

          <button 
            type="button" 
            className="continue-btn" 
            onClick={handleContinue}
            disabled={!isFormValid}
          >
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessDetails;