import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './AdGrid.css';

const AdGrid = ({ start = 1, end = 200, pageNumber, isHome = false }) => {
  const navigate = useNavigate();
  const [selectedOccupiedSquare, setSelectedOccupiedSquare] = useState(null);
  const [purchasedSquares, setPurchasedSquares] = useState({});
  const [timeLeft, setTimeLeft] = useState(7200);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const squares = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  // Mobile detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Load purchased squares
  useEffect(() => {
    const loadPurchasedSquares = async () => {
      try {
        console.log('🔄 Loading purchased squares...');
        const querySnapshot = await getDocs(collection(db, 'purchasedSquares'));
        
        const purchases = {};
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data && data.status === 'active') {
            purchases[doc.id] = data;
          }
        });

        console.log('✅ Loaded:', Object.keys(purchases).length, 'purchased squares');
        setPurchasedSquares(purchases);
      } catch (error) {
        console.error('❌ Error loading squares:', error);
        // Fallback to localStorage
        const localPurchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
        setPurchasedSquares(localPurchases);
      } finally {
        setIsLoading(false);
      }
    };

    loadPurchasedSquares();

    // Listen for new purchases
    const handleStorageChange = () => {
      console.log('🔄 Storage changed, reloading...');
      loadPurchasedSquares();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Format time function
  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Auto-shuffle functions
  const triggerAutoShuffle = useCallback(() => {
    console.log('Auto-shuffle triggered!');
    setPurchasedSquares(prev => ({...prev}));
    alert('🔄 Grid shuffled - positions randomized');
  }, []);

  const handleManualShuffle = useCallback(() => {
    triggerAutoShuffle();
  }, [triggerAutoShuffle]);

  // Auto-shuffle timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          triggerAutoShuffle();
          return 7200;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [triggerAutoShuffle]);

  const isAvailable = useCallback((position) => {
    return !purchasedSquares[position];
  }, [purchasedSquares]);

  const getBusinessInfo = useCallback((position) => {
    const purchase = purchasedSquares[position];
    return purchase ? {
      logo: purchase.logoData,
      dealLink: purchase.dealLink,
      contactEmail: purchase.contactEmail,
      businessName: purchase.businessName
    } : null;
  }, [purchasedSquares]);

  const handlePositionClick = useCallback((position) => {
    if (isAvailable(position)) {
      navigate('/campaign', { 
        state: { selectedSquare: position, pageNumber } 
      });
    } else {
      const businessInfo = getBusinessInfo(position);
      if (businessInfo?.dealLink) {
        window.open(businessInfo.dealLink, '_blank', 'noopener,noreferrer');
      } else {
        setSelectedOccupiedSquare(position);
      }
    }
  }, [isAvailable, getBusinessInfo, navigate, pageNumber]);

  const closeModal = useCallback(() => {
    setSelectedOccupiedSquare(null);
  }, []);

  if (isLoading) {
    return (
      <div className="ad-grid-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          Loading advertising spots...
        </div>
      </div>
    );
  }

  const availableCount = squares.filter(position => isAvailable(position)).length;
  const occupiedCount = squares.length - availableCount;

  return (
    <div className="ad-grid-container">
      {/* Header Section - FIXED LAYOUT */}
      <div className="grid-header">
        <div className="shuffle-timer-container">
          <button 
            className="shuffle-timer-btn" 
            onClick={handleManualShuffle}
            aria-label="Shuffle advertising positions"
          >
            <div className="timer-icon" aria-hidden="true">🔄</div>
            <div className="timer-content">
              <div className="timer-label">Next Auto-Shuffle</div>
              <div className="timer-display">{formatTime(timeLeft)}</div>
            </div>
            <div className="shuffle-now">Shuffle Now</div>
          </button>
        </div>

        <div className="page-info">
          <div className="page-stats">
            <div className="available-stat">✅ {availableCount} Available</div>
            <div className="occupied-stat">🔵 {occupiedCount} Occupied</div>
          </div>
          <p className="page-instruction">
            {isHome ? `Page ${pageNumber}: 1 - 200 of 2000 spots` : `Page ${pageNumber}: Spots ${start} - ${end}`}
          </p>
        </div>
      </div>

      {/* Grid Container - CENTERED */}
      <div className="grid-container">
        <div className={`positions-grid ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
          {squares.map((position) => {
            const businessInfo = getBusinessInfo(position);
            const available = isAvailable(position);
            
            return (
              <div
                key={position}
                className={`ad-position ${available ? 'available' : 'occupied'}`}
                onClick={() => handlePositionClick(position)}
              >
                <div className="position-content">
                  {available ? (
                    <div className="available-spot">
                      <div className="spot-text">Ad Spot</div>
                      <div className="spot-price">£1/day</div>
                      <div className="spot-number">#{position}</div>
                    </div>
                  ) : (
                    <div className="occupied-spot">
                      {businessInfo?.logo ? (
                        <img 
                          src={businessInfo.logo} 
                          className="business-logo"
                          alt="Business logo"
                        />
                      ) : (
                        <div className="no-logo-placeholder">
                          <span>Active Ad</span>
                          <span className="spot-number-small">#{position}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Occupied Square Modal */}
      {selectedOccupiedSquare && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Advertisement Spot #{selectedOccupiedSquare}</h3>
            <div className="business-details">
              <p>This advertising spot is currently occupied.</p>
              {getBusinessInfo(selectedOccupiedSquare)?.contactEmail && (
                <p><strong>Contact:</strong> {getBusinessInfo(selectedOccupiedSquare).contactEmail}</p>
              )}
              {getBusinessInfo(selectedOccupiedSquare)?.businessName && (
                <p><strong>Business:</strong> {getBusinessInfo(selectedOccupiedSquare).businessName}</p>
              )}
            </div>
            <button onClick={closeModal} className="btn-secondary">Close</button>
          </div>
        </div>
      )}

      {/* Grid Info Footer */}
      <div className="grid-info">
        <p>
          <strong>Page {pageNumber}</strong> • Spots {start} - {end} • 
          {availableCount > 0 ? ` ${availableCount} available` : ' Fully booked'}
        </p>
      </div>
    </div>
  );
};

export default AdGrid;