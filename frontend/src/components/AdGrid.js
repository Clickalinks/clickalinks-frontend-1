import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import './AdGrid.css';

const AdGrid = ({ start = 1, end = 200, pageNumber, isHome = false }) => {
  const navigate = useNavigate();
  const [selectedOccupiedSquare, setSelectedOccupiedSquare] = useState(null);
  const [purchasedSquares, setPurchasedSquares] = useState({});
  const [timeLeft, setTimeLeft] = useState(7200);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Calculate positions based on start/end props
  const squaresPerPage = end - start + 1;
  const squares = Array.from({ length: squaresPerPage }, (_, index) => {
    return start + index;
  });

  // Mobile detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Firestore listener
  useEffect(() => {
    console.log('📡 Setting up Firestore real-time listener');
    setIsLoading(true);
    
    const unsubscribe = onSnapshot(
      collection(db, 'purchasedSquares'), 
      (snapshot) => {
        try {
          const purchases = {};
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data && typeof data === 'object') {
              purchases[doc.id] = data;
            }
          });
          setPurchasedSquares(purchases);
          setIsLoading(false);
          console.log('✅ Loaded purchased squares:', Object.keys(purchases).length);
        } catch (error) {
          console.error('❌ Data processing error:', error);
          setIsLoading(false);
        }
      }, 
      (error) => {
        console.error('❌ Firestore connection error:', error);
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

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
  }, []);

  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const triggerAutoShuffle = useCallback(() => {
    console.log('🔄 Auto-shuffle triggered!');
    setPurchasedSquares(prev => ({...prev}));
    alert('🔄 Grid shuffled - positions randomized');
  }, []);

  const handleManualShuffle = useCallback(() => {
    triggerAutoShuffle();
  }, [triggerAutoShuffle]);

  const isAvailable = useCallback((position) => {
    return !purchasedSquares[position];
  }, [purchasedSquares]);

  const getBusinessInfo = useCallback((position) => {
    const purchase = purchasedSquares[position];
    if (purchase && typeof purchase === 'object') {
      return {
        logo: purchase.logoData,
        dealLink: purchase.dealLink || purchase.website, // Support both field names
        contactEmail: purchase.contactEmail,
        businessName: purchase.businessName
      };
    }
    return null;
  }, [purchasedSquares]);

  const handlePositionClick = useCallback((position) => {
    if (!position || typeof position !== 'number') {
      console.error('❌ Invalid position:', position);
      return;
    }

    console.log(`🎯 Square ${position} clicked, Available: ${isAvailable(position)}`);

    if (isAvailable(position)) {
      console.log(`🚀 Navigating to campaign for square ${position} on page ${pageNumber}`);
      
      navigate('/campaign', { 
        state: { 
          selectedSquare: position,
          pageNumber: pageNumber 
        } 
      });
    } else {
      const businessInfo = getBusinessInfo(position);
      if (businessInfo?.dealLink) {
        console.log(`🌐 Opening business website: ${businessInfo.dealLink}`);
        window.open(businessInfo.dealLink, '_blank', 'noopener,noreferrer');
      } else {
        console.log(`ℹ️ Showing business info for square ${position}`);
        setSelectedOccupiedSquare(position);
      }
    }
  }, [isAvailable, getBusinessInfo, navigate, pageNumber]);

  const closeModal = useCallback(() => {
    setSelectedOccupiedSquare(null);
  }, []);

  const handleImageError = useCallback((event) => {
    console.log('🖼️ Image failed to load, showing placeholder');
    event.target.style.display = 'none';
    // Show placeholder when image fails
    const parent = event.target.parentElement;
    if (parent) {
      const placeholder = document.createElement('div');
      placeholder.className = 'no-logo-placeholder';
      placeholder.innerHTML = `
        <span>Active Ad</span>
        <span class="spot-number-small">#${event.target.getAttribute('data-position')}</span>
      `;
      parent.appendChild(placeholder);
    }
  }, []);

  const availablePositions = squares.filter(position => isAvailable(position));
  const occupiedPositions = squares.filter(position => !isAvailable(position));

  const handleKeyPress = useCallback((e, position) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePositionClick(position);
    }
  }, [handlePositionClick]);

  // Stats for display
  const totalSquares = squares.length;
  const availableCount = availablePositions.length;
  const occupiedCount = occupiedPositions.length;

  return (
    <div className="ad-grid-container">
      {/* Auto-Shuffle Timer */}
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

      {/* Page Stats */}
      <div className="page-info">
        <div className="page-stats">
          <div className="available-stat">
            ✅ {availableCount} Available
          </div>
          <div className="occupied-stat">
            🔵 {occupiedCount} Occupied
          </div>
        </div>
        <p className="page-instruction">
          {isHome 
            ? 'Click any available square to start advertising'
            : `Click any available square on Page ${pageNumber} to advertise`
          }
        </p>
      </div>

      {/* Advertising Grid */}
      <div className="grid-container">
        {isLoading ? (
          <div className="loading-message" role="status" aria-live="polite">
            <div className="loading-spinner"></div>
            Loading advertising spots...
          </div>
        ) : (
          <div 
            className={`positions-grid ${isMobile ? 'mobile-layout' : 'desktop-layout'}`}
            role="grid"
            aria-label="Advertising positions grid"
          >
            {squares.map((position) => {
              const businessInfo = getBusinessInfo(position);
              const available = isAvailable(position);
              
              return (
                <div
                  key={position}
                  className={`ad-position ${available ? 'available' : 'occupied'}`}
                  onClick={() => handlePositionClick(position)}
                  role="gridcell"
                  aria-label={available ? 
                    `Available advertising spot ${position}. Click to purchase.` : 
                    `Occupied advertising spot ${position}`
                  }
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyPress(e, position)}
                >
                  <div className="position-content">
                    {available ? (
                      <div className="available-spot">
                        <div className="spot-icon" aria-hidden="true">➕</div>
                        <div className="spot-text">Advertise Here</div>
                        <div className="spot-price">£1/day</div>
                        <div className="spot-number">#{position}</div>
                      </div>
                    ) : (
                      <div className="occupied-spot">
                        {businessInfo?.logo ? (
                          <img 
                            src={businessInfo.logo} 
                            className="business-logo"
                            alt={`Business logo`}
                            onError={handleImageError}
                            loading="lazy"
                            data-position={position}
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
        )}
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
            <button onClick={closeModal} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Grid Info Footer */}
      <div className="grid-info">
        <p>
          <strong>Page {pageNumber}</strong> • {totalSquares} total spots • 
          {availableCount > 0 ? ` ${availableCount} available` : ' Fully booked'}
        </p>
      </div>
    </div>
  );
};

export default AdGrid;