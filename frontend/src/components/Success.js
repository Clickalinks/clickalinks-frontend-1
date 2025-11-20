import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import './Success.css';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Check if this is a Stripe redirect (has session_id in URL)
  const sessionId = searchParams.get('session_id');

  // 🔥 Save purchase to Firebase Firestore
  const savePurchaseToFirestore = async (data) => {
    try {
      const purchaseData = {
        status: 'active',
        logoData: data.logoData,
        dealLink: data.website,
        contactEmail: data.contactEmail,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (data.selectedDuration || 30) * 24 * 60 * 60 * 1000).toISOString(),
        amount: data.finalAmount || 10,
        duration: data.selectedDuration || 30,
        transactionId: data.transactionId || 'temp_' + Math.random().toString(36).substr(2, 9),
        purchaseDate: new Date().toISOString(),
        paymentStatus: 'paid',
        pageNumber: data.pageNumber || 1,
        lastUpdated: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, 'purchasedSquares', data.squareNumber.toString()), purchaseData);
      console.log('✅ Purchase saved to Firestore');
      
      // Also save to localStorage as backup
      const existingPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
      existingPurchases[data.squareNumber] = purchaseData;
      localStorage.setItem('squarePurchases', JSON.stringify(existingPurchases));
      
      return true;
    } catch (error) {
      console.error('❌ Firestore save error:', error);
      // Fallback to localStorage only
      const existingPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
      existingPurchases[data.squareNumber] = {
        status: 'active',
        logoData: data.logoData,
        dealLink: data.website,
        contactEmail: data.contactEmail,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (data.selectedDuration || 30) * 24 * 60 * 60 * 1000).toISOString(),
        amount: data.finalAmount || 10,
        duration: data.selectedDuration || 30,
        transactionId: data.transactionId || 'temp_' + Math.random().toString(36).substr(2, 9),
        purchaseDate: new Date().toISOString(),
        paymentStatus: 'paid',
        pageNumber: data.pageNumber || 1
      };
      localStorage.setItem('squarePurchases', JSON.stringify(existingPurchases));
      return false;
    }
  };

  // Save purchase to both Firestore and localStorage
  const savePurchaseToStorage = async (data) => {
    console.log('💾 Saving purchase for position:', data.squareNumber);
    
    // Save to Firestore (and localStorage as fallback)
    const firestoreSuccess = await savePurchaseToFirestore(data);
    
    console.log('✅ Purchase saved!', {
      position: data.squareNumber,
      hasLogo: !!data.logoData,
      firestoreSuccess: firestoreSuccess,
      page: data.pageNumber || 1
    });

    // Clean up temporary data
    localStorage.removeItem('pendingPurchases');
    localStorage.removeItem('businessFormData');
    
    // Force AdGrid to refresh
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('purchaseCompleted'));
    
    // Double refresh after a delay
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 1000);
  };

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
        
        // Find the most recent pending purchase
        const pendingKeys = Object.keys(pendingPurchases);
        const latestPending = pendingKeys.length > 0 ? pendingPurchases[pendingKeys[pendingKeys.length - 1]] : null;
        
        if (latestPending) {
          purchaseData = {
            squareNumber: latestPending.squareNumber,
            pageNumber: latestPending.pageNumber || 1,
            contactEmail: latestPending.contactEmail,
            website: latestPending.website,
            finalAmount: latestPending.amount || 10,
            selectedDuration: latestPending.duration || 30,
            transactionId: sessionId,
            logoData: latestPending.logoData,
            paymentStatus: 'paid'
          };
          console.log('✅ Reconstructed from pending purchase:', purchaseData);
        } else if (businessFormData.contactEmail) {
          // Fallback to businessFormData
          purchaseData = {
            squareNumber: businessFormData.squareNumber || 1,
            pageNumber: businessFormData.pageNumber || 1,
            contactEmail: businessFormData.email,
            website: businessFormData.website,
            finalAmount: businessFormData.amount || 10,
            selectedDuration: businessFormData.duration || 30,
            transactionId: sessionId,
            logoData: businessFormData.logoData,
            paymentStatus: 'paid'
          };
          console.log('✅ Reconstructed from business form data:', purchaseData);
        }
      } else {
        // Direct purchase (not Stripe redirect)
        purchaseData = location.state || {};
        console.log('✅ Direct purchase data:', purchaseData);
      }

      if (purchaseData.squareNumber) {
        setOrderData(purchaseData);
        await savePurchaseToStorage(purchaseData);
      } else {
        console.error('❌ Could not reconstruct purchase data');
      }
      
      setIsLoading(false);
    };

    processSuccess();
  }, [sessionId, location.state]);

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
            <span>Advertising Location:</span>
            <strong>Page {orderData.pageNumber || 1}</strong>
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
              // Force refresh and navigate
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
          <h4>Need Help?</h4>
          <p>If your ad doesn't appear immediately, try refreshing the grid page.</p>
          <button 
            onClick={() => {
              console.log('📦 Current data:');
              console.log('squarePurchases:', JSON.parse(localStorage.getItem('squarePurchases') || '{}'));
              console.log('businessFormData:', JSON.parse(localStorage.getItem('businessFormData') || '{}'));
              alert('Check browser console for detailed information');
            }}
            className="btn-secondary"
          >
            📊 Debug Information
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;