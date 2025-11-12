import React, { useState, useEffect } from 'react';

const AdManager = () => {
  const [purchases, setPurchases] = useState({});

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = () => {
    const purchasesData = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
    setPurchases(purchasesData);
  };

  const deleteAd = (squareNumber) => {
    if (window.confirm(`Delete ad from square #${squareNumber}?`)) {
      const updatedPurchases = { ...purchases };
      delete updatedPurchases[squareNumber];
      setPurchases(updatedPurchases);
      localStorage.setItem('squarePurchases', JSON.stringify(updatedPurchases));
      alert('Ad deleted successfully!');
    }
  };

  const clearAllAds = () => {
    if (window.confirm('Delete ALL ads? This cannot be undone!')) {
      localStorage.removeItem('squarePurchases');
      setPurchases({});
      alert('All ads cleared!');
    }
  };

  return (
    <div className="ad-manager">
      <h3>📊 Ad Management</h3>
      <button onClick={clearAllAds} className="btn-danger">
        🗑️ Clear All Ads
      </button>
      
      <div className="ads-list">
        <h4>Active Ads ({Object.keys(purchases).length})</h4>
        {Object.keys(purchases).length === 0 ? (
          <p>No active ads</p>
        ) : (
          Object.keys(purchases).map(squareNumber => (
            <div key={squareNumber} className="ad-item">
              <div className="ad-info">
                <strong>Square #{squareNumber}</strong>
                <span>{purchases[squareNumber].businessName}</span>
                <span>{purchases[squareNumber].contactEmail}</span>
              </div>
              <button 
                onClick={() => deleteAd(squareNumber)}
                className="btn-delete"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Add to your existing AdminPanel
export default AdManager;