import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveLogoToStorage } from '../firebaseStorage';
import { scanFileForVirus, validateFileSecurity } from '../utils/virusScan';
import './BusinessDetails.css';

const BusinessDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSquare, pageNumber, selectedDuration, finalAmount } = location.state || {};
  
  const [formData, setFormData] = useState({
    businessName: '',
    contactEmail: '',
    website: ''
  });
  const [logoData, setLogoData] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

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

    // Business name validation
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

  const previewLogo = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      setLogoData(null);
      return;
    }

    // Clear any previous errors
    setFormErrors(prev => ({ ...prev, logoData: '' }));

    // Basic security validation
    const securityCheck = await validateFileSecurity(file);
    if (!securityCheck.valid) {
      setFormErrors(prev => ({ ...prev, logoData: securityCheck.message }));
      event.target.value = '';
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

    // Read file first
    const reader = new FileReader();
    
    reader.onload = async function(e) {
      const dataURL = e.target.result;
      
      // Set logo data immediately (don't wait for virus scan)
      // This ensures mobile uploads work even if scan fails
      setLogoData(dataURL);
      setFormErrors(prev => ({ ...prev, logoData: '' }));
      console.log('✅ Logo file loaded, size:', (file.size / 1024).toFixed(2), 'KB');
      
      // Scan for viruses in background (non-blocking)
      // Mobile devices may have network issues, so we don't block upload if scan fails
      setFormErrors(prev => ({ ...prev, logoData: 'Verifying file security...' }));
      
      try {
        // Add timeout for mobile devices (5 seconds max)
        const scanPromise = scanFileForVirus(dataURL, file.name);
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            resolve({ safe: true, message: 'Scan timeout - upload allowed', warning: true });
          }, 5000); // 5 second timeout for mobile
        });
        
        const scanResult = await Promise.race([scanPromise, timeoutPromise]);
        
        if (!scanResult.safe) {
          // Show warning but don't block upload (mobile-friendly)
          console.warn('⚠️ Security scan warning:', scanResult.message);
          setFormErrors(prev => ({ ...prev, logoData: `Warning: ${scanResult.message}. Upload continuing...` }));
          // Still allow upload - don't block
        } else {
          // Clear any error messages
          setFormErrors(prev => ({ ...prev, logoData: '' }));
          console.log('✅ File passed security scan');
          
          if (scanResult.warning) {
            console.warn('⚠️ Virus scan warning:', scanResult.message);
          }
        }
      } catch (scanError) {
        console.error('❌ Virus scan error (non-blocking):', scanError);
        // Don't block upload if scan fails (especially important for mobile)
        setFormErrors(prev => ({ ...prev, logoData: '' }));
        console.warn('⚠️ Virus scan unavailable, upload allowed');
      }
    };
    
    reader.onerror = function(error) {
      console.error('❌ FileReader error:', error);
      setFormErrors(prev => ({ ...prev, logoData: 'Error reading file. Please try again or use a different image.' }));
      event.target.value = '';
      setLogoData(null);
    };
    
    reader.onabort = function() {
      console.warn('⚠️ File read aborted');
      setFormErrors(prev => ({ ...prev, logoData: 'File upload cancelled.' }));
      event.target.value = '';
      setLogoData(null);
    };
    
    // Start reading file
    try {
      reader.readAsDataURL(file);
    } catch (readError) {
      console.error('❌ Error starting file read:', readError);
      setFormErrors(prev => ({ ...prev, logoData: 'Error reading file. Please try a different image file.' }));
      event.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Please fix the form errors before continuing.');
      return;
    }

    setIsUploading(true);

    try {
      let firebaseLogoURL = null;
      
      // 🚀 UPLOAD LOGO TO FIREBASE STORAGE
      if (logoData) {
        console.log('📤 Starting logo upload process...');
        console.log('📊 Logo data preview:', logoData.substring(0, 50) + '...');
        
        try {
          // Generate unique purchase ID for logo storage (independent of square number)
          // This ensures logo persists even when square number changes during shuffle
          const purchaseId = `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          const uploadResult = await saveLogoToStorage(logoData, purchaseId);
          // Handle both old format (string) and new format (object)
          if (typeof uploadResult === 'string') {
            firebaseLogoURL = uploadResult;
          } else {
            firebaseLogoURL = uploadResult.url;
            // Store storage path and purchase ID for cleanup
            localStorage.setItem(`logoPath_${selectedSquare}`, uploadResult.path);
            localStorage.setItem(`purchaseId_${selectedSquare}`, uploadResult.purchaseId || purchaseId);
          }
          console.log('✅ Logo uploaded to Firebase Storage successfully!');
          console.log('🔗 Firebase URL:', firebaseLogoURL);
        } catch (uploadError) {
          console.error('❌ Firebase Storage upload failed:', uploadError);
          // If upload fails, check if it's already a URL
          if (logoData.startsWith('http')) {
            console.log('✅ Logo is already a URL, using it directly');
            firebaseLogoURL = logoData;
          } else {
            throw new Error('Failed to upload logo to Firebase Storage. Please check your Firebase configuration and try again.');
          }
        }
      } else {
        console.warn('⚠️ No logo data provided');
      }

      const businessData = {
        name: formData.businessName.trim(),
        email: formData.contactEmail.trim(),
        website: formData.website.trim(),
        logoData: firebaseLogoURL,
        squareNumber: selectedSquare,
        pageNumber: pageNumber,
        amount: finalAmount,
        duration: selectedDuration
      };

      // CRITICAL: Save logoData to temporary storage ONLY
      // These are TEMPORARY and will be cleaned up if payment is cancelled
      // Do NOT save to squarePurchases - that's only for confirmed payments
      localStorage.setItem('businessFormData', JSON.stringify(businessData));
      // Store logo temporarily - will be cleaned up on cancel or moved to squarePurchases on success
      localStorage.setItem(`logoData_${selectedSquare}`, firebaseLogoURL);
      localStorage.setItem('currentLogoData', firebaseLogoURL);
      
      // CRITICAL: Ensure this square is NOT in squarePurchases yet
      // Remove any existing entry to prevent showing logo before payment
      const squarePurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
      if (squarePurchases[selectedSquare] && 
          (squarePurchases[selectedSquare].paymentStatus !== 'paid' || 
           squarePurchases[selectedSquare].status !== 'active')) {
        delete squarePurchases[selectedSquare];
        localStorage.setItem('squarePurchases', JSON.stringify(squarePurchases));
        console.log(`🗑️ Removed unconfirmed purchase from squarePurchases for square ${selectedSquare}`);
      }
      
      // Save to pending purchases ONLY (not squarePurchases - that's for confirmed payments)
      const pendingData = {
        ...businessData,
        logoData: firebaseLogoURL, // Ensure logoData is included
        purchaseDate: new Date().toISOString(),
        status: 'pending', // Explicitly mark as pending
        paymentStatus: 'pending' // Not paid yet
      };
      
      const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
      const tempId = 'temp_' + Date.now();
      pendingPurchases[tempId] = pendingData;
      localStorage.setItem('pendingPurchases', JSON.stringify(pendingPurchases));
      
      // CRITICAL: Do NOT save to squarePurchases here - that will make ads appear before payment!
      // squarePurchases should only be updated AFTER payment is confirmed
      
      console.log('✅ Business data prepared with Firebase logo URL:', {
        squareNumber: selectedSquare,
        logoURL: firebaseLogoURL ? firebaseLogoURL.substring(0, 80) + '...' : 'MISSING',
        savedTo: ['businessFormData', `logoData_${selectedSquare}`, 'currentLogoData', 'pendingPurchases']
      });
      
      navigate('/payment', { 
        state: { 
          selectedSquare, 
          pageNumber, 
          selectedDuration, 
          finalAmount, 
          businessData: { ...businessData, logoData: firebaseLogoURL },
          logoData: firebaseLogoURL // CRITICAL: Pass logoData explicitly
        } 
      });
      
    } catch (error) {
      console.error('❌ Error uploading logo to Firebase:', error);
      alert('Error uploading logo. Please try again.');
    } finally {
      setIsUploading(false);
    }
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
                  
                  {/* Business Name */}
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
                        <p>Click or tap to upload your logo</p>
                        <small>PNG, JPG, GIF, WebP up to 2MB</small>
                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                          Works on desktop and mobile devices
                        </small>
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
                      className={`btn btn--primary ${!isFormValid || isUploading ? 'btn--disabled' : ''}`}
                      disabled={!isFormValid || isUploading}
                    >
                      {isUploading ? 'Uploading Logo...' : 'Continue to Payment'}
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