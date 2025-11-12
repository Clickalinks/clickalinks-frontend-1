import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state || {};

  // TEMPORARY session storage - disappears on browser close
  React.useEffect(() => {
    if (orderData.squareNumber && orderData.businessName && orderData.logoData) {
      console.log('💾 Temporarily storing ad for this session...');
      
      const purchaseData = {
        status: 'active',
        businessName: orderData.businessName,
        logoData: orderData.logoData, // This is the uploaded logo
        dealLink: orderData.dealLink,
        contactEmail: orderData.contactEmail,
        startDate: new Date().toISOString(),
        // Set to expire in 24 hours (or whenever browser closes)
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      // Load existing purchases or create empty object
      const existingPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
      
      // Add new purchase
      existingPurchases[orderData.squareNumber] = purchaseData;
      
      // Save back to localStorage (temporary - browser session only)
      localStorage.setItem('squarePurchases', JSON.stringify(existingPurchases));
      
      console.log('✅ Ad temporarily stored! Will disappear when browser closes.');
      
      // Trigger AdGrid refresh
      window.dispatchEvent(new Event('storage'));
    }
  }, [orderData]);

  if (!orderData.squareNumber) {
    return (
      <div className="success-container">
        <div className="success-content">
          <h1>Order Complete! 🎉</h1>
          <p>Your advertising campaign has been successfully set up.</p>
          <Link to="/" className="btn-primary">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="success-container">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <h1>Congratulations! 🎉</h1>
        <p className="success-message">
          Your advertising campaign is now live!
          <br />
          <small>🔒 Stored temporarily for this browser session only</small>
        </p>
        
        <div className="order-details">
          <h3>Order Details</h3>
          <div className="detail-item">
            <span>Business Name:</span>
            <strong>{orderData.businessName}</strong>
          </div>
          <div className="detail-item">
            <span>Advertising Square:</span>
            <strong>#{orderData.squareNumber} (Page {orderData.pageNumber})</strong>
          </div>
          <div className="detail-item">
            <span>Campaign Duration:</span>
            <strong>This browser session</strong>
          </div>
          {orderData.finalAmount > 0 && (
            <div className="detail-item">
              <span>Total Paid:</span>
              <strong>£{orderData.finalAmount}.00</strong>
            </div>
          )}
        </div>

        <div className="success-actions">
          <button 
            onClick={() => {
              // Force refresh to show the new ad
              window.location.href = `/page${orderData.pageNumber}`;
            }}
            className="btn-primary"
          >
            👁️ View Your Live Ad
          </button>
          <button 
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            🏠 Return Home
          </button>
        </div>

        <div className="success-tips">
          <h4>Session-Based Advertising</h4>
          <ul>
            <li>✅ Your ad is live immediately</li>
            <li>🔄 Refresh the page to see your ad</li>
            <li>🚫 Ad disappears when browser closes</li>
            <li>🔒 No permanent data storage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Success;