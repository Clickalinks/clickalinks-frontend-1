import React from 'react';

const Footer = () => {
  return (
    <footer>
      <div className="footer-links">
        <a href="/about.html"><i className="fas fa-info-circle"></i> About</a>
        <a href="/terms.html"><i className="fas fa-file-contract"></i> Terms & Conditions</a>
        <a href="/how-it-works.html"><i className="fas fa-play-circle"></i> How It Works</a>
        <a href="mailto:info@clickalinks.com"><i className="fas fa-envelope"></i> Contact Us</a>
      </div>
      
      <div className="payment-icons">
        <i className="fab fa-cc-visa"></i>
        <i className="fab fa-cc-mastercard"></i>
        <i className="fab fa-cc-stripe"></i>
        <i className="fab fa-cc-google-pay"></i>
        <i className="fab fa-cc-apple-pay"></i>
        <i className="fab fa-cc-amex"></i>
        <i className="fab fa-cc-paypal"></i>
      </div>
      <p>All Major Payment Methods Accepted</p>
      
      <div className="copyright">
        <i className="far fa-copyright"></i> 2024 CLICKaLINKS. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;