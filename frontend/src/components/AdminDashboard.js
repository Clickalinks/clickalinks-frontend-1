/**
 * Admin Dashboard Component
 * Main admin interface for managing shuffle and promo codes
 */

import React, { useState, useEffect } from 'react';
import ShuffleManager from './ShuffleManager';
import CouponManager from './CouponManager';
import { adminLogin, verifyMFA, checkAdminAuth, logout } from '../utils/adminAuth';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [mfaToken, setMfaToken] = useState(null);
  const [mfaCode, setMfaCode] = useState('');

  // Check if already authenticated on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const authenticated = await checkAdminAuth();
      setIsAuthenticated(authenticated);
    };
    verifyAuth();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    const result = await adminLogin(password);
    
    if (result.success) {
      if (result.requiresMFA && result.mfaToken) {
        // MFA is required - show MFA input
        setRequiresMFA(true);
        setMfaToken(result.mfaToken);
        setPassword(''); // Clear password for security
      } else if (result.token) {
        // No MFA required - login complete
        setIsAuthenticated(true);
        setPassword('');
        setRequiresMFA(false);
        setMfaToken(null);
      }
    } else {
      setLoginError(result.error || 'Invalid password');
      setRequiresMFA(false);
      setMfaToken(null);
    }
    
    setIsLoading(false);
  };

  const handleMFAVerification = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    if (!mfaToken || !mfaCode) {
      setLoginError('Please enter your MFA code');
      setIsLoading(false);
      return;
    }

    const result = await verifyMFA(mfaToken, mfaCode);
    
    if (result.success && result.token) {
      setIsAuthenticated(true);
      setMfaCode('');
      setRequiresMFA(false);
      setMfaToken(null);
    } else {
      setLoginError(result.error || 'Invalid MFA code');
    }
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setPassword('');
    setLoginError('');
    setRequiresMFA(false);
    setMfaToken(null);
    setMfaCode('');
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login">
          {!requiresMFA ? (
            // Password login form
            <form onSubmit={handleLogin}>
              <h1>🔒 Admin Dashboard</h1>
              <p>Enter admin password to continue</p>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError(''); // Clear error on input
                }}
                placeholder="Enter admin password..."
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
              {loginError && (
                <div className="login-error" style={{ color: 'red', marginTop: '10px' }}>
                  ❌ {loginError}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Unlock Dashboard'}
              </button>
            </form>
          ) : (
            // MFA verification form
            <form onSubmit={handleMFAVerification}>
              <h1>🔐 Multi-Factor Authentication</h1>
              <p>Enter the 6-digit code from your authenticator app</p>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => {
                  // Only allow 6 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setMfaCode(value);
                  setLoginError(''); // Clear error on input
                }}
                placeholder="000000"
                autoComplete="one-time-code"
                maxLength={6}
                required
                disabled={isLoading}
                style={{
                  textAlign: 'center',
                  fontSize: '24px',
                  letterSpacing: '8px',
                  fontFamily: 'monospace'
                }}
              />
              {loginError && (
                <div className="login-error" style={{ color: 'red', marginTop: '10px' }}>
                  ❌ {loginError}
                </div>
              )}
              <button type="submit" className="btn-primary" disabled={isLoading || mfaCode.length !== 6}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRequiresMFA(false);
                  setMfaToken(null);
                  setMfaCode('');
                  setLoginError('');
                }}
                className="btn-secondary"
                disabled={isLoading}
                style={{ marginTop: '10px' }}
              >
                ← Back to Password
              </button>
            </form>
          )}

          <div className="login-hint">
            <p>💡 <strong>Secret Access:</strong> Press <code>Ctrl+Shift+A</code> on any page to access admin portal</p>
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
          onClick={handleLogout}
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

