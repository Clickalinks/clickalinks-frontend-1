import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import './WelcomeModal.css';

const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleClose = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem('clickalinks_welcome_modal_seen', 'true');
    document.body.style.overflow = 'unset';
  }, []);

  useEffect(() => {
    // Only show on homepage
    if (!isHomePage) {
      setIsOpen(false);
      return;
    }

    // Check if modal has been dismissed before
    const hasSeenModal = localStorage.getItem('clickalinks_welcome_modal_seen');
    
    // Show modal after 1 second delay if not seen before
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isHomePage]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !isHomePage) return null;

  return (
    <div className="welcome-modal-overlay" onClick={handleOverlayClick}>
      <div className="welcome-modal">
        <button 
          className="welcome-modal-close" 
          onClick={handleClose}
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className="welcome-modal-header">
          <h2>Welcome to ClickaLinks!</h2>
          <p className="welcome-modal-subtitle">Your Direct Advertising Platform</p>
        </div>

        <div className="welcome-modal-content">
          <div className="welcome-features">
            <div className="welcome-feature-item">
              <span className="welcome-feature-icon">💰</span>
              <div className="welcome-feature-text">
                <h3>Affordable Advertising</h3>
                <p>Just £1 per day - cost-effective marketing that fits any budget</p>
              </div>
            </div>

            <div className="welcome-feature-item">
              <span className="welcome-feature-icon">🤝</span>
              <div className="welcome-feature-text">
                <h3>Supporting Small Businesses</h3>
                <p>Built specifically to help small businesses reach customers affordably</p>
              </div>
            </div>

            <div className="welcome-feature-item">
              <span className="welcome-feature-icon">🎯</span>
              <div className="welcome-feature-text">
                <h3>Promote Sales & Deals</h3>
                <p>Perfect for showcasing sales, special offers, and clearance products</p>
              </div>
            </div>

            <div className="welcome-feature-item">
              <span className="welcome-feature-icon">⚖️</span>
              <div className="welcome-feature-text">
                <h3>Fair Placement System</h3>
                <p>Our automatic shuffling ensures fair visibility for every business</p>
              </div>
            </div>
          </div>
        </div>

        <div className="welcome-modal-footer">
          <button className="welcome-modal-button" onClick={handleClose}>
            Get Started
          </button>
          <p className="welcome-modal-note">
            Click anywhere outside this window or press Escape to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
