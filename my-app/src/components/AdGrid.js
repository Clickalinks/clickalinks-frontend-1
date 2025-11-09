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
        price: '£1/DAY'
      };
    });
    
    setSquares(initialSquares);
  }, []);

// In your AdGrid.js - make sure this is correct:
const handleSquareClick = (square) => {
  if (square.isAvailable) {
    // Redirect to purchase.html with square number
    window.location.href = `/purchase.html?square=${square.id}`;
  } else {
    window.open(square.dealLink, '_blank');
  }
};

return (
  <div className="grid" style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 100px)',
    gap: '10px',
    justifyContent: 'center',
    margin: '0.1rem auto'
    // REMOVED maxWidth: '1100px'
  }}>

    {squares.map(square => (
      <div
        key={square.id}
        className="square"
        style={{
          width: '100px',
          height: '100px',
          border: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          background: 'none',
          position: 'relative'
        }}
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
          <img src={square.logoData} alt={square.businessName} style={{maxWidth: '90%', maxHeight: '90%'}} />
        )}
      </div>
    ))}
  </div>
);
};

export default AdGrid;