import React, { useState } from 'react';
import CouponGenerator from './CouponGenerator';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Set your secure password here - CHANGE THIS to something strong!
  const ADMIN_PASSWORD = 'SoomB44t33Dee@';

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword('');
    } else {
      alert('❌ Invalid admin password');
      setPassword('');
    }
  };

  // Password Protection Gate
  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <div className="login-header">
            <h1>🔒 Admin Dashboard</h1>
            <p>Enter admin password to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password..."
              className="password-input"
              autoFocus
            />
            <button type="submit" className="login-btn">
              Unlock Dashboard
            </button>
          </form>

          <div className="login-hint">
            <p>💡 <strong>Secret Access:</strong> Press <code>Ctrl+Shift+A</code> on any page to reveal admin link</p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'coupons':
        return <CouponGenerator />;
      case 'analytics':
        return <AnalyticsPanel />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header with Logout */}
      <div className="admin-header">
        <div>
          <h1>🚀 Business Directory Admin</h1>
          <div className="admin-user">Welcome, Admin</div>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="logout-btn"
        >
          🔓 Logout
        </button>
      </div>

      {/* Navigation */}
      <div className="admin-nav">
        <button 
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-btn ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          🎫 Coupon Manager
        </button>
        <button 
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button 
          className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

// Overview Component
const AdminOverview = () => {
  const coupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
  const usedCoupons = coupons.filter(c => c.usedCount > 0);
  const activeCoupons = coupons.filter(c => (c.usedCount || 0) < c.maxUses);

  return (
    <div className="overview-panel">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{coupons.length}</div>
          <div className="stat-label">Total Coupons</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{usedCoupons.length}</div>
          <div className="stat-label">Redeemed Coupons</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{activeCoupons.length}</div>
          <div className="stat-label">Active Coupons</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{coupons.filter(c => c.discountPercent === 100).length}</div>
          <div className="stat-label">Free Campaigns</div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Coupon Activity</h3>
        {usedCoupons.length === 0 ? (
          <p>No coupons redeemed yet.</p>
        ) : (
          <div className="activity-list">
            {usedCoupons.slice(-5).map(coupon => (
              <div key={coupon.id} className="activity-item">
                <span className="coupon-code">{coupon.code}</span>
                <span className="activity-desc">Used {coupon.usedCount} times</span>
                <span className="activity-date">
                  Last used: {new Date(coupon.lastUsed || coupon.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Analytics Panel
const AnalyticsPanel = () => {
  const coupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
  
  return (
    <div className="analytics-panel">
      <h2>📈 Coupon Analytics</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Redemption Rate</h4>
          <div className="analytics-value">
            {coupons.length > 0 
              ? `${Math.round((coupons.filter(c => c.usedCount > 0).length / coupons.length) * 100)}%`
              : '0%'
            }
          </div>
        </div>
        
        <div className="analytics-card">
          <h4>Total Uses</h4>
          <div className="analytics-value">
            {coupons.reduce((total, c) => total + (c.usedCount || 0), 0)}
          </div>
        </div>
        
        <div className="analytics-card">
          <h4>Most Popular</h4>
          <div className="analytics-value">
            {coupons.length > 0 
              ? coupons.reduce((most, c) => (c.usedCount || 0) > (most.usedCount || 0) ? c : most).code
              : 'N/A'
            }
          </div>
        </div>
      </div>

      <div className="coupon-breakdown">
        <h4>Coupon Breakdown</h4>
        <div className="breakdown-list">
          {coupons.map(coupon => (
            <div key={coupon.id} className="breakdown-item">
              <span className="breakdown-code">{coupon.code}</span>
              <span className="breakdown-uses">{coupon.usedCount || 0}/{coupon.maxUses}</span>
              <span className="breakdown-percent">{coupon.discountPercent}% off</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Settings Panel
const AdminSettings = () => {
  const [settings, setSettings] = useState({
    autoExpire: true,
    expireDays: 30,
    notifyOnRedeem: true
  });

  const exportCoupons = () => {
    const coupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
    const dataStr = JSON.stringify(coupons, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coupons-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importCoupons = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const coupons = JSON.parse(e.target.result);
          localStorage.setItem('adminCoupons', JSON.stringify(coupons));
          alert('Coupons imported successfully!');
          window.location.reload();
        } catch (error) {
          alert('Error importing coupons: Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="settings-panel">
      <h2>⚙️ Admin Settings</h2>
      
      <div className="settings-section">
        <h4>Data Management</h4>
        <div className="setting-group">
          <button onClick={exportCoupons} className="btn-export">
            📥 Export All Coupons
          </button>
          <div className="import-group">
            <label htmlFor="import-file" className="btn-import">
              📤 Import Coupons
            </label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={importCoupons}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h4>Coupon Settings</h4>
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={settings.autoExpire}
              onChange={(e) => setSettings(prev => ({...prev, autoExpire: e.target.checked}))}
            />
            Auto-expire coupons after period
          </label>
        </div>
        
        <div className="setting-item">
          <label>Expiration Days:</label>
          <input 
            type="number" 
            value={settings.expireDays}
            onChange={(e) => setSettings(prev => ({...prev, expireDays: parseInt(e.target.value)}))}
            disabled={!settings.autoExpire}
          />
        </div>
        
        <div className="setting-item">
          <label>
            <input 
              type="checkbox" 
              checked={settings.notifyOnRedeem}
              onChange={(e) => setSettings(prev => ({...prev, notifyOnRedeem: e.target.checked}))}
            />
            Notify when coupon is redeemed
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h4>Danger Zone</h4>
        <button 
          onClick={() => {
            if (window.confirm('Are you sure? This will delete ALL coupons and cannot be undone!')) {
              localStorage.removeItem('adminCoupons');
              localStorage.removeItem('availableCoupons');
              alert('All coupons cleared!');
              window.location.reload();
            }
          }}
          className="btn-danger"
        >
          🗑️ Clear All Coupons
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;