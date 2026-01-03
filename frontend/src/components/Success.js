import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  const isProcessingRef = useRef(false); // Use ref to persist across renders

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Prevent multiple executions
    let timeoutId = null;
    
    const processSuccess = async () => {
      if (isProcessingRef.current) {
        console.warn('⚠️ Success page already processing, skipping duplicate call');
        return;
      }
      isProcessingRef.current = true;
      
      // Set a timeout to ensure loading always stops (max 10 seconds)
      timeoutId = setTimeout(() => {
        console.warn('⚠️ Success page processing timeout, stopping loading...');
        setIsLoading(false);
      }, 10000);
      
      try {
        console.log('🎉 Processing successful payment...');
        
        // Try to get data from multiple sources
        const businessFormData = JSON.parse(localStorage.getItem('businessFormData') || '{}');
        const pendingPurchases = JSON.parse(localStorage.getItem('pendingPurchases') || '{}');
        const squarePurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
        
        console.log('🔍 Available data:', {
          businessFormData: businessFormData,
          pendingPurchases: Object.keys(pendingPurchases),
          squarePurchases: Object.keys(squarePurchases),
          locationState: location.state,
          sessionId: sessionId,
          queryParams: {
            square: searchParams.get('square'),
            free: searchParams.get('free')
          }
        });

        let purchaseData = {};
        
        // Check if this is a free purchase (from query params)
        const isFreePurchase = searchParams.get('free') === 'true';
        const squareFromQuery = searchParams.get('square');
        
        if (sessionId || squareFromQuery) {
          // Stripe redirect OR free purchase - try to reconstruct from localStorage
          console.log(`🔄 ${isFreePurchase ? 'Free purchase' : 'Stripe redirect'} detected, session:`, sessionId || 'N/A', 'square:', squareFromQuery);
        
        // CRITICAL: Find purchase by sessionId first (most reliable)
        // Note: pendingPurchases, businessFormData, and squarePurchases are already loaded above
        
        // Try to find purchase by sessionId
        let foundPurchase = pendingPurchases[sessionId];
        
        if (!foundPurchase) {
          // If not found by sessionId, try to find by matching sessionId in squarePurchases
          for (const [squareNum, purchase] of Object.entries(squarePurchases)) {
            if (purchase.sessionId === sessionId || purchase.transactionId === sessionId) {
              foundPurchase = purchase;
              foundPurchase.squareNumber = parseInt(squareNum);
              break;
            }
          }
        }
        
        // If still not found, get the most recent pending purchase
        if (!foundPurchase) {
          const pendingKeys = Object.keys(pendingPurchases);
          if (pendingKeys.length > 0) {
            foundPurchase = pendingPurchases[pendingKeys[pendingKeys.length - 1]];
            console.log('⚠️ Using latest pending purchase (sessionId not found)');
          }
        }
        
        if (foundPurchase) {
          purchaseData = {
            squareNumber: foundPurchase.squareNumber,
            pageNumber: foundPurchase.pageNumber || 1,
            businessName: foundPurchase.businessName || foundPurchase.name,
            contactEmail: foundPurchase.contactEmail || foundPurchase.email,
            website: foundPurchase.website || foundPurchase.dealLink,
            finalAmount: foundPurchase.amount || foundPurchase.finalAmount || 10,
            originalAmount: foundPurchase.originalAmount || foundPurchase.amount || foundPurchase.finalAmount || 10,
            discountAmount: foundPurchase.discountAmount || 0,
            promoCode: foundPurchase.promoCode || foundPurchase.appliedPromo?.code || null,
            selectedDuration: foundPurchase.duration || foundPurchase.selectedDuration || 30,
            transactionId: sessionId,
            logoData: foundPurchase.logoData || businessFormData.logoData,
            paymentStatus: 'paid'
          };
          console.log('✅ Reconstructed from purchase data:', {
            squareNumber: purchaseData.squareNumber,
            businessName: purchaseData.businessName,
            hasLogo: !!purchaseData.logoData,
            logoType: purchaseData.logoData ? (purchaseData.logoData.startsWith('http') ? 'URL' : 'Data URL') : 'NONE'
          });
        } else if (businessFormData.businessName) {
          // Fallback to businessFormData
          purchaseData = {
            squareNumber: businessFormData.squareNumber || 1,
            pageNumber: businessFormData.pageNumber || 1,
            businessName: businessFormData.name || businessFormData.businessName,
            contactEmail: businessFormData.email || businessFormData.contactEmail,
            website: businessFormData.website,
            finalAmount: businessFormData.amount || 10,
            selectedDuration: businessFormData.duration || 30,
            transactionId: sessionId,
            logoData: businessFormData.logoData,
            paymentStatus: 'paid'
          };
          console.log('✅ Reconstructed from business form data with logo:', !!purchaseData.logoData);
        } else {
          console.error('❌ Could not find purchase data for session:', sessionId);
          console.error('Available data:', {
            pendingPurchases: Object.keys(pendingPurchases),
            squarePurchases: Object.keys(squarePurchases),
            businessFormData: businessFormData.businessName || businessFormData.name
          });
        }
      } else {
        // Direct purchase (not Stripe redirect) - includes free purchases
        purchaseData = location.state || {};
        console.log('✅ Direct purchase data (free purchase or direct navigation):', {
          squareNumber: purchaseData.squareNumber,
          businessName: purchaseData.businessName,
          transactionId: purchaseData.transactionId,
          hasLogo: !!purchaseData.logoData
        });
        
        // If no location.state, try to get from localStorage (for free purchases)
        if (!purchaseData.squareNumber) {
          // Try to find by square number from query params FIRST
          if (squareFromQuery && squarePurchases[squareFromQuery]) {
            purchaseData = {
              ...squarePurchases[squareFromQuery],
              squareNumber: parseInt(squareFromQuery),
              finalAmount: squarePurchases[squareFromQuery].finalAmount || 0,
              paymentStatus: 'paid',
              status: 'active'
            };
            console.log('✅ Found purchase by square number from query:', purchaseData);
          }
          
          // Find free purchase by transactionId starting with "free_" or matching sessionId
          if (!purchaseData.squareNumber) {
            for (const [sessionIdKey, purchase] of Object.entries(pendingPurchases)) {
              if (sessionIdKey.startsWith('free_') || (sessionId && sessionIdKey === sessionId)) {
                purchaseData = {
                  ...purchase,
                  transactionId: sessionIdKey,
                  finalAmount: 0,
                  paymentStatus: 'paid',
                  status: 'active'
                };
                console.log('✅ Found free purchase in pendingPurchases:', purchaseData);
                break;
              }
            }
          }
          
          // Or get from squarePurchases by matching sessionId or square number
          if (!purchaseData.squareNumber && Object.keys(squarePurchases).length > 0) {
            for (const [squareNum, purchase] of Object.entries(squarePurchases)) {
              if ((sessionId && (purchase.transactionId === sessionId || purchase.sessionId === sessionId)) ||
                  (squareFromQuery && squareNum === squareFromQuery)) {
                purchaseData = {
                  ...purchase,
                  squareNumber: parseInt(squareNum),
                  finalAmount: purchase.finalAmount || 0,
                  paymentStatus: 'paid',
                  status: 'active'
                };
                console.log('✅ Found purchase in squarePurchases:', purchaseData);
                break;
              }
            }
          }
          
          // Last resort: merge with businessFormData
          if (!purchaseData.squareNumber && businessFormData.squareNumber) {
            purchaseData = {
              ...businessFormData,
              ...purchaseData,
              squareNumber: businessFormData.squareNumber,
              finalAmount: 0,
              paymentStatus: 'paid',
              status: 'active'
            };
            console.log('✅ Reconstructed from businessFormData:', purchaseData);
          }
        }
      }

      if (purchaseData.squareNumber && purchaseData.businessName) {
        console.log('✅ Purchase data reconstructed successfully:', {
          squareNumber: purchaseData.squareNumber,
          businessName: purchaseData.businessName,
          hasLogo: !!purchaseData.logoData,
          logoType: purchaseData.logoData ? (purchaseData.logoData.startsWith('http') ? 'URL' : 'Data URL') : 'NONE'
        });
        setOrderData(purchaseData);
        
        // Save purchase (with timeout to prevent hanging)
        try {
          const savePromise = savePurchaseToStorage(purchaseData);
          const timeoutPromise = new Promise((resolve) => setTimeout(() => {
            console.warn('⚠️ Save purchase timeout, continuing anyway...');
            resolve();
          }, 8000)); // 8 second timeout
          
          await Promise.race([savePromise, timeoutPromise]);
        } catch (saveError) {
          console.error('❌ Error saving purchase (non-blocking):', saveError);
          // Continue anyway - show success page
        }
      } else {
        console.error('❌ Could not reconstruct purchase data');
        console.error('Missing data:', {
          squareNumber: purchaseData.squareNumber,
          businessName: purchaseData.businessName,
          sessionId: sessionId,
          squareFromQuery: squareFromQuery,
          businessFormData: businessFormData,
          pendingPurchases: Object.keys(pendingPurchases),
          squarePurchases: Object.keys(squarePurchases)
        });
        // Still show success page even if data is incomplete
        if (purchaseData.squareNumber || businessFormData.squareNumber) {
          setOrderData({
            ...purchaseData,
            ...businessFormData,
            squareNumber: purchaseData.squareNumber || businessFormData.squareNumber
          });
        }
      }
      
      // Always stop loading
      clearTimeout(timeoutId);
      setIsLoading(false);
      isProcessingRef.current = false;
    } catch (error) {
      console.error('❌ Error in processSuccess:', error);
      // Always stop loading even on error
      clearTimeout(timeoutId);
      setIsLoading(false);
      isProcessingRef.current = false;
    }
    };

    processSuccess();
    
    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      isProcessingRef.current = false;
    };
  }, [sessionId, location.state, searchParams]);

  // Save purchase to storage
  const savePurchaseToStorage = async (data) => {
    console.log('💾 SAVING FINAL PURCHASE WITH FIREBASE STORAGE');

    let finalLogoURL = data.logoData;

    // Check if we need to upload to Firebase (if it's still a data URL)
    if (data.logoData) {
      if (data.logoData.startsWith('data:')) {
        console.log('🔄 Logo is a data URL, uploading to Firebase Storage...');
        try {
          // Generate unique purchase ID for logo storage (independent of square number)
          const purchaseId = localStorage.getItem(`purchaseId_${data.squareNumber}`) || 
                             `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          const uploadResult = await saveLogoToStorage(data.logoData, purchaseId);
          // Handle both old format (string) and new format (object)
          if (typeof uploadResult === 'string') {
            finalLogoURL = uploadResult;
          } else {
            finalLogoURL = uploadResult.url;
            // Store storage path and purchaseId for cleanup and reference
            localStorage.setItem(`logoPath_${data.squareNumber}`, uploadResult.path);
            localStorage.setItem(`purchaseId_${data.squareNumber}`, uploadResult.purchaseId || purchaseId);
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

    // Get storage path and purchaseId if available
    const storagePath = localStorage.getItem(`logoPath_${data.squareNumber}`) || null;
    const purchaseId = localStorage.getItem(`purchaseId_${data.squareNumber}`) || 
                       data.purchaseId || 
                       `purchase-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Store purchaseId for future reference
    localStorage.setItem(`purchaseId_${data.squareNumber}`, purchaseId);
    
    // 🔥 CRITICAL FIX: Save to Firestore using utility function FIRST
    console.log('🔥 ATTEMPTING FIRESTORE SAVE:', {
      purchaseId: purchaseId,
      squareNumber: data.squareNumber,
      businessName: data.businessName,
      hasLogo: !!finalLogoURL
    });
    
    const firestoreSuccess = await savePurchaseToFirestore({
      purchaseId: purchaseId, // Pass unique purchase ID
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
      console.error('❌ Failed to save to Firestore!');
      console.error('⚠️ Check browser console for detailed error messages');
      console.error('⚠️ Common issues:');
      console.error('   1. Firestore security rules blocking writes');
      console.error('   2. Network connectivity issues');
      console.error('   3. Invalid data format');
      // Still continue with localStorage as backup
    } else {
      console.log('✅ Firestore save successful! Document should appear in database shortly.');
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
      logoURLPreview: finalLogoURL ? finalLogoURL.substring(0, 100) : 'MISSING',
      firestore: 'SAVED',
      localStorage: 'SAVED'
    });
    
    // Send confirmation email (non-blocking, don't wait for response)
    if (data.contactEmail && purchaseData.paymentStatus === 'paid') {
      // Get promo code info from localStorage if available
      const purchaseFromStorage = JSON.parse(localStorage.getItem(`purchase_${data.squareNumber}`) || '{}');
      const appliedPromo = purchaseFromStorage.appliedPromo || null;
      
      const emailData = {
        contactEmail: data.contactEmail,
        businessName: data.businessName,
        website: data.website || data.dealLink || '',
        squareNumber: data.squareNumber,
        pageNumber: data.pageNumber || 1,
        selectedDuration: data.selectedDuration || 30,
        originalAmount: purchaseFromStorage.originalAmount || data.originalAmount || data.finalAmount || 10,
        discountAmount: purchaseFromStorage.discountAmount || data.discountAmount || appliedPromo?.discount || 0,
        finalAmount: data.finalAmount || 0,
        promoCode: purchaseFromStorage.promoCode || data.promoCode || appliedPromo?.code || null,
        transactionId: data.transactionId,
        paymentStatus: purchaseData.paymentStatus,
        logoData: finalLogoURL
      };
      
      // Call backend email endpoint (non-blocking)
      fetch(`${process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com'}/api/send-confirmation-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          console.log('✅ Confirmation email sent successfully');
        } else {
          console.warn('⚠️ Email send failed (non-critical):', result.error || result.message);
        }
      })
      .catch(error => {
        console.warn('⚠️ Email send error (non-critical):', error.message);
        // Don't block success page if email fails
      });
    } else {
      console.log('📧 Skipping email (no email address or payment not confirmed)');
    }
    
    // CRITICAL: Trigger event to reload grid and clear cache
    window.dispatchEvent(new Event('purchaseCompleted'));
    
    // Clear cache for this square to force fresh load
    if (typeof clearAllCache !== 'undefined') {
      import('../utils/cache').then(({ clearExpiredCache }) => {
        clearExpiredCache().catch(() => {});
      });
    }

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

    // Force refresh - trigger multiple events to ensure grid updates
    // CRITICAL: Clear cache to ensure fresh data on mobile and desktop
    // MOBILE FIX: More aggressive cache clearing for mobile
    try {
      const { clearAllCache, clearExpiredCache } = await import('../utils/cache');
      // Clear all cache first
      await clearAllCache();
      // Also clear expired cache for good measure
      await clearExpiredCache();
      console.log('✅ Cache cleared after purchase - mobile and desktop will show fresh data');
      
      // MOBILE: Force localStorage sync flag reset to ensure fresh data fetch
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobileDevice) {
        sessionStorage.removeItem('localStorageSynced');
        console.log('📱 Mobile: Reset localStorage sync flag for fresh data');
      }
    } catch (cacheError) {
      console.warn('⚠️ Cache clear error (non-blocking):', cacheError);
    }
    
    // Trigger reload events
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

  const endDate = new Date(Date.now() + (orderData.selectedDuration || 30) * 24 * 60 * 60 * 1000);

  return (
    <div className="success-container">
      <div className="success-content">
        {/* Welcome Header with Celebration */}
        <div className="success-header">
          <div className="celebration-animation">
            <div className="success-icon-large">🎉</div>
            <div className="confetti">✨</div>
            <div className="confetti">🎊</div>
            <div className="confetti">⭐</div>
            <div className="confetti">💫</div>
          </div>
          <h1 className="welcome-title">Welcome to ClickaLinks!</h1>
          <p className="success-subtitle">
            Your advertising campaign is now live and ready to reach thousands of customers!
          </p>
        </div>

        {/* Success Badge */}
        <div className="success-badge">
          <div className="badge-icon">✅</div>
          <div className="badge-content">
            <span className="badge-title">Payment Successful</span>
            <span className="badge-subtitle">Your order has been confirmed</span>
          </div>
        </div>

        {/* Logo Preview Section */}
        {orderData.logoData && (
          <div className="logo-preview-section">
            <h3>Your Live Logo</h3>
            <div className="logo-preview-container">
              <img 
                src={orderData.logoData} 
                alt={`${orderData.businessName} logo`} 
                className="success-logo-preview"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'block';
                  }
                }}
              />
              <div className="logo-placeholder" style={{ display: 'none' }}>
                <span>Logo Preview</span>
              </div>
            </div>
            <p className="logo-preview-note">This logo is now visible on Square #{orderData.squareNumber}</p>
          </div>
        )}

        {/* Order Summary Card */}
        <div className="order-summary-card">
          <div className="summary-header">
            <h2>📋 Order Summary</h2>
            <p className="summary-subtitle">Review your purchase details</p>
          </div>
          
          <div className="order-details-grid">
            <div className="detail-item">
              <span className="detail-icon">🏢</span>
              <div className="detail-content">
                <span className="detail-label">Business Name</span>
                <span className="detail-value">{orderData.businessName}</span>
              </div>
            </div>
            
            <div className="detail-item highlight">
              <span className="detail-icon">📍</span>
              <div className="detail-content">
                <span className="detail-label">Advertising Square</span>
                <span className="detail-value">#{orderData.squareNumber} • Page {orderData.pageNumber || 1}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">⏱️</span>
              <div className="detail-content">
                <span className="detail-label">Campaign Duration</span>
                <span className="detail-value">{orderData.selectedDuration || 30} days</span>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <div className="detail-content">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{new Date().toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <div className="detail-content">
                <span className="detail-label">End Date</span>
                <span className="detail-value">{endDate.toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
            
            <div className="detail-item total-amount-item">
              <span className="detail-icon">💰</span>
              <div className="detail-content">
                <span className="detail-label">Total Paid</span>
                <span className="detail-value total-amount-value">£{orderData.finalAmount || 10}.00</span>
              </div>
            </div>
            
            {orderData.transactionId && (
              <div className="detail-item">
                <span className="detail-icon">🔐</span>
                <div className="detail-content">
                  <span className="detail-label">Transaction ID</span>
                  <span className="detail-value transaction-id">{orderData.transactionId}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* What Happens Next Section */}
        <div className="next-steps-section">
          <h3>✨ What Happens Next?</h3>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">✅</div>
              <h4>Your Ad is Live</h4>
              <p>Your logo is now visible on square #{orderData.squareNumber} and ready to attract customers!</p>
            </div>
            <div className="step-card">
              <div className="step-icon">👆</div>
              <h4>Clickable Link</h4>
              <p>Visitors can click your logo to visit your website and discover your products or services.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">⏰</div>
              <h4>Active Duration</h4>
              <p>Your ad will remain active for {orderData.selectedDuration || 30} days, giving you maximum exposure.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🔄</div>
              <h4>Fair Placement</h4>
              <p>Your position may change during shuffles, ensuring fair visibility for all businesses.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <Link 
            to={`/page${orderData.pageNumber || 1}`}
            className="btn-primary btn-large"
            onClick={() => window.dispatchEvent(new Event('storage'))}
          >
            <span className="btn-icon">👁️</span>
            View Your Live Ad
          </Link>
          
          <Link 
            to="/"
            className="btn-secondary btn-large"
          >
            <span className="btn-icon">🏠</span>
            Return Home
          </Link>
        </div>

        {/* Support & Help Section */}
        <div className="support-section">
          <div className="support-card">
            <h4>💬 Need Help?</h4>
            <p>Our support team is here to assist you with any questions about your campaign.</p>
            <div className="support-links">
              <Link to="/contact" className="support-link">Contact Us</Link>
              <span className="support-separator">•</span>
              <Link to="/how-it-works" className="support-link">How It Works</Link>
              <span className="support-separator">•</span>
              <Link to="/terms" className="support-link">Terms & Conditions</Link>
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="thank-you-message">
          <p>Thank you for choosing ClickaLinks! 🚀</p>
          <p className="thank-you-subtitle">We're excited to help grow your business.</p>
        </div>
      </div>
    </div>
  );
};

export default Success;
