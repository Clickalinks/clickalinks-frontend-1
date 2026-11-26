import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* CTA Section */}
        <div className="footer-cta">
          <h2 className="footer-cta-title">Put your game on the grid</h2>
          <p className="footer-cta-subtitle">A square for your game or app, from £1 a day. Players tap, see the details, and press Get.</p>
          <Link to="/" className="footer-cta-button">See the games grid</Link>
        </div>
        
        {/* Main Footer Content */}
        <div className="footer-content">
          
          {/* Quick Links Section */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <div className="footer-links">
              <Link to="/how-it-works" className="footer-link">
                How It Works
              </Link>
              <Link to="/about" className="footer-link">
                About Us
              </Link>
              <Link to="/blog" className="footer-link">
                Blog
              </Link>
              <Link to="/privacy" className="footer-link">
                Privacy Policy
              </Link>
              <Link to="/terms" className="footer-link">
                Terms & Conditions
              </Link>
            </div>
          </div>

          {/* Payment Methods Section - Simple Text-Based Icons */}
          <div className="footer-section">
            <h4 className="footer-title">We Accept</h4>
            <div className="payment-icons-container">
              {/* Visa */}
              <div className="payment-icon visa" title="Visa">
                <span className="payment-text">VISA</span>
              </div>
              {/* MasterCard */}
              <div className="payment-icon mastercard" title="MasterCard">
                <span className="payment-text">MasterCard</span>
              </div>
              {/* PayPal */}
              <div className="payment-icon paypal" title="PayPal">
                <span className="payment-text">PayPal</span>
              </div>
              {/* American Express */}
              <div className="payment-icon amex" title="American Express">
                <span className="payment-text">Amex</span>
              </div>
            </div>
          </div>

          {/* Support & Contact Section */}
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <div className="footer-links">
              <a href="mailto:support@clickalinks.com" className="footer-link">
                support@clickalinks.com
              </a>
              <Link to="/help" className="footer-link">
                Help Center
              </Link>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="footer-section">
            <h4 className="footer-title">Follow Us</h4>
            <div className="social-links">
              {/* TikTok */}
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
                <svg className="social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <svg className="social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>  
              {/* X */}
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X">
                <svg className="social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                <svg className="social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Reddit */}
              <a href="https://www.reddit.com/user/Clickalinks-ads/" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Reddit">
                <svg className="social-svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.69 0 1.25.56 1.25 1.25a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463.327.327 0 0 0 .463 0 .33.33 0 0 0 .094-.231.326.326 0 0 0-.094-.231.33.33 0 0 0-.232-.095zm5.466 0a.326.326 0 0 0-.231.094.33.33 0 0 0 0 .463.327.327 0 0 0 .463 0 .33.33 0 0 0 .094-.231.326.326 0 0 0-.094-.231.33.33 0 0 0-.232-.095z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Copyright Section */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; 2025 CLICKALINKS. All rights reserved.</p>
            <p style={{marginTop: '0.5rem', fontSize: '0.85rem', opacity: '0.9'}}>
              Clicado Media UK Ltd trading as clickalinks.com
            </p>
            <p style={{marginTop: '0.25rem', fontSize: '0.8rem', opacity: '0.85'}}>
              Registered in England & Wales, Registration Number: 16904433
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;