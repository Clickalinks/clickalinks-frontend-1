import React, { useState } from 'react';  // Fixed - added useState import
import './ContactForm.css';  // Fixed import - should be ContactForm.css, not About.css

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { name, email, subject, message } = formData;
    const mailtoLink = `mailto:info@clickalinks.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`
    )}`;
    
    window.location.href = mailtoLink;
  };

  return (
    <div className="contact-container">
      <div className="contact-content">
        <div className="contact-header">
          <h1>📧 Contact CLICKaLINKS</h1>
          <p>Get in touch with us - we're here to help your business grow!</p>
        </div>

        <div className="contact-grid">
          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="contact-form-container">
              <h2>💬 Send us a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Your Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="contact-submit-btn">
                  📨 Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="contact-info-section">
            <div className="contact-info-card">
              <h3>📞 Get In Touch</h3>
              
              <div className="contact-method">
                <div className="contact-icon">📧</div>
                <div className="contact-details">
                  <strong>Email Us</strong>
                  <p>info@clickalinks.com</p>
                  <small>We typically reply within 24 hours</small>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">🕒</div>
                <div className="contact-details">
                  <strong>Business Hours</strong>
                  <p>Monday - Friday: 9AM - 6PM</p>
                  <p>Saturday: 10AM - 4PM</p>
                  <small>GMT Time Zone</small>
                </div>
              </div>

              <div className="contact-method">
                <div className="contact-icon">🚀</div>
                <div className="contact-details">
                  <strong>Advertising Support</strong>
                  <p>Need help with your campaign?</p>
                  <small>We're here to help you succeed</small>
                </div>
              </div>

              <div className="contact-features">
                <h4>Why Choose CLICKaLINKS?</h4>
                <ul className="contact-features-list">
                  <li>✅ Affordable advertising from £1/day</li>
                  <li>✅ Direct customer connections</li>
                  <li>✅ 2000+ advertising squares</li>
                  <li>✅ Automatic square shuffling</li>
                  <li>✅ Secure payment processing</li>
                  <li>✅ Premium visibility for your business</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;