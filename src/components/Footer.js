import React from 'react';

const Footer = () => {
  return (
    <footer style={{ 
      background: "linear-gradient(135deg, #37474f, #263238)", 
      color: "#fff", 
      textAlign: "center", 
      padding: "2rem 1rem",
      marginTop: "3rem"
    }}>
      {/* Footer Links */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: "1.5rem", 
        marginBottom: "1.5rem",
        flexWrap: "wrap"
      }}>
        <a href="about.html" style={{ 
          color: "#cfd8dc", 
          textDecoration: "none", 
          fontSize: "0.95rem",
          padding: "0.6rem 1rem",
          borderRadius: "8px",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(255, 255, 255, 0.1)"
        }} onMouseOver={(e) => {
          e.target.style.color = "#4fc3f7";
          e.target.style.background = "rgba(255, 255, 255, 0.15)";
          e.target.style.transform = "translateY(-2px)";
        }} onMouseOut={(e) => {
          e.target.style.color = "#cfd8dc";
          e.target.style.background = "rgba(255, 255, 255, 0.1)";
          e.target.style.transform = "translateY(0)";
        }}>
          <i className="fas fa-info-circle"></i> About
        </a>
        
        <a href="terms.html" style={{ 
          color: "#cfd8dc", 
          textDecoration: "none", 
          fontSize: "0.95rem",
          padding: "0.6rem 1rem",
          borderRadius: "8px",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(255, 255, 255, 0.1)"
        }} onMouseOver={(e) => {
          e.target.style.color = "#4fc3f7";
          e.target.style.background = "rgba(255, 255, 255, 0.15)";
          e.target.style.transform = "translateY(-2px)";
        }} onMouseOut={(e) => {
          e.target.style.color = "#cfd8dc";
          e.target.style.background = "rgba(255, 255, 255, 0.1)";
          e.target.style.transform = "translateY(0)";
        }}>
          <i className="fas fa-file-contract"></i> Terms & Conditions
        </a>
        
        <a href="how-it-works.html" style={{ 
          color: "#cfd8dc", 
          textDecoration: "none", 
          fontSize: "0.95rem",
          padding: "0.6rem 1rem",
          borderRadius: "8px",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(255, 255, 255, 0.1)"
        }} onMouseOver={(e) => {
          e.target.style.color = "#4fc3f7";
          e.target.style.background = "rgba(255, 255, 255, 0.15)";
          e.target.style.transform = "translateY(-2px)";
        }} onMouseOut={(e) => {
          e.target.style.color = "#cfd8dc";
          e.target.style.background = "rgba(255, 255, 255, 0.1)";
          e.target.style.transform = "translateY(0)";
        }}>
          <i className="fas fa-play-circle"></i> How It Works
        </a>
        
        <a href="mailto:info@clickalinks.com" style={{ 
          color: "#cfd8dc", 
          textDecoration: "none", 
          fontSize: "0.95rem",
          padding: "0.6rem 1rem",
          borderRadius: "8px",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(255, 255, 255, 0.1)"
        }} onMouseOver={(e) => {
          e.target.style.color = "#4fc3f7";
          e.target.style.background = "rgba(255, 255, 255, 0.15)";
          e.target.style.transform = "translateY(-2px)";
        }} onMouseOut={(e) => {
          e.target.style.color = "#cfd8dc";
          e.target.style.background = "rgba(255, 255, 255, 0.1)";
          e.target.style.transform = "translateY(0)";
        }}>
          <i className="fas fa-envelope"></i> Contact Us
        </a>
      </div>
      
      {/* Payment Icons */}
      <div style={{ 
        margin: "1.5rem 0", 
        display: "flex", 
        justifyContent: "center", 
        gap: "1.2rem",
        flexWrap: "wrap"
      }}>
        <i className="fab fa-cc-visa" style={{ fontSize: "2.5rem", opacity: "0.9", transition: "all 0.3s ease" }}></i>
        <i className="fab fa-cc-mastercard" style={{ fontSize: "2.5rem", opacity: "0.9", transition: "all 0.3s ease" }}></i>
        <i className="fab fa-cc-stripe" style={{ fontSize: "2.5rem", opacity: "0.9", transition: "all 0.3s ease" }}></i>
        <i className="fab fa-cc-google-pay" style={{ fontSize: "2.5rem", opacity: "0.9", transition: "all 0.3s ease" }}></i>
        <i className="fab fa-cc-apple-pay" style={{ fontSize: "2.5rem", opacity: "0.9", transition: "all 0.3s ease" }}></i>
        <i className="fab fa-cc-amex" style={{ fontSize: "2.5rem", opacity: "0.9", transition: "all 0.3s ease" }}></i>
        <i className="fab fa-cc-paypal" style={{ fontSize: "2.5rem", opacity: "0.9", transition: "all 0.3s ease" }}></i>
      </div>
      
      <p style={{ margin: "0.8rem 0", fontSize: "1rem", opacity: "0.9" }}>
        All Major Payment Methods Accepted
      </p>
      
      <div style={{ 
        fontSize: "0.9rem", 
        marginTop: "1.5rem", 
        opacity: "0.7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem"
      }}>
        <i className="far fa-copyright"></i> 
        {new Date().getFullYear()} CLICKaLINKS. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;