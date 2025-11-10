import React, { useState, useEffect } from 'react';

const AdGrid = () => {
  const [squares, setSquares] = useState([]);

  useEffect(() => {
    // Load purchases from localStorage
    const purchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
    
    const initialSquares = Array.from({ length: 200 }, (_, i) => {
      const squareNumber = i + 1;
      const purchase = purchases[squareNumber];
      
      if (purchase && purchase.status === 'active') {
        const endDate = new Date(purchase.endDate);
        const today = new Date();
        
        if (today < endDate) {
          return {
            id: squareNumber,
            isAvailable: false,
            businessName: purchase.businessName,
            logoData: purchase.logoData,
            adText: purchase.adText,
            dealLink: purchase.dealLink,
            endDate: purchase.endDate
          };
        }
      }
      
      return {
        id: squareNumber,
        isAvailable: true,
        price: '£1/day'
      };
    });
    
    setSquares(initialSquares);
  }, []);

  const handleSquareClick = (square) => {
    if (square.isAvailable) {
      // Redirect to purchase.html with square number
      window.location.href = `/purchase.html?square=${square.id}`;
    } else {
      window.open(square.dealLink, '_blank');
    }
  };

  return (
    <div className="grid-container">
      <div className="squares-grid">
        {squares.map(square => (
          <div
            key={square.id}
            className="square"
            onClick={() => handleSquareClick(square)}
            title={!square.isAvailable ? `${square.businessName}\nClick to visit deal` : 'Click to purchase this square'}
          >
            {square.isAvailable ? (
              <>
                <div className="square-text">BUY THIS SQUARE</div>
                <div className="square-price">{square.price}</div>
                <div className="square-number">#{square.id}</div>
              </>
            ) : (
              <img src={square.logoData} alt={square.businessName} className="occupied-logo" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdGrid;