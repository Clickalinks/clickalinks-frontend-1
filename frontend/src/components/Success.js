import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { saveLogoToStorage } from '../firebaseStorage';
import './Success.css';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processSuccess = async () => {
      console.log('🎉 Processing successful payment...');
      
      // Try to get data from multiple sources
      const businessFormData = JSON.parse(localStorage.getItem('businessFormData') || '{}');
      const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
      
      console.log('🔍 Available data:', {
        businessFormData: businessFormData,
        pendingPurchases: Object.keys(pendingPurchases),
        locationState: location.state
      });

      let purchaseData = {};
      
      if (sessionId) {
        // Stripe redirect - try to reconstruct from localStorage
        console.log('🔄 Stripe redirect detected, session:', sessionId);
        
        // Try multiple sources for logo data
        const businessFormData = JSON.parse(localStorage.getItem('businessFormData') || '{}');
        const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
        
        // Find the most recent pending purchase
        const pendingKeys = Object.keys(pendingPurchases);
        const latestPending = pendingKeys.length > 0 ? pendingPurchases[pendingKeys[pendingKeys.length - 1]] : null;
        
        if (latestPending) {
          purchaseData = {
            squareNumber: latestPending.squareNumber,
            pageNumber: latestPending.pageNumber || 1,
            businessName: latestPending.businessName,
            contactEmail: latestPending.contactEmail,
            website: latestPending.website,
            finalAmount: latestPending.amount || 10,
            selectedDuration: latestPending.duration || 30,
            transactionId: sessionId,
            logoData: latestPending.logoData || businessFormData.logoData,
            paymentStatus: 'paid'
          };
          console.log('✅ Reconstructed from pending purchase with logo:', !!purchaseData.logoData);
        } else if (businessFormData.businessName) {
          // Fallback to businessFormData
          purchaseData = {
            squareNumber: businessFormData.squareNumber || 1,
            pageNumber: businessFormData.pageNumber || 1,
            businessName: businessFormData.name,
            contactEmail: businessFormData.email,
            website: businessFormData.website,
            finalAmount: businessFormData.amount || 10,
            selectedDuration: businessFormData.duration || 30,
            transactionId: sessionId,
            logoData: businessFormData.logoData,
            paymentStatus: 'paid'
          };
          console.log('✅ Reconstructed from business form data with logo:', !!purchaseData.logoData);
        }
      } else {
        // Direct purchase (not Stripe redirect)
        purchaseData = location.state || {};
        console.log('✅ Direct purchase data with logo:', !!purchaseData.logoData);
      }

      if (purchaseData.squareNumber && purchaseData.businessName) {
        setOrderData(purchaseData);
        await savePurchaseToStorage(purchaseData);
      } else {
        console.error('❌ Could not reconstruct purchase data');
      }
      
      setIsLoading(false);
    };

    processSuccess();
  }, [sessionId, location.state]);

  // Save purchase to storage
  const savePurchaseToStorage = async (data) => {
    console.log('💾 SAVING FINAL PURCHASE WITH FIREBASE STORAGE');

    let finalLogoURL = data.logoData;

    // Check if we need to upload to Firebase (if it's still a data URL)
    if (data.logoData && data.logoData.startsWith('data:')) {
      console.log('🔄 Uploading data URL to Firebase Storage...');
      try {
        finalLogoURL = await saveLogoToStorage(data.logoData, data.squareNumber);
        console.log('✅ Data URL converted to Firebase URL:', finalLogoURL);
      } catch (error) {
        console.error('❌ Failed to upload logo to Firebase:', error);
        finalLogoURL = data.logoData; // Fallback to data URL
      }
    }

    const purchaseData = {
      status: 'active',
      businessName: data.businessName,
      logoData: finalLogoURL,
      dealLink: data.website,
      contactEmail: data.contactEmail,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (data.selectedDuration || 30) * 24 * 60 * 60 * 1000).toISOString(),
      amount: data.finalAmount || 10,
      duration: data.selectedDuration || 30,
      transactionId: data.transactionId,
      purchaseDate: new Date().toISOString(),
      paymentStatus: 'paid',
      storageType: finalLogoURL && finalLogoURL.includes('firebasestorage') ? 'firebase' : 'local'
    };

    // Save to localStorage
    const existingPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
    existingPurchases[data.squareNumber] = purchaseData;
    localStorage.setItem('squarePurchases', JSON.stringify(existingPurchases));

    console.log('✅ FINAL SAVE WITH FIREBASE:', {
      square: data.squareNumber,
      logoType: purchaseData.storageType,
      logoURL: finalLogoURL ? 'PRESENT' : 'MISSING'
    });

    // Cleanup
    localStorage.removeItem('pendingPurchases');
    localStorage.removeItem('businessFormData');

    // Force refresh
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('purchaseCompleted'));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="success-container">
        <div className="success-content">
          <div className="loading-spinner"></div>
          <h1>Setting Up Your Ad... ⏳</h1>
          <p>Please wait while we activate your advertising campaign.</p>
          {sessionId && <p>Session: {sessionId}</p>}
        </div>
      </div>
    );
  }

  if (!orderData.squareNumber) {
    return (
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">❓</div>
          <h1>Payment Processed! 🎉</h1>
          <p>Your payment was successful, but we couldn't retrieve all order details.</p>
          <p>Your ad should be live on the grid.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            View Grid
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="success-container">
      <div className="success-content">
        <div className="success-icon">✅</div>
        
        <h1>Payment Successful! 🎉</h1>
        
        <p className="success-message">
          Your advertising campaign is now live and active!
        </p>

        <div className="order-details">
          <h3>Order Details</h3>
          <div className="detail-item">
            <span>Business Name:</span>
            <strong>{orderData.businessName}</strong>
          </div>
          <div className="detail-item">
            <span>Advertising Square:</span>
            <strong>#{orderData.squareNumber} (Page {orderData.pageNumber || 1})</strong>
          </div>
          <div className="detail-item">
            <span>Campaign Duration:</span>
            <strong>{orderData.selectedDuration || 30} days</strong>
          </div>
          <div className="detail-item">
            <span>Total Paid:</span>
            <strong>£{orderData.finalAmount || 10}.00</strong>
          </div>
          {orderData.transactionId && (
            <div className="detail-item">
              <span>Transaction ID:</span>
              <strong className="transaction-id">{orderData.transactionId}</strong>
            </div>
          )}
        </div>

        <div className="success-actions">
          <button 
            onClick={() => {
              window.dispatchEvent(new Event('storage'));
              navigate(`/page${orderData.pageNumber || 1}`);
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

        <div className="debug-section">
          <h4>Debug Info</h4>
          <p>Square: #{orderData.squareNumber} | Logo: {orderData.logoData ? '✅' : '❌'}</p>
          <button 
            onClick={() => {
              console.log('📦 DEBUG DATA:', {
                orderData,
                squarePurchases: JSON.parse(localStorage.getItem('squarePurchases') || '{}'),
                hasLogo: !!orderData.logoData
              });
              alert('Check browser console for debug data');
            }}
            className="btn-secondary"
          >
            📊 Show Debug Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;