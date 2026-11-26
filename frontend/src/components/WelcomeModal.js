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
          <h2>Welcome to ClickaLinks</h2>
          <p className="welcome-modal-subtitle">Tap. Get. Play.</p>
        </div>

        <div className="welcome-modal-content">
          <div className="welcome-features">
            <div className="welcome-feature-item">
              <span className="welcome-feature-icon">🎮</span>
              <div className="welcome-feature-text">
                <h3>Games and apps</h3>
                <p>A wall of games and apps for iPhone and Android. Rest on a square to open the store page.</p>
              </div>
            </div>

            <div className="welcome-feature-item">
              <span className="welcome-feature-icon">💰</span>
              <div className="welcome-feature-text">
                <h3>£1 a day</h3>
                <p>A square for your game or app, with no contract. Most of the games here are free to download.</p>
              </div>
            </div>

            <div className="welcome-feature-item">
              <span className="welcome-feature-icon">📲</span>
              <div className="welcome-feature-text">
                <h3>Press Get</h3>
                <p>The Get button opens the App Store or Google Play, and the player installs the game there.</p>
              </div>
            </div>

            <div className="welcome-feature-item">
              <span className="welcome-feature-icon">⚖️</span>
              <div className="welcome-feature-text">
                <h3>Fair placement</h3>
                <p>Squares shuffle so every game gets a turn on the page, not only the ones that arrived first.</p>
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
