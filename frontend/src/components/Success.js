import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { saveLogoToStorage } from '../firebaseStorage';
import { db, storage } from '../firebase';
import { doc, setDoc, serverTimestamp, getDocs, collection, query, where } from 'firebase/firestore';
import { cleanupExpiredAds } from '../utils/cleanupExpiredAds';
import { savePurchaseToFirestore } from '../utils/savePurchaseToFirestore';
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
        console.log('✅ Purchase data reconstructed successfully:', {
          squareNumber: purchaseData.squareNumber,
          businessName: purchaseData.businessName,
          hasLogo: !!purchaseData.logoData,
          logoType: purchaseData.logoData ? (purchaseData.logoData.startsWith('http') ? 'URL' : 'Data URL') : 'NONE'
        });
        setOrderData(purchaseData);
        await savePurchaseToStorage(purchaseData);
      } else {
        console.error('❌ Could not reconstruct purchase data');
        console.error('Missing data:', {
          squareNumber: purchaseData.squareNumber,
          businessName: purchaseData.businessName,
          sessionId: sessionId,
          businessFormData: businessFormData,
          pendingPurchases: Object.keys(pendingPurchases)
        });
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
    if (data.logoData) {
      if (data.logoData.startsWith('data:')) {
        console.log('🔄 Logo is a data URL, uploading to Firebase Storage...');
        try {
          const uploadResult = await saveLogoToStorage(data.logoData, data.squareNumber);
          // Handle both old format (string) and new format (object)
          if (typeof uploadResult === 'string') {
            finalLogoURL = uploadResult;
          } else {
            finalLogoURL = uploadResult.url;
            // Store storage path for cleanup
            localStorage.setItem(`logoPath_${data.squareNumber}`, uploadResult.path);
          }
          console.log('✅ Data URL converted to Firebase URL:', finalLogoURL);
        } catch (error) {
          console.error('❌ Failed to upload logo to Firebase:', error);
          console.error('Error details:', {
            code: error.code,
            message: error.message
          });
          // Fallback to data URL if Firebase upload fails
          finalLogoURL = data.logoData;
          console.warn('⚠️ Using data URL as fallback');
        }
      } else if (data.logoData.startsWith('http')) {
        console.log('✅ Logo is already a URL, using directly:', data.logoData.substring(0, 60) + '...');
        finalLogoURL = data.logoData;
      } else {
        console.warn('⚠️ Logo data format unknown:', data.logoData.substring(0, 50));
        finalLogoURL = data.logoData;
      }
    } else {
      console.warn('⚠️ No logo data in purchase data');
    }

    // Get storage path if available
    const storagePath = localStorage.getItem(`logoPath_${data.squareNumber}`) || null;
    
    // 🔥 CRITICAL FIX: Save to Firestore using utility function FIRST
    console.log('🔥 ATTEMPTING FIRESTORE SAVE:', {
      documentId: data.squareNumber.toString(),
      squareNumber: data.squareNumber,
      businessName: data.businessName,
      hasLogo: !!finalLogoURL
    });
    
    const firestoreSuccess = await savePurchaseToFirestore({
      squareNumber: data.squareNumber,
      pageNumber: data.pageNumber || 1,
      businessName: data.businessName,
      contactEmail: data.contactEmail,
      website: data.website || data.dealLink,
      logoData: finalLogoURL,
      amount: data.finalAmount || 10,
      duration: data.selectedDuration || 30,
      transactionId: data.transactionId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (data.selectedDuration || 30) * 24 * 60 * 60 * 1000).toISOString(),
      storagePath: storagePath,
      purchaseDate: new Date().toISOString()
    });
    
    if (!firestoreSuccess) {
      console.error('❌ Failed to save to Firestore, but continuing with localStorage...');
    }
    
    // Also save to localStorage as backup
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
      storageType: finalLogoURL && finalLogoURL.includes('firebasestorage') ? 'firebase' : 'local',
      storagePath: storagePath,
      squareNumber: data.squareNumber,
      pageNumber: data.pageNumber || 1
    };

    // Save to localStorage as backup
    const existingPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
    existingPurchases[data.squareNumber] = purchaseData;
    localStorage.setItem('squarePurchases', JSON.stringify(existingPurchases));

    console.log('✅ FINAL SAVE WITH FIREBASE:', {
      square: data.squareNumber,
      logoType: purchaseData.storageType,
      logoURL: finalLogoURL ? 'PRESENT' : 'MISSING',
      firestore: 'SAVED',
      localStorage: 'SAVED'
    });

    // Cleanup
    localStorage.removeItem('pendingPurchases');
    localStorage.removeItem('businessFormData');

    // Clean up any expired ads before showing success
    try {
      await cleanupExpiredAds();
    } catch (cleanupError) {
      console.error('❌ Error during cleanup:', cleanupError);
      // Don't block success page if cleanup fails
    }

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
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon-large">✅</div>
          <h1>Payment Successful! 🎉</h1>
          <p className="success-subtitle">
            Your advertising campaign is now live and active!
          </p>
        </div>

        {/* Logo Preview Section */}
        {orderData.logoData && (
          <div className="logo-preview-section">
            <h3>Your Logo</h3>
            <div className="logo-preview-container">
              <img 
                src={orderData.logoData} 
                alt="Your business logo" 
                className="success-logo-preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="logo-placeholder" style={{ display: 'none' }}>
                <span>Logo Preview</span>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Card */}
        <div className="order-details-card">
          <h2>📋 Purchase Confirmation</h2>
          
          <div className="order-details-grid">
            <div className="detail-row">
              <span className="detail-label">Business Name:</span>
              <span className="detail-value">{orderData.businessName}</span>
            </div>
            
            <div className="detail-row highlight">
              <span className="detail-label">📍 Advertising Square:</span>
              <span className="detail-value">#{orderData.squareNumber} (Page {orderData.pageNumber || 1})</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">⏱️ Campaign Duration:</span>
              <span className="detail-value">{orderData.selectedDuration || 30} days</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">📅 Start Date:</span>
              <span className="detail-value">{new Date().toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">📅 End Date:</span>
              <span className="detail-value">
                {new Date(Date.now() + (orderData.selectedDuration || 30) * 24 * 60 * 60 * 1000)
                  .toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
              </span>
            </div>
            
            <div className="detail-row highlight-amount">
              <span className="detail-label">💰 Total Paid:</span>
              <span className="detail-value amount">£{orderData.finalAmount || 10}.00</span>
            </div>
            
            {orderData.transactionId && (
              <div className="detail-row">
                <span className="detail-label">🔐 Transaction ID:</span>
                <span className="detail-value transaction-id">{orderData.transactionId}</span>
              </div>
            )}
          </div>
        </div>

        {/* What Happens Next Section */}
        <div className="next-steps-section">
          <h3>✨ What Happens Next?</h3>
          <ul className="next-steps-list">
            <li>
              <span className="step-icon">✅</span>
              <span>Your logo is now live on square #{orderData.squareNumber}</span>
            </li>
            <li>
              <span className="step-icon">👆</span>
              <span>Visitors can click your logo to visit your website</span>
            </li>
            <li>
              <span className="step-icon">⏰</span>
              <span>Your ad will remain active for {orderData.selectedDuration || 30} days</span>
            </li>
            <li>
              <span className="step-icon">🔄</span>
              <span>Your position may change during auto-shuffle, but your ad stays active</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <button 
            onClick={() => {
              window.dispatchEvent(new Event('storage'));
              navigate(`/page${orderData.pageNumber || 1}`);
            }}
            className="btn-primary btn-large"
          >
            👁️ View Your Live Ad
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="btn-secondary btn-large"
          >
            🏠 Return Home
          </button>
        </div>

        {/* Support Section */}
        <div className="support-section">
          <p>Need help? <a href="/contact">Contact us</a> or check your <a href="/how-it-works">campaign details</a></p>
        </div>
      </div>
    </div>
  );
};

export default Success;