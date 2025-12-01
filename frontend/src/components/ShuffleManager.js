/**
 * Shuffle Manager Component
 * Admin interface for managing shuffle operations
 */

import React, { useState, useEffect } from 'react';
import './ShuffleManager.css';

const ShuffleManager = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';
  const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

  useEffect(() => {
    loadShuffleStats();
  }, []);

  const loadShuffleStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!ADMIN_API_KEY) {
        setError('⚠️ ADMIN_API_KEY not configured. Please set REACT_APP_ADMIN_API_KEY in your .env file.');
        setLoading(false);
        return;
      }

      if (!BACKEND_URL) {
        setError('⚠️ Backend URL not configured. Please set REACT_APP_BACKEND_URL.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/admin/shuffle/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_API_KEY
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setError(''); // Clear any previous errors
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        
        const errorMessage = errorText || response.statusText || 'Unknown error';
        setError(`Failed to load shuffle stats: ${response.status} ${errorMessage}`);
        console.error('Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
      }
    } catch (err) {
      // Handle network errors, CORS errors, etc.
      const errorMessage = err.message || 'Network error';
      const isNetworkError = err.message?.includes('Failed to fetch') || 
                           err.message?.includes('NetworkError') ||
                           err.message?.includes('CORS');
      
      if (isNetworkError) {
        setError(`Unable to connect to backend server. Please check:\n1. Backend URL: ${BACKEND_URL}\n2. Network connection\n3. CORS configuration`);
      } else {
        setError(`Error loading shuffle stats: ${errorMessage}`);
      }
      console.error('Error loading shuffle stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerShuffle = async () => {
    if (!window.confirm('🔄 Are you sure you want to shuffle all advertising squares now?\n\nThis will randomly rearrange all occupied squares using the Fisher-Yates algorithm.\n\nContinue?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!ADMIN_API_KEY) {
        setError('⚠️ ADMIN_API_KEY not configured.');
        setLoading(false);
        return;
      }

      if (!BACKEND_URL) {
        setError('⚠️ Backend URL not configured.');
        setLoading(false);
        return;
      }

      console.log('🔄 Triggering shuffle via backend API...');
      
      const response = await fetch(`${BACKEND_URL}/admin/shuffle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_API_KEY
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`✅ Shuffle completed successfully! ${result.shuffledCount || 0} squares shuffled.`);
        console.log('✅ Shuffle result:', result);
        
        // Reload stats
        await loadShuffleStats();
        
        // Trigger refresh event for AdGrid
        window.dispatchEvent(new CustomEvent('shuffleCompleted'));
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        
        const errorMessage = errorText || response.statusText || 'Unknown error';
        setError(`Shuffle failed: ${response.status} ${errorMessage}`);
        console.error('Shuffle error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
      }
    } catch (err) {
      // Handle network errors, CORS errors, etc.
      const errorMessage = err.message || 'Network error';
      const isNetworkError = err.message?.includes('Failed to fetch') || 
                           err.message?.includes('NetworkError') ||
                           err.message?.includes('CORS');
      
      if (isNetworkError) {
        setError(`Unable to connect to backend server. Please check:\n1. Backend URL: ${BACKEND_URL}\n2. Network connection\n3. CORS configuration`);
      } else {
        setError(`Error triggering shuffle: ${errorMessage}`);
      }
      console.error('Error triggering shuffle:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shuffle-manager">
      <h2>🔄 Shuffle Management</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="shuffle-panel">
        <div className="shuffle-stats">
          <h3>Statistics</h3>
          {loading ? (
            <div className="loading">Loading stats...</div>
          ) : stats ? (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Purchases:</span>
                <span className="stat-value">{stats.totalPurchases || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Shuffled Purchases:</span>
                <span className="stat-value">{stats.shuffledPurchases || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Shuffle:</span>
                <span className="stat-value">
                  {stats.lastShuffle 
                    ? new Date(stats.lastShuffle).toLocaleString() 
                    : 'Never'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Shuffle Interval:</span>
                <span className="stat-value">{stats.shuffleInterval || '2 hours'}</span>
              </div>
            </div>
          ) : (
            <div className="no-stats">No statistics available</div>
          )}
        </div>

        <div className="shuffle-actions">
          <h3>Actions</h3>
          <button 
            onClick={triggerShuffle}
            className="btn-shuffle"
            disabled={loading || !ADMIN_API_KEY}
          >
            🔄 Shuffle All Squares Now
          </button>
          <button 
            onClick={loadShuffleStats}
            className="btn-refresh"
            disabled={loading}
          >
            🔄 Refresh Stats
          </button>
        </div>
      </div>

      <div className="shuffle-info">
        <h3>About Shuffle</h3>
        <p>
          The Fisher-Yates shuffle algorithm randomly rearranges all advertising squares every 2 hours.
          This ensures fair visibility for all businesses.
        </p>
        <ul>
          <li>✅ Zero duplicates guaranteed</li>
          <li>✅ Efficient O(n) performance</li>
          <li>✅ Preserves all business data</li>
          <li>✅ Automatic every 2 hours</li>
        </ul>
      </div>
    </div>
  );
};

export default ShuffleManager;

