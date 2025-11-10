import React from 'react';

const Footer = () => {
  return (
    <footer>
    <div class="footer-links">
        <a href="about.html"><i class="fas fa-info-circle"></i> About</a>
        <a href="terms.html"><i class="fas fa-file-contract"></i> Terms & Conditions</a>
        <a href="how-it-works.html"><i class="fas fa-play-circle"></i> How It Works</a>
        <a href="mailto:info@clickalinks.com" className="footer-link"><i className="fas fa-envelope"></i> Contact Us</a>
    </div>
    
    <div class="payment-icons">
        <i class="fab fa-cc-visa"></i>
        <i class="fab fa-cc-mastercard"></i>
        <i class="fab fa-cc-stripe"></i>
        <i class="fab fa-cc-google-pay"></i>
        <i class="fab fa-cc-apple-pay"></i>
        <i class="fab fa-cc-amex"></i>
        <i class="fab fa-cc-paypal"></i>
    </div>
    <p>All Major Payment Methods Accepted</p>
    
    <div class="copyright">
        <i class="far fa-copyright"></i> 2024 CLICKaLINKS. All rights reserved.
    </div>
</footer>
  );
};

export default Footer;