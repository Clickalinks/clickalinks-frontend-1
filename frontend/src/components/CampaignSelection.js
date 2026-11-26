import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './CampaignSelection.css';

const CampaignSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSquare, pageNumber } = location.state || {};
  
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [finalAmount, setFinalAmount] = useState(30);

  const campaignPlans = [
    { 
      id: 'starter',
      days: 10, 
      price: 10, 
      label: 'Starter', 
      popular: false,
      description: 'A short launch test',
      savings: '0%',
      icon: '🚀'
    },
    { 
      id: 'growth',
      days: 20, 
      price: 20, 
      label: 'Growth', 
      popular: false,
      description: 'Two weeks around a release',
      savings: '0%',
      icon: '📈'
    },
    { 
      id: 'professional',
      days: 30, 
      price: 30,                             
      label: 'Professional', 
      popular: true,
      description: 'A full month on the grid',
      savings: '0%',
      icon: '⭐'
    },
    { 
      id: 'enterprise',
      days: 60, 
      price: 60, 
      label: 'Enterprise', 
      popular: false,
      bestValue: true,
      description: 'Stay up while the game is new',
      savings: '0%',
      icon: '🏆'
    }
  ];

  const handlePlanSelect = (plan) => {
    setSelectedDuration(plan.days);
    setFinalAmount(plan.price);
  };

  const handleContinue = () => {
    navigate('/business-details', {
      state: { 
        selectedSquare, 
        pageNumber, 
        selectedDuration, 
        finalAmount 
      }
    });
  };

  const handleBackToGrid = () => {
    navigate(-1);
  };

  const selectedPlan = campaignPlans.find(plan => plan.days === selectedDuration);

  if (!selectedSquare) {
    return (
      <div className="campaign-selection-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>No Advertising Square Selected</h2>
          <p>Go back to the grid and choose an open square first.</p>
          <p>
            Need help? See <Link to="/how-it-works">how it works</Link> or visit the
            <Link to="/help"> help centre</Link>.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn--primary"
          >
            Return to Grid Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-selection-container">
      <div className="campaign-selection-content">
        {/* Header Section */}
        <header className="campaign-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Select Your Campaign</h1>
              <p className="header-subtitle">
                Choose how long your game stays on <strong>square #{selectedSquare}</strong>
              </p>
            </div>
            <nav className="progress-navigation">
              <div className="progress-step active">
                <div className="step-indicator">
                  <span>1</span>
                  <div className="step-check">✓</div>
                </div>
                <span className="step-label">Campaign</span>
              </div>
              <div className="progress-step">
                <div className="step-indicator">2</div>
                <span className="step-label">Details</span>
              </div>
              <div className="progress-step">
                <div className="step-indicator">3</div>
                <span className="step-label">Payment</span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="campaign-main-content">
          <div className="content-wrapper">
            {/* Plans Selection Section */}
            <section className="plans-section">
              <div className="section-header">
                <h2>Launch length</h2>
                <p>Select your preferred campaign duration</p>
              </div>

              <div className="plans-grid">
                {campaignPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-card ${
                      selectedDuration === plan.days ? 'plan-card--selected' : ''
                    } ${
                      plan.popular ? 'plan-card--popular' : ''
                    } ${
                      plan.bestValue ? 'plan-card--best-value' : ''
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    {/* Plan Badges */}
                    {plan.popular && (
                      <div className="plan-badge plan-badge--popular">
                        <span className="badge-icon">🔥</span>
                        Most Popular
                      </div>
                    )}
                    {plan.bestValue && (
                      <div className="plan-badge plan-badge--best-value">
                        <span className="badge-icon">💎</span>
                        Best Value
                      </div>
                    )}

                    {/* Plan Icon */}
                    <div className="plan-icon">{plan.icon}</div>

                    {/* Plan Content */}
                    <div className="plan-content">
                      <div className="plan-header">
                        <div>
                          <h3 className="plan-name">{plan.label}</h3>
                          <p className="plan-description">{plan.description}</p>
                        </div>
                      </div>

                      <div className="plan-pricing">
                        <div className="price-main">
                          <span className="currency">£</span>
                          <span className="plan-price">{plan.price}</span>
                        </div>
                        <div className="plan-duration">{plan.days} days</div>
                      </div>

                      {/* Savings Badge */}
                      {plan.savings !== '0%' && (
                        <div className="savings-badge">
                          Save {plan.savings}
                        </div>
                      )}

                      <div className="cost-efficiency">
                        <span className="cost-label">Only</span>
                        <span className="cost-amount">£{(plan.price / plan.days).toFixed(2)}</span>
                        <span className="cost-period">per day</span>
                      </div>

                      <div className={`selection-indicator ${
                        selectedDuration === plan.days ? 'selection-indicator--selected' : ''
                      }`}>
                        {selectedDuration === plan.days ? (
                          <>
                            <span className="check-icon">✓</span>
                            Selected
                          </>
                        ) : (
                          'Select Plan'
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Order Summary Section */}
            <aside className="order-summary">
              <div className="summary-card">
                <div className="summary-header">
                  <h3 className="summary-title">Order Summary</h3>
                  <div className="summary-subtitle">Review your selection</div>
                </div>
                
                <div className="summary-content">
                  {/* Order Details */}
                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">Square Number</span>
                      <span className="detail-value">#{selectedSquare}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Page Location</span>
                      <span className="detail-value">Page {pageNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Campaign Duration</span>
                      <span className="detail-value">{selectedDuration} days</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Daily Rate</span>
                      <span className="detail-value">
                        £{(selectedPlan.price / selectedPlan.days).toFixed(2)}/day
                      </span>
                    </div>
                  </div>

                  <div className="summary-divider"></div>

                  {/* Total Amount */}
                  <div className="total-section">
                    <div className="total-labels">
                      <span className="total-label">Total Amount</span>
                      <span className="total-subtitle">One-time payment</span>
                    </div>
                    <span className="total-amount">£{finalAmount}.00</span>
                  </div>

                  {/* Features Included */}
                  <div className="features-included">
                    <h4>What's Included:</h4>
                    <div className="features-grid">
                      <div className="feature-item">
                        <span className="feature-emoji">👁️</span>
                        <span>High Visibility</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-emoji">🔗</span>
                        <span>Clickable Link</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-emoji">📊</span>
                        <span>Analytics</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-emoji">🛡️</span>
                        <span>Secure Hosting</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <button 
                      onClick={handleBackToGrid}
                      className="btn btn--secondary"
                    >
                      <span className="btn-icon">←</span>
                      Back to Grid
                    </button>
                    <button 
                      onClick={handleContinue}
                      className="btn btn--primary"
                    >
                      Continue to Details
                      <span className="btn-icon">→</span>
                    </button>
                  </div>

                  {/* Trust Indicators */}
                  <div className="trust-indicators">
                    <div className="trust-item">
                      <div className="trust-icon">🔒</div>
                      <span>Secure Payment</span>
                    </div>
                    <div className="trust-item">
                      <div className="trust-icon">⚡</div>
                      <span>Instant Setup</span>
                    </div>
                    <div className="trust-item">
                      <div className="trust-icon">↩️</div>
                      <span>14-Day Guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CampaignSelection;