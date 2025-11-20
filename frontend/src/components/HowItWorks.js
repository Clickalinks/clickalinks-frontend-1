import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1>How It Works</h1>
          <p className="subtitle">Get your business in front of thousands in just 3 simple steps</p>
        </div>
      </div>

      {/* Three Main Sections */}
      <div className="main-sections">
        <div className="container">
          <div className="section-grid">
            {/* Section 1 */}
            <div className="section-card">
              <div className="card-icon">
                <div className="icon-wrapper">
                  <i className="fas fa-th-large"></i>
                </div>
                <div className="step-number">01</div>
              </div>
              <h3>Choose Your Square</h3>
              <p>Browse our 2000-square grid across 10 pages and select any available advertising spot. Each square represents prime visibility where thousands of potential customers can discover your business.</p>
            </div>

            {/* Section 2 */}
            <div className="section-card">
              <div className="card-icon">
                <div className="icon-wrapper">
                  <i className="fas fa-upload"></i>
                </div>
                <div className="step-number">02</div>
              </div>
              <h3>Upload & Customize</h3>
              <p>Upload your professional company logo and provide the direct link to your special offers, discounted products, or landing page. Our system supports all standard image formats.</p>
            </div>

            {/* Section 3 */}
            <div className="section-card">
              <div className="card-icon">
                <div className="icon-wrapper">
                  <i className="fas fa-rocket"></i>
                </div>
                <div className="step-number">03</div>
              </div>
              <h3>Launch & Track</h3>
              <p>Choose your campaign duration (10, 20, 30 or 60 days), complete your payment, and watch the clicks roll in! Your advertisement goes live immediately upon payment confirmation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>Simple & Transparent Pricing</h2>
            <p>Choose the perfect campaign duration for your business needs</p>
          </div>
          
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="price-header">
                <div className="duration">10 Days</div>
                <div className="price">£10</div>
              </div>
              <ul className="features">
                <li>Perfect for testing</li>
                <li>Short-term promotions</li>
                <li>Immediate visibility</li>
              </ul>
              <button className="cta-button">Get Started</button>
            </div>

            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <div className="price-header">
                <div className="duration">20 Days</div>
                <div className="price">£20</div>
              </div>
              <ul className="features">
                <li>Great value</li>
                <li>Sustained visibility</li>
                <li>Optimal exposure</li>
              </ul>
              <button className="cta-button primary">Get Started</button>
            </div>

            <div className="pricing-card">
              <div className="price-header">
                <div className="duration">30 Days</div>
                <div className="price">£30</div>
              </div>
              <ul className="features">
                <li>Extended reach</li>
                <li>Maximum exposure</li>
                <li>Best value</li>
              </ul>
              <button className="cta-button">Get Started</button>
            </div>

            <div className="pricing-card">
              <div className="price-header">
                <div className="duration">60 Days</div>
                <div className="price">£60</div>
              </div>
              <ul className="features">
                <li>Long-term presence</li>
                <li>Premium placement</li>
                <li>Maximum ROI</li>
              </ul>
              <button className="cta-button">Get Started</button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <h2>Ready to Boost Your Visibility?</h2>
          <p>Join hundreds of businesses already growing with our advertising platform</p>
          <button className="cta-button large">Start Your Campaign Today</button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;