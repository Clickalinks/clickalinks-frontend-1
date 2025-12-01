/**
 * Coupon Manager Component
 * Admin interface for managing promo codes
 */

import React, { useState, useEffect } from 'react';
import './CouponManager.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:10000';
const ADMIN_API_KEY = process.env.REACT_APP_ADMIN_API_KEY || '';

const CouponManager = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCodes, setSelectedCodes] = useState(new Set());
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    maxUses: 1,
    expiresAt: '',
    description: ''
  });
  const [bulkFormData, setBulkFormData] = useState({
    code: '',
    count: 10,
    discountType: 'percentage',
    discountValue: 10,
    maxUses: 1,
    useSameCodeName: false,
    expiresAt: '',
    description: ''
  });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    setLoading(true);
    setError('');

    try {
      if (!ADMIN_API_KEY) {
        setError('ADMIN_API_KEY not configured');
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/promo-code/list`, {
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
        setPromoCodes(data.promoCodes || []);
      } else {
        setError(data.error || 'Failed to load promo codes');
      }
    } catch (err) {
      console.error('Error loading promo codes:', err);
      setError(`Error loading promo codes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/promo-code/create`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('✅ Promo code created successfully!');
        setShowCreateForm(false);
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: 10,
          maxUses: 1,
          expiresAt: '',
          description: ''
        });
        await loadPromoCodes();
      } else {
        setError(data.error || 'Failed to create promo code');
      }
    } catch (err) {
      console.error('Error creating promo code:', err);
      setError(`Error creating promo code: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/promo-code/bulk-create`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...bulkFormData,
          expiresAt: bulkFormData.expiresAt || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`✅ Created ${data.created} promo code(s)!`);
        setShowBulkForm(false);
        setBulkFormData({
          code: '',
          count: 10,
          discountType: 'percentage',
          discountValue: 10,
          maxUses: 1,
          useSameCodeName: false,
          expiresAt: '',
          description: ''
        });
        await loadPromoCodes();
      } else {
        setError(data.error || 'Failed to bulk create promo codes');
      }
    } catch (err) {
      console.error('Error bulk creating promo codes:', err);
      setError(`Error bulk creating promo codes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/promo-code/${promoId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': ADMIN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('✅ Promo code deleted successfully!');
        await loadPromoCodes();
      } else {
        setError(data.error || 'Failed to delete promo code');
      }
    } catch (err) {
      console.error('Error deleting promo code:', err);
      setError(`Error deleting promo code: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCodes.size === 0) {
      setError('Please select at least one promo code to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedCodes.size} promo code(s)?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/promo-code/bulk-delete`, {
        method: 'POST',
        headers: {
          'x-api-key': ADMIN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promoIds: Array.from(selectedCodes)
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`✅ Deleted ${data.deleted} promo code(s)!`);
        setSelectedCodes(new Set());
        await loadPromoCodes();
      } else {
        setError(data.error || 'Failed to bulk delete promo codes');
      }
    } catch (err) {
      console.error('Error bulk deleting promo codes:', err);
      setError(`Error bulk deleting promo codes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (promoId) => {
    const newSelected = new Set(selectedCodes);
    if (newSelected.has(promoId)) {
      newSelected.delete(promoId);
    } else {
      newSelected.add(promoId);
    }
    setSelectedCodes(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCodes.size === promoCodes.length) {
      setSelectedCodes(new Set());
    } else {
      setSelectedCodes(new Set(promoCodes.map(p => p.id)));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="coupon-manager">
      <div className="coupon-header">
        <h2>🎫 Promo Code Management</h2>
        <div className="header-actions">
          <button onClick={() => { setShowCreateForm(true); setShowBulkForm(false); }} className="btn-create">
            ➕ Create Single
          </button>
          <button onClick={() => { setShowBulkForm(true); setShowCreateForm(false); }} className="btn-bulk">
            📦 Bulk Create
          </button>
          {selectedCodes.size > 0 && (
            <button onClick={handleBulkDelete} className="btn-delete-selected" disabled={loading}>
              🗑️ Delete Selected ({selectedCodes.size})
            </button>
          )}
        </div>
      </div>

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

      {showCreateForm && (
        <div className="form-card">
          <h3>Create Single Promo Code</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
                placeholder="PROMO10"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_days">Free Days</option>
                  <option value="free">Free (100% off)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Discount Value *</label>
                <input
                  type="number"
                  value={formData.discountValue || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setFormData({ ...formData, discountValue: isNaN(val) ? '' : val });
                  }}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Max Uses *</label>
                <input
                  type="number"
                  value={formData.maxUses || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseInt(e.target.value);
                    setFormData({ ...formData, maxUses: isNaN(val) ? '' : val });
                  }}
                  required
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label>Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description (optional)</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Promo code description"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showBulkForm && (
        <div className="form-card">
          <h3>Bulk Create Promo Codes</h3>
          <form onSubmit={handleBulkCreate}>
            <div className="form-group">
              <label>Base Code *</label>
              <input
                type="text"
                value={bulkFormData.code}
                onChange={(e) => setBulkFormData({ ...bulkFormData, code: e.target.value })}
                required
                placeholder="PROMO10"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Count *</label>
                <input
                  type="number"
                  value={bulkFormData.count || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseInt(e.target.value);
                    setBulkFormData({ ...bulkFormData, count: isNaN(val) ? '' : val });
                  }}
                  required
                  min="1"
                  max="1000"
                />
              </div>
              
              <div className="form-group">
                <label>Use Same Code Name</label>
                <input
                  type="checkbox"
                  checked={bulkFormData.useSameCodeName}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, useSameCodeName: e.target.checked })}
                />
                <small>If checked, all codes will have the same name (e.g., "PROMO10")</small>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Discount Type *</label>
                <select
                  value={bulkFormData.discountType}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, discountType: e.target.value })}
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="free_days">Free Days</option>
                  <option value="free">Free (100% off)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Discount Value *</label>
                <input
                  type="number"
                  value={bulkFormData.discountValue || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setBulkFormData({ ...bulkFormData, discountValue: isNaN(val) ? '' : val });
                  }}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Max Uses *</label>
                <input
                  type="number"
                  value={bulkFormData.maxUses || ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseInt(e.target.value);
                    setBulkFormData({ ...bulkFormData, maxUses: isNaN(val) ? '' : val });
                  }}
                  required
                  min="1"
                />
              </div>
              
              <div className="form-group">
                <label>Expires At (optional)</label>
                <input
                  type="datetime-local"
                  value={bulkFormData.expiresAt}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, expiresAt: e.target.value })}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Description (optional)</label>
              <input
                type="text"
                value={bulkFormData.description}
                onChange={(e) => setBulkFormData({ ...bulkFormData, description: e.target.value })}
                placeholder="Promo code description"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating...' : `Create ${bulkFormData.count} Codes`}
              </button>
              <button type="button" onClick={() => setShowBulkForm(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="coupon-list-header">
        <h3>Promo Codes ({promoCodes.length})</h3>
        <button onClick={loadPromoCodes} className="btn-refresh" disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {loading && promoCodes.length === 0 ? (
        <div className="loading">Loading promo codes...</div>
      ) : promoCodes.length === 0 ? (
        <div className="empty-state">No promo codes found. Create your first one!</div>
      ) : (
        <div className="coupon-table-container">
          <table className="coupon-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedCodes.size === promoCodes.length && promoCodes.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Uses</th>
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
                      checked={selectedCodes.has(promo.id)}
                      onChange={() => toggleSelect(promo.id)}
                    />
                  </td>
                  <td className="code-cell">{promo.code}</td>
                  <td>{promo.discountType}</td>
                  <td>
                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` :
                     promo.discountType === 'free_days' ? `${promo.discountValue} days` :
                     promo.discountType === 'free' ? '100%' :
                     `£${promo.discountValue}`}
                  </td>
                  <td>{promo.currentUses} / {promo.maxUses}</td>
                  <td>
                    <span className={`status-badge status-${promo.status}`}>
                      {promo.status}
                    </span>
                  </td>
                  <td>{formatDate(promo.createdAt)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="btn-delete"
                      disabled={loading}
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
  );
};

export default CouponManager;

