import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
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

  const purchaseCount = Object.keys(purchases).length;

  return (
    <div className="admin-panel">
      <div className="admin-container">
        <h1>🛠️ Admin Panel - Square Purchases</h1>
        
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Active Ads</h3>
            <div className="stat-number">{purchaseCount}</div>
          </div>
        </div>

        <button className="clear-btn" onClick={clearAllAds}>
          🗑️ Clear All Ads
        </button>

        <div className="purchases-grid">
          {purchaseCount === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No active ads</h3>
              <p>When businesses purchase advertising squares, they will appear here.</p>
            </div>
          ) : (
            Object.keys(purchases).map(squareNumber => {
              const purchase = purchases[squareNumber];
              return (
                <div key={squareNumber} className="purchase-card">
                  <div className="card-header">
                    <h3>Square #{squareNumber}</h3>
                    <span className="status-badge">Active</span>
                  </div>
                  <div className="card-content">
                    <div className="info-row">
                      <span className="label">🏢 Business:</span>
                      <span className="value">{purchase.businessName}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📧 Email:</span>
                      <span className="value">{purchase.contactEmail}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">💰 Amount:</span>
                      <span className="value">£{purchase.amount || '10'}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📅 Date:</span>
                      <span className="value">
                        {purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteAd(squareNumber)}
                    className="btn-delete"
                  >
                    🗑️ Delete Ad
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;