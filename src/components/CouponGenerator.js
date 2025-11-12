import React, { useState, useEffect } from 'react';

const CouponGenerator = () => {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: 100,
    description: '',
    maxUses: 100
  });

  useEffect(() => {
    loadExistingCoupons();
  }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon(prev => ({ ...prev, code: result }));
  };

  // Fixed: Single createCoupon function
  const createCoupon = () => {
    if (!newCoupon.code || !newCoupon.description) {
      alert('Please fill in all required fields');
      return;
    }

    const existingCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    if (existingCoupons.find(c => c.code === newCoupon.code.toUpperCase())) {
      alert('This coupon code already exists!');
      return;
    }

    const coupon = {
      ...newCoupon,
      code: newCoupon.code.toUpperCase(),
      id: Date.now(),
      createdAt: new Date().toISOString(),
      usedCount: 0,
      // Add this field for 10-day campaigns
      isLaunchCampaign: newCoupon.discountPercent === 100 // Auto-set for 100% off coupons
    };

    const updatedCoupons = [...existingCoupons, coupon];
    setCoupons(updatedCoupons);
    localStorage.setItem('adminCoupons', JSON.stringify(updatedCoupons));
    
    // Update checkout coupons
    const checkoutCoupons = {};
    updatedCoupons.forEach(coupon => {
      checkoutCoupons[coupon.code] = {
        discountPercent: coupon.discountPercent,
        description: coupon.description,
        isLaunchCampaign: coupon.isLaunchCampaign // Make sure this is passed to checkout
      };
    });
    localStorage.setItem('availableCoupons', JSON.stringify(checkoutCoupons));
    
    setNewCoupon({
      code: '',
      discountPercent: 100,
      description: '',
      maxUses: 100
    });

    alert(`✅ Coupon "${coupon.code}" created!`);
  };

  const loadExistingCoupons = () => {
    const existing = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    setCoupons(existing);
  };

  const deleteCoupon = (couponId) => {
    if (window.confirm('Delete this coupon?')) {
      const updatedCoupons = coupons.filter(c => c.id !== couponId);
      setCoupons(updatedCoupons);
      localStorage.setItem('adminCoupons', JSON.stringify(updatedCoupons));
      
      // Also update the available coupons
      const checkoutCoupons = {};
      updatedCoupons.forEach(coupon => {
        checkoutCoupons[coupon.code] = {
          discountPercent: coupon.discountPercent,
          description: coupon.description,
          isLaunchCampaign: coupon.isLaunchCampaign
        };
      });
      localStorage.setItem('availableCoupons', JSON.stringify(checkoutCoupons));
    }
  };

  return (
    <div className="coupon-generator">
      {/* Create Coupon Form */}
      <div className="generator-form">
        <h3>Create New Coupon</h3>
        
        <div className="form-group">
          <label>Coupon Code *</label>
          <div className="code-input-group">
            <input
              type="text"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value }))}
              placeholder="LAUNCH100"
              maxLength="20"
            />
            <button type="button" onClick={generateCode} className="btn-generate">
              Generate Code
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Discount Percentage *</label>
          <input
            type="number"
            value={newCoupon.discountPercent}
            onChange={(e) => setNewCoupon(prev => ({ ...prev, discountPercent: parseInt(e.target.value) }))}
            min="1"
            max="100"
          />
          <small>
            {newCoupon.discountPercent === 100 ? 
              "💡 100% discount coupons will automatically give 10-day free campaigns!" : 
              "Discounts less than 100% will use the customer's selected duration"}
          </small>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <input
            type="text"
            value={newCoupon.description}
            onChange={(e) => setNewCoupon(prev => ({ ...prev, description: e.target.value }))}
            placeholder={newCoupon.discountPercent === 100 ? 
              "100% OFF - Free 10-Day Launch Campaign" : 
              "50% OFF - Special Discount"}
          />
        </div>

        <div className="form-group">
          <label>Maximum Uses *</label>
          <input
            type="number"
            value={newCoupon.maxUses}
            onChange={(e) => setNewCoupon(prev => ({ ...prev, maxUses: parseInt(e.target.value) }))}
            min="1"
          />
        </div>

        <button onClick={createCoupon} className="btn-create">
          Create Coupon
        </button>
      </div>

      {/* Existing Coupons List */}
      <div className="coupons-management">
        <div className="management-header">
          <h3>Existing Coupons ({coupons.length})</h3>
          <button onClick={loadExistingCoupons} className="btn-refresh">
            Refresh
          </button>
        </div>

        {coupons.length === 0 ? (
          <p className="no-coupons">No coupons created yet.</p>
        ) : (
          <div className="coupons-list">
            {coupons.map(coupon => (
              <div key={coupon.id} className="coupon-item">
                <div className="coupon-header">
                  <span className="coupon-code">{coupon.code}</span>
                  <button 
                    onClick={() => deleteCoupon(coupon.id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
                <div className="coupon-details">
                  <strong>{coupon.discountPercent}% OFF</strong> - {coupon.description}
                  {coupon.isLaunchCampaign && (
                    <span style={{color: '#28a745', fontWeight: 'bold', marginLeft: '10px'}}>
                      🚀 10-Day Free Campaign
                    </span>
                  )}
                </div>
                <div className="coupon-meta">
                  <span>Uses: {coupon.usedCount || 0}/{coupon.maxUses}</span>
                  <span>Created: {new Date(coupon.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponGenerator;