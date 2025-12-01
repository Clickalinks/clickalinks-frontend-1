/**
 * Shuffle Manager Component
 * Admin interface for managing shuffle operations
 */

import React, { useState, useEffect } from 'react';
import './ShuffleManager.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

const ShuffleManager = () => {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    shuffledPurchases: 0,
    lastShuffle: null,
    shuffleInterval: '2 hours'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadShuffleStats();
  }, []);

  const loadShuffleStats = async () => {
    try {
      setError('');
      
      if (!ADMIN_API_KEY) {
        setError('ADMIN_API_KEY not configured in environment variables');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/admin/shuffle/stats`, {
        method: 'GET',
        headers: {
          'x-api-key': ADMIN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data);
      } else {
        setError(data.error || 'Failed to load shuffle stats');
      }
    } catch (err) {
      console.error('Error loading shuffle stats:', err);
      setError(`Error loading shuffle stats: ${err.message}`);
    }
  };

  const triggerShuffle = async () => {
    if (!window.confirm('Are you sure you want to trigger a shuffle? This will reassign all active purchases to new squares.')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!ADMIN_API_KEY) {
        throw new Error('ADMIN_API_KEY not configured');
      }

      const response = await fetch(`${BACKEND_URL}/admin/shuffle`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`✅ Shuffle completed successfully! ${data.shuffledCount} purchases shuffled.`);
        await loadShuffleStats(); // Refresh stats
      } else {
        setError(data.error || 'Shuffle failed');
      }
    } catch (err) {
      console.error('Shuffle error:', err);
      setError(`Shuffle failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="shuffle-manager">
      <h2>🔄 Shuffle Management</h2>
      
      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="shuffle-stats">
        <div className="stat-card">
          <h3>Total Active Purchases</h3>
          <p className="stat-value">{stats.totalPurchases}</p>
        </div>
        
        <div className="stat-card">
          <h3>Shuffled Purchases</h3>
          <p className="stat-value">{stats.shuffledPurchases}</p>
        </div>
        
        <div className="stat-card">
          <h3>Last Shuffle</h3>
          <p className="stat-value">{formatDate(stats.lastShuffle)}</p>
        </div>
        
        <div className="stat-card">
          <h3>Shuffle Interval</h3>
          <p className="stat-value">{stats.shuffleInterval}</p>
        </div>
      </div>

      <div className="shuffle-actions">
        <button
          onClick={loadShuffleStats}
          className="btn-refresh"
          disabled={loading}
        >
          🔄 Refresh Stats
        </button>
        
        <button
          onClick={triggerShuffle}
          className="btn-shuffle"
          disabled={loading}
        >
          {loading ? '⏳ Shuffling...' : '🔄 Trigger Shuffle'}
        </button>
      </div>

      <div className="shuffle-info">
        <h3>ℹ️ About Shuffling</h3>
        <ul>
          <li>Shuffling reassigns all active purchases to new random squares</li>
          <li>Uses Fisher-Yates algorithm for fair random distribution</li>
          <li>Automatic shuffles occur every 2 hours</li>
          <li>Manual shuffles can be triggered at any time</li>
          <li>All purchases maintain their data (logo, business info, etc.)</li>
        </ul>
      </div>
    </div>
  );
};

export default ShuffleManager;

