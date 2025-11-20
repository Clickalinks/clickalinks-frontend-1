import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BusinessDetails.css';

const BusinessDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSquare, pageNumber, selectedDuration, finalAmount } = location.state || {};
  
  const [formData, setFormData] = useState({
    businessName: '', // ✅ Still collected for backend
    contactEmail: '',
    website: ''
  });
  const [logoData, setLogoData] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Validate required props on component mount
  useEffect(() => {
    if (!selectedSquare || !selectedDuration || !pageNumber) {
      console.error('❌ Missing required props:', { selectedSquare, selectedDuration, pageNumber });
      alert('Missing booking information. Please go back and select a square first.');
      navigate('/');
      return;
    }
  }, [selectedSquare, selectedDuration, pageNumber, navigate]);

  // Validate form whenever inputs change
  useEffect(() => {
    validateForm();
  }, [formData, logoData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};

    // Business name validation (required for backend but won't show on ad)
    if (!formData.businessName.trim()) {
      errors.businessName = 'Business name is required for our records';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.contactEmail.trim()) {
      errors.contactEmail = 'Contact email is required';
    } else if (!emailRegex.test(formData.contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address';
    }

    // Website validation
    if (!formData.website.trim()) {
      errors.website = 'Website URL is required';
    } else {
      try {
        new URL(formData.website);
      } catch (e) {
        errors.website = 'Please enter a valid URL (include http:// or https://)';
      }
    }

    // Logo validation
    if (!logoData) {
      errors.logoData = 'Company logo is required';
    }

    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    
    return isValid;
  };

  const previewLogo = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setLogoData(null);
      return;
    }

    // File type validation
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, logoData: 'Please upload a valid image (JPEG, PNG, GIF, WebP)' }));
      event.target.value = '';
      return;
    }

    // File size validation (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, logoData: 'File size must be less than 2MB' }));
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      setLogoData(e.target.result);
      setFormErrors(prev => ({ ...prev, logoData: '' }));
    };
    
    reader.onerror = function() {
      setFormErrors(prev => ({ ...prev, logoData: 'Error reading file. Please try again.' }));
      event.target.value = '';
    };
    
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the form errors before continuing.');
      return;
    }

    const businessData = {
      name: formData.businessName.trim(), // ✅ Sent to backend but won't display on ad
      email: formData.contactEmail.trim(),
      website: formData.website.trim(),
      logoData: logoData
    };

    // ✅ CRITICAL: Save to localStorage for Success page
    console.log('💾 Saving business form data to localStorage...');
    localStorage.setItem('businessFormData', JSON.stringify({
      ...businessData,
      logoData: logoData
    }));
    
    // ✅ Backup: Save to pending purchases
    const pendingData = {
      squareNumber: selectedSquare,
      pageNumber: pageNumber,
      businessName: businessData.name, // ✅ For backend records only
      contactEmail: businessData.email,
      website: businessData.website,
      logoData: logoData,
      amount: finalAmount,
      duration: selectedDuration,
      purchaseDate: new Date().toISOString()
    };
    
    const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
    const tempId = 'temp_' + Date.now();
    pendingPurchases[tempId] = pendingData;
    localStorage.setItem('pendingPurchases', JSON.stringify(pendingPurchases));
    
    console.log('✅ Business data saved to localStorage with logo:', !!logoData);
    
    navigate('/payment', { 
      state: { 
        selectedSquare, 
        pageNumber, 
        selectedDuration, 
        finalAmount, 
        businessData, 
        logoData 
      } 
    });
  };

  const handleBack = () => {
    navigate('/campaign');
  };

  if (!selectedSquare || !selectedDuration || !pageNumber) {
    return (
      <div className="business-details-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>No Advertising Square Selected</h2>
          <p>Please return to the grid and select an advertising square to continue.</p>
          <button onClick={() => navigate('/')} className="btn btn--primary">
            Return to Grid Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="business-details-container">
      <div className="business-details-content">
        {/* Header Section */}
        <header className="business-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Business Details</h1>
              <p className="header-subtitle">
                Complete your information for your advertising spot
              </p>
            </div>
            <nav className="progress-navigation">
              <div className="progress-step completed">
                <div className="step-indicator">
                  <div className="step-check">✓</div>
                </div>
                <span className="step-label">Campaign</span>
              </div>
              <div className="progress-step active">
                <div className="step-indicator">2</div>
                <span className="step-label">Details</span>
              </div>
              <div className="progress-step">
                <div className="step-indicator">3</div>
                <span className="step-label">Payment</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="business-main-content">
          <div className="content-wrapper">
            {/* Form Section */}
            <section className="form-section">
              <div className="section-header">
                <h2>Business Information</h2>
                <p>Enter your details and upload your logo</p>
              </div>

              <form className="business-form" onSubmit={handleSubmit}>
                {/* Business Information Card */}
                <div className="form-card">
                  <div className="card-header">
                    <div className="card-icon">🏢</div>
                    <div>
                      <h3>Contact Details</h3>
                      <p>Your contact information (business name is for our records only)</p>
                    </div>
                  </div>
                  
                  {/* Business Name - For backend records only */}
                  <div className="form-group">
                    <label htmlFor="businessName">Business Name *</label>
                    <input 
                      type="text" 
                      id="businessName"
                      name="businessName" 
                      required 
                      placeholder="Enter your business name"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      autoComplete="organization"
                      className={formErrors.businessName ? 'error' : ''}
                    />
                    {formErrors.businessName && (
                      <span className="error-message">{formErrors.businessName}</span>
                    )}
                    <small>For our records only - won't appear on your advertisement</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="contactEmail">Contact Email *</label>
                    <input 
                      type="email" 
                      id="contactEmail"
                      name="contactEmail" 
                      required 
                      placeholder="Enter your email address"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      autoComplete="email"
                      className={formErrors.contactEmail ? 'error' : ''}
                    />
                    {formErrors.contactEmail && (
                      <span className="error-message">{formErrors.contactEmail}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="website">Website URL *</label>
                    <input 
                      type="url" 
                      id="website"
                      name="website" 
                      required 
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={handleInputChange}
                      autoComplete="url"
                      className={formErrors.website ? 'error' : ''}
                    />
                    {formErrors.website && (
                      <span className="error-message">{formErrors.website}</span>
                    )}
                    <small>This is where customers will be directed when they click your logo</small>
                  </div>
                </div>

                {/* Logo Upload Card */}
                <div className="form-card">
                  <div className="card-header">
                    <div className="card-icon">🖼️</div>
                    <div>
                      <h3>Company Logo</h3>
                      <p>Upload your logo - it will fill the entire square</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="logoUpload">Upload Logo *</label>
                    <div className="file-upload-area">
                      <input 
                        type="file" 
                        id="logoUpload"
                        name="logo" 
                        accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                        onChange={previewLogo}
                        autoComplete="off"
                        className={formErrors.logoData ? 'error' : ''}
                      />
                      <div className="upload-placeholder">
                        <div className="upload-icon">📁</div>
                        <p>Click to upload your logo</p>
                        <small>PNG, JPG, GIF, WebP up to 2MB</small>
                      </div>
                    </div>
                    {formErrors.logoData && (
                      <span className="error-message">{formErrors.logoData}</span>
                    )}
                  </div>

                  {logoData && (
                    <div className="logo-preview">
                      <div className="preview-header">
                        <h4>Logo Preview</h4>
                        <p><small>Your logo will fill the entire square perfectly</small></p>
                        <button 
                          type="button" 
                          className="btn-remove"
                          onClick={() => {
                            setLogoData(null);
                            document.getElementById('logoUpload').value = '';
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <img src={logoData} alt="Logo preview" className="logo-preview-image" />
                    </div>
                  )}
                </div>

                {/* Hidden Submit Button for Enter key support */}
                <button type="submit" style={{ display: 'none' }}>Submit</button>
              </form>
            </section>

            {/* Order Summary Section */}
            <aside className="order-summary">
              <div className="summary-card">
                <div className="summary-header">
                  <h3 className="summary-title">Order Summary</h3>
                  <div className="summary-subtitle">Review your selection</div>
                </div>
                
                <div className="summary-content">
                  {/* Order Details */}
                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">Advertising Spot</span>
                      <span className="detail-value">#{selectedSquare}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Page Location</span>
                      <span className="detail-value">Page {pageNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Campaign Duration</span>
                      <span className="detail-value">{selectedDuration} days</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Daily Rate</span>
                      <span className="detail-value">£1.00/day</span>
                    </div>
                  </div>

                  <div className="summary-divider"></div>

                  {/* Total Amount */}
                  <div className="total-section">
                    <div className="total-labels">
                      <span className="total-label">Total Amount</span>
                      <span className="total-subtitle">One-time payment</span>
                    </div>
                    <span className="total-amount">£{finalAmount}.00</span>
                  </div>

                  {/* Features Included */}
                  <div className="features-included">
                    <h4>What's Included:</h4>
                    <div className="features-grid">
                      <div className="feature-item">
                        <span className="feature-emoji">👁️</span>
                        <span>High Visibility</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-emoji">🔗</span>
                        <span>Clickable Link</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-emoji">📊</span>
                        <span>Analytics</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-emoji">🛡️</span>
                        <span>Secure Hosting</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button 
                      onClick={handleBack}
                      className="btn btn--secondary"
                    >
                      <span className="btn-icon">←</span>
                      Back to Campaign
                    </button>
                    <button 
                      onClick={handleSubmit}
                      className={`btn btn--primary ${!isFormValid ? 'btn--disabled' : ''}`}
                      disabled={!isFormValid}
                    >
                      Continue to Payment
                      <span className="btn-icon">→</span>
                    </button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="trust-indicators">
                    <div className="trust-item">
                      <div className="trust-icon">🔒</div>
                      <span>Secure Payment</span>
                    </div>
                    <div className="trust-item">
                      <div className="trust-icon">⚡</div>
                      <span>Instant Setup</span>
                    </div>
                    <div className="trust-item">
                      <div className="trust-icon">↩️</div>
                      <span>Auto Shuffle</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BusinessDetails;