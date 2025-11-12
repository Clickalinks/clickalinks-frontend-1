import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AutoShuffleTimer from './AutoShuffleTimer';

const AdGrid = ({ pageNumber = 1 }) => {
  const [squares, setSquares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Calculate square numbers for this page
  const startSquare = (pageNumber - 1) * 200 + 1;
  const endSquare = pageNumber * 200;

  useEffect(() => {
    const initializeSquares = () => {
      setIsLoading(true);
      
      console.log('🔄 Loading AdGrid for page', pageNumber);
      
      // Load TEMPORARY purchases from localStorage (session only)
      let purchases = {};
      try {
        purchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
        console.log('📋 Temporary ads in storage:', Object.keys(purchases).length);
      } catch (error) {
        console.error('Error loading temporary ads:', error);
        purchases = {};
      }

      // Create 200 squares - check for temporary purchases
      const squaresForThisPage = Array.from({ length: 200 }, (_, index) => {
        const squareNumber = startSquare + index;
        const purchase = purchases[squareNumber];
        
        if (purchase && purchase.status === 'active') {
          const endDate = new Date(purchase.endDate);
          const today = new Date();
          
          if (today < endDate) {
            // ACTIVE TEMPORARY PURCHASE - Show the ad
            return {
              id: squareNumber,
              isAvailable: false,
              businessName: purchase.businessName,
              logoData: purchase.logoData, // This will show the uploaded logo!
              dealLink: purchase.dealLink,
            };
          } else {
            // Temporary ad expired - mark as available
            return {
              id: squareNumber,
              isAvailable: true,
              price: '£1/day'
            };
          }
        }
        
        // Available square
        return {
          id: squareNumber,
          isAvailable: true,
          price: '£1/day'
        };
      });

      const occupied = squaresForThisPage.filter(sq => !sq.isAvailable).length;
      console.log(`✅ Page ${pageNumber}: ${occupied} occupied squares`);
      
      setSquares(squaresForThisPage);
      setIsLoading(false);
    };

    initializeSquares();

    // Listen for storage updates (when new ads are added)
    const handleStorageChange = () => {
      initializeSquares();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pageNumber, startSquare]);

  const handleSquareClick = (square) => {
    if (square.isAvailable) {
      navigate('/purchase', { 
        state: { 
          squareNumber: square.id,
          pageNumber: pageNumber 
        } 
      });
    } else if (square.dealLink) {
      window.open(square.dealLink, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="grid-container">
        <div className="page-info">
          <h3>Page {pageNumber} - Squares {startSquare} to {endSquare}</h3>
          <p>Loading advertising squares...</p>
        </div>
        <div className="squares-grid">
          {Array.from({ length: 200 }).map((_, i) => (
            <div key={i} className="square loading">
              <div className="square-text">Loading...</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const occupiedCount = squares.filter(square => !square.isAvailable).length;
  const availableCount = squares.filter(square => square.isAvailable).length;

  return (
    <div className="grid-container">
      <div className="page-info">
        <h3>Page {pageNumber} - Squares {startSquare} to {endSquare}</h3>
        
        <AutoShuffleTimer />
        
        <div className="page-stats">
          <span className="occupied-stat">{occupiedCount} Occupied</span>
          <span className="available-stat">{availableCount} Available</span>
        </div>
        
        <p>Click any available square to advertise your business for just £1 per day!</p>
      </div>
      
      <div className="squares-grid">
        {squares.map(square => (
          <div
            key={square.id}
            className={`square ${square.isAvailable ? 'available' : 'occupied'}`}
            onClick={() => handleSquareClick(square)}
          >
            {square.isAvailable ? (
              <div className="square-content">
                <div className="square-text">BUY THIS SQUARE</div>
                <div className="square-price">£1 PER DAY</div>
                <div className="square-number">#{square.id}</div>
              </div>
            ) : (
              <div className="square-content">
                {square.logoData ? (
                  <img 
                    src={square.logoData} 
                    alt={square.businessName} 
                    className="occupied-logo"
                    onError={(e) => {
                      console.error('❌ Failed to load logo for:', square.businessName);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="no-logo">🖼️ No Logo</div>
                )}
          
                <div className="square-number">#{square.id}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdGrid;