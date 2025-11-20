import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Quick Links - FIXED FOR MOBILE */}
        <div className="footer-links">
          <Link to="/how-it-works" className="footer-link mobile-friendly">
            How It Works
          </Link>
          <Link to="/about" className="footer-link mobile-friendly">
            About Us
          </Link>
          <Link to="/contact" className="footer-link mobile-friendly">
            Contact
          </Link>
        </div>

        {/* Copyright */}  {/* Logo Section */}
        <div className="footer-logo-section">
          <img
            src="/logo-new.PNG"
            alt="CLICKALINKS"
            className="footer-logo"
          />
        </div>
        <div className="footer-copyright">
          <p>&copy; 2025 CLICKALINKS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;