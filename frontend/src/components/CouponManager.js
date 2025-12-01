/**
 * Coupon Manager Component
 * Admin interface for managing promo codes/coupons
 */

import React, { useState, useEffect } from 'react';
import './CouponManager.css';

const CouponManager = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [selectedCodes, setSelectedCodes] = useState([]);
  
  // Single coupon form
  const [singleForm, setSingleForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    freeDays: 0,
    description: '',
    maxUses: null,
    startDate: '',
    expiryDate: ''
  });
  
  // Bulk coupon form
  const [bulkForm, setBulkForm] = useState({
    count: 220,
    discountType: 'percentage',
    discountValue: 0,
    freeDays: 0,
    description: '',
    maxUses: 1, // Default to 1 use per code
    startDate: '',
    expiryDate: '',
    prefix: 'PROMO10', // Default prefix
    sameCodeName: true // All codes will have the same name
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://clickalinks-backend-2.onrender.com';
  const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!ADMIN_API_KEY) {
        setError('⚠️ ADMIN_API_KEY not configured. Promo code management requires API key.');
        setLoading(false);
        return;
      }

      if (!BACKEND_URL) {
        setError('⚠️ Backend URL not configured. Please set REACT_APP_BACKEND_URL.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/promo-code/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_API_KEY
        }
      });

      if (response.ok) {
        const result = await response.json();
        setPromoCodes(result.promoCodes || []);
        setError(''); // Clear any previous errors
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        
        const errorMessage = errorText || response.statusText || 'Unknown error';
        setError(`Failed to load coupons: ${response.status} ${errorMessage}`);
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
        setError(`Error loading coupons: ${errorMessage}`);
      }
      console.error('Error loading promo codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSinglePromoCode = async (e) => {
    e.preventDefault();
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

      const response = await fetch(`${BACKEND_URL}/api/promo-code/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_API_KEY
        },
        body: JSON.stringify(singleForm)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`✅ Promo code created: ${result.code || singleForm.code}`);
        setSingleForm({
          code: '',
          discountType: 'percentage',
          discountValue: 0,
          freeDays: 0,
          description: '',
          maxUses: null,
          startDate: '',
          expiryDate: ''
        });
        await loadPromoCodes();
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        
        const errorMessage = errorText || response.statusText || 'Unknown error';
        setError(`Failed to create coupon: ${response.status} ${errorMessage}`);
        console.error('Create coupon error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
      }
    } catch (err) {
      const errorMessage = err.message || 'Network error';
      const isNetworkError = err.message?.includes('Failed to fetch') || 
                           err.message?.includes('NetworkError') ||
                           err.message?.includes('CORS');
      
      if (isNetworkError) {
        setError(`Unable to connect to backend server. Please check your network connection and backend URL: ${BACKEND_URL}`);
      } else {
        setError(`Error creating coupon: ${errorMessage}`);
      }
      console.error('Error creating promo code:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBulkPromoCodes = async (e) => {
    e.preventDefault();
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

      const response = await fetch(`${BACKEND_URL}/api/promo-code/bulk-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_API_KEY
        },
        body: JSON.stringify(bulkForm)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`✅ Created ${result.count || bulkForm.count} promo codes successfully!`);
        setBulkForm({
          count: 220,
          discountType: 'percentage',
          discountValue: 0,
          freeDays: 0,
          description: '',
          maxUses: 1,
          startDate: '',
          expiryDate: '',
          prefix: 'PROMO10',
          sameCodeName: true
        });
        await loadPromoCodes();
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        
        const errorMessage = errorText || response.statusText || 'Unknown error';
        setError(`Failed to create coupons: ${response.status} ${errorMessage}`);
        console.error('Bulk create coupon error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
      }
    } catch (err) {
      const errorMessage = err.message || 'Network error';
      const isNetworkError = err.message?.includes('Failed to fetch') || 
                           err.message?.includes('NetworkError') ||
                           err.message?.includes('CORS');
      
      if (isNetworkError) {
        setError(`Unable to connect to backend server. Please check your network connection and backend URL: ${BACKEND_URL}`);
      } else {
        setError(`Error creating coupons: ${errorMessage}`);
      }
      console.error('Error creating promo codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportPromoCodes = () => {
    const dataStr = JSON.stringify(promoCodes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promo-codes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const deletePromoCode = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promo code? This action cannot be undone.')) {
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

      const response = await fetch(`${BACKEND_URL}/api/promo-code/${promoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_API_KEY
        }
      });

      if (response.ok) {
        setSuccess('✅ Promo code deleted successfully');
        await loadPromoCodes();
        setSelectedCodes(selectedCodes.filter(id => id !== promoId));
      } else {
        const errorText = await response.text();
        setError(`Failed to delete coupon: ${errorText}`);
      }
    } catch (err) {
      setError(`Error deleting coupon: ${err.message}`);
      console.error('Error deleting promo code:', err);
    } finally {
      setLoading(false);
    }
  };

  const bulkDeletePromoCodes = async () => {
    if (selectedCodes.length === 0) {
      setError('Please select at least one promo code to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedCodes.length} promo code(s)? This action cannot be undone.`)) {
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

      console.log('🗑️ Sending bulk delete request:', {
        count: selectedCodes.length,
        ids: selectedCodes.slice(0, 5), // Log first 5 for debugging
        allIds: selectedCodes // Log all for debugging
      });

      const requestBody = { promoIds: selectedCodes };
      console.log('🗑️ Request body:', JSON.stringify(requestBody).substring(0, 200));

      // Use POST instead of DELETE because some servers don't support DELETE with body
      const response = await fetch(`${BACKEND_URL}/api/promo-code/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ADMIN_API_KEY
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Bulk delete response:', result);
        setSuccess(`✅ ${result.deletedCount || selectedCodes.length} promo code(s) deleted successfully`);
        await loadPromoCodes();
        setSelectedCodes([]);
      } else {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = 'Unable to read error response';
        }
        console.error('❌ Bulk delete error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        setError(`Failed to delete coupons: ${response.status} ${errorText}`);
      }
    } catch (err) {
      console.error('❌ Error bulk deleting promo codes:', err);
      setError(`Error deleting coupons: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectCode = (promoId) => {
    setSelectedCodes(prev => 
      prev.includes(promoId) 
        ? prev.filter(id => id !== promoId)
        : [...prev, promoId]
    );
  };

  const toggleSelectAll = () => {
    console.log('🔄 Toggle select all:', {
      currentSelected: selectedCodes.length,
      totalCodes: promoCodes.length,
      allSelected: selectedCodes.length === promoCodes.length
    });
    
    if (selectedCodes.length === promoCodes.length && promoCodes.length > 0) {
      setSelectedCodes([]);
      console.log('✅ Deselected all');
    } else {
      const allIds = promoCodes.map(promo => promo.id);
      setSelectedCodes(allIds);
      console.log('✅ Selected all:', {
        count: allIds.length,
        firstFew: allIds.slice(0, 5)
      });
    }
  };

  return (
    <div className="coupon-manager">
      <h2>🎫 Coupon Management</h2>
      
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

      <div className="coupon-tabs">
        <button 
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          📋 List ({promoCodes.length})
        </button>
        <button 
          className={activeTab === 'single' ? 'active' : ''}
          onClick={() => setActiveTab('single')}
        >
          ➕ Create Single
        </button>
        <button 
          className={activeTab === 'bulk' ? 'active' : ''}
          onClick={() => setActiveTab('bulk')}
        >
          📦 Bulk Create (220)
        </button>
      </div>

      {activeTab === 'list' && (
        <div className="coupon-list">
          <div className="list-header">
            <h3>All Promo Codes</h3>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {selectedCodes.length > 0 && (
                <button 
                  onClick={bulkDeletePromoCodes} 
                  className="btn-delete" 
                  disabled={loading}
                  style={{ backgroundColor: '#dc3545', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  🗑️ Delete Selected ({selectedCodes.length})
                </button>
              )}
              <button onClick={loadPromoCodes} className="btn-refresh" disabled={loading}>
                🔄 Refresh
              </button>
              <button onClick={exportPromoCodes} className="btn-export">
                💾 Export JSON
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading">Loading promo codes...</div>
          ) : promoCodes.length === 0 ? (
            <div className="no-codes">No promo codes found. Create your first one!</div>
          ) : (
            <div className="codes-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedCodes.length === promoCodes.length && promoCodes.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Free Days</th>
                    <th>Used</th>
                    <th>Max Uses</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promoCodes.map((promo) => (
                    <tr key={promo.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCodes.includes(promo.id)}
                          onChange={() => toggleSelectCode(promo.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td><code>{promo.code}</code></td>
                      <td>{promo.discountType}</td>
                      <td>{promo.discountValue}</td>
                      <td>{promo.freeDays || 0}</td>
                      <td>{promo.usedCount || 0}</td>
                      <td>{promo.maxUses || '∞'}</td>
                      <td>
                        <span className={`status-badge ${promo.status}`}>
                          {promo.status}
                        </span>
                      </td>
                      <td>
                        {promo.createdAt 
                          ? new Date(promo.createdAt).toLocaleDateString() 
                          : 'N/A'}
                      </td>
                      <td>
                        <button
                          onClick={() => deletePromoCode(promo.id)}
                          disabled={loading}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem'
                          }}
                          title="Delete this promo code"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'single' && (
        <div className="coupon-form">
          <h3>Create Single Promo Code</h3>
          <form onSubmit={createSinglePromoCode}>
            <div className="form-group">
              <label>Code *</label>
              <input
                type="text"
                value={singleForm.code}
                onChange={(e) => setSingleForm({...singleForm, code: e.target.value.toUpperCase()})}
                placeholder="PROMO2024"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Discount Type</label>
                <select
                  value={singleForm.discountType}
                  onChange={(e) => setSingleForm({...singleForm, discountType: e.target.value})}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free">Free</option>
                  <option value="free_days">Free Days</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Discount Value</label>
                <input
                  type="number"
                  value={singleForm.discountValue}
                  onChange={(e) => setSingleForm({...singleForm, discountValue: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Free Days</label>
              <input
                type="number"
                value={singleForm.freeDays}
                onChange={(e) => setSingleForm({...singleForm, freeDays: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={singleForm.description}
                onChange={(e) => setSingleForm({...singleForm, description: e.target.value})}
                placeholder="Promo code description"
              />
            </div>
            
            <div className="form-group">
              <label>Max Uses (leave empty for unlimited)</label>
              <input
                type="number"
                value={singleForm.maxUses || ''}
                onChange={(e) => setSingleForm({...singleForm, maxUses: e.target.value ? parseInt(e.target.value) : null})}
                min="1"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Start Date (optional)</label>
                <input
                  type="date"
                  value={singleForm.startDate}
                  onChange={(e) => setSingleForm({...singleForm, startDate: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Expiry Date (optional)</label>
                <input
                  type="date"
                  value={singleForm.expiryDate}
                  onChange={(e) => setSingleForm({...singleForm, expiryDate: e.target.value})}
                />
              </div>
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Promo Code'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="coupon-form">
          <h3>Bulk Create Promo Codes (220 for Launch)</h3>
          <form onSubmit={createBulkPromoCodes}>
            <div className="form-group">
              <label>Count *</label>
              <input
                type="number"
                value={bulkForm.count}
                onChange={(e) => setBulkForm({...bulkForm, count: parseInt(e.target.value) || 220})}
                min="1"
                max="1000"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Code Name (Prefix) *</label>
              <input
                type="text"
                value={bulkForm.prefix}
                onChange={(e) => setBulkForm({...bulkForm, prefix: e.target.value.toUpperCase()})}
                placeholder="PROMO10 or FREEAD"
                required
              />
              <small style={{color: '#666', display: 'block', marginTop: '0.25rem'}}>
                All {bulkForm.count} codes will use this exact name. Users can enter "{bulkForm.prefix || 'PROMO10'}" and the system will find the first unused code.
              </small>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Discount Type</label>
                <select
                  value={bulkForm.discountType}
                  onChange={(e) => setBulkForm({...bulkForm, discountType: e.target.value})}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free">Free</option>
                  <option value="free_days">Free Days</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Discount Value</label>
                <input
                  type="number"
                  value={bulkForm.discountValue}
                  onChange={(e) => setBulkForm({...bulkForm, discountValue: parseFloat(e.target.value) || 0})}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Free Days</label>
              <input
                type="number"
                value={bulkForm.freeDays}
                onChange={(e) => setBulkForm({...bulkForm, freeDays: parseInt(e.target.value) || 0})}
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={bulkForm.description}
                onChange={(e) => setBulkForm({...bulkForm, description: e.target.value})}
                placeholder="Bulk promo codes description"
              />
            </div>
            
            <div className="form-group">
              <label>Max Uses Per Code *</label>
              <input
                type="number"
                value={bulkForm.maxUses || 1}
                onChange={(e) => setBulkForm({...bulkForm, maxUses: parseInt(e.target.value) || 1})}
                min="1"
                required
              />
              <small style={{color: '#666', display: 'block', marginTop: '0.25rem'}}>
                Recommended: 1 (each code can only be used once). Total uses available: {bulkForm.count * (bulkForm.maxUses || 1)}
              </small>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Start Date (optional)</label>
                <input
                  type="date"
                  value={bulkForm.startDate}
                  onChange={(e) => setBulkForm({...bulkForm, startDate: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Expiry Date (optional)</label>
                <input
                  type="date"
                  value={bulkForm.expiryDate}
                  onChange={(e) => setBulkForm({...bulkForm, expiryDate: e.target.value})}
                />
              </div>
            </div>
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : `Create ${bulkForm.count} Promo Codes`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CouponManager;

