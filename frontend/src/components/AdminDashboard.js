/**
 * Admin Dashboard Component
 * Main admin interface for managing shuffle and promo codes
 */

import React, { useState, useEffect } from 'react';
import ShuffleManager from './ShuffleManager';
import CouponManager from './CouponManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [password, setPassword] = useState('');
  
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || '';

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

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login">
          <form onSubmit={handleLogin}>
            <h1>🔒 Admin Dashboard</h1>
            <p>Enter admin password to continue</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password..."
              autoComplete="current-password"
              required
            />
            <button type="submit" className="btn-primary">
              Unlock Dashboard
            </button>
          </form>
          
          {!ADMIN_PASSWORD && (
            <div className="login-warning">
              ⚠️ <strong>Security Warning:</strong> ADMIN_PASSWORD not configured. 
              Please set REACT_APP_ADMIN_PASSWORD in your .env file.
            </div>
          )}

          <div className="login-hint">
            <p>💡 <strong>Secret Access:</strong> Press <code>Ctrl+Shift+A</code> on any page to reveal admin link</p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'shuffle':
        return <ShuffleManager />;
      case 'coupons':
        return <CouponManager />;
      case 'overview':
      default:
        return (
          <div className="admin-overview">
            <h2>📊 Dashboard Overview</h2>
            <div className="overview-stats">
              <div className="stat-card">
                <h3>Shuffle Management</h3>
                <p>Manage automatic and manual shuffling of advertising squares</p>
                <button onClick={() => setActiveTab('shuffle')} className="btn-primary">
                  Go to Shuffle
                </button>
              </div>
              <div className="stat-card">
                <h3>Coupon Management</h3>
                <p>Create and manage promo codes for promotions</p>
                <button onClick={() => setActiveTab('coupons')} className="btn-primary">
                  Go to Coupons
                </button>
              </div>
            </div>
          </div>
        );
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
          className={`nav-btn ${activeTab === 'shuffle' ? 'active' : ''}`}
          onClick={() => setActiveTab('shuffle')}
        >
          🔄 Shuffle
        </button>
        <button 
          className={`nav-btn ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          🎫 Coupons
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;

