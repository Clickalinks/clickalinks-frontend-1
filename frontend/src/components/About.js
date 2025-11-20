import React from 'react';
import './About.css';

const About = () => {
  const features = [
    { icon: '💰', title: 'Affordable', description: 'Only £1 per day for premium ad space' },
    { icon: '⚡', title: 'Simple', description: 'No complex contracts or hidden fees' },
    { icon: '🎯', title: 'Effective', description: 'Direct click-through to your deals' },
    { icon: '🔄', title: 'Flexible', description: 'Choose 10, 20, or 30-day campaigns' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="container">
          <h1>About CLICKaLINKS</h1>
          <p className="subtitle">Directing Businesses to Customers, One Click at a Time</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-content">
        <div className="container">
          {/* Mission Section */}
          <div className="content-section">
            <div className="section-card">
              <h2>Our Mission</h2>
              <p>
                <strong>CLICKaLINKS</strong> was founded with a simple mission: to connect amazing businesses 
                with customers looking for great deals. We provide an affordable advertising platform where 
                businesses of all sizes can showcase their offers directly to engaged shoppers.
              </p>
            </div>
          </div>

          {/* Why We Started */}
          <div className="content-section">
            <div className="section-card">
              <h2>Why We Started</h2>
              <p>
                Founded in 2025, CLICKaLINKS was created to make finding real deals simple again. We realized 
                that searching for everyday discounts had become a mission. Most businesses only promote 
                seasonal offers around holidays like Valentine's Day, Halloween, or Christmas. Meanwhile, 
                the great discounts on daily essentials often go unnoticed. Our goal is to change that by 
                giving businesses an affordable way to advertise their everyday deals, and helping customers 
                easily discover genuine savings all year round.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="content-section">
            <div className="section-card">
              <h2>What Makes Us Different</h2>
              <div className="features-grid">
                {features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="content-section">
            <div className="section-card">
              <h2>Our Values</h2>
              <p>
                We believe in transparency, fairness, and creating win-win situations for both businesses 
                and customers. Every square on our platform represents an opportunity for growth and discovery.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="section-card">
              <h2>By The Numbers</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">2,000+</div>
                  <div className="stat-label">Advertising Squares</div>
                  <div className="stat-description">Available across all pages</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-number">£1</div>
                  <div className="stat-label">Starting Price Per Day</div>
                  <div className="stat-description">Affordable advertising for all</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-number">10</div>
                  <div className="stat-label">Advertising Pages</div>
                  <div className="stat-description">Multiple placement options</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-number">60</div>
                  <div className="stat-label">Max Campaign Days</div>
                  <div className="stat-description">Extended visibility period</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <div className="section-card accent">
              <h3>Ready to Get Started?</h3>
              <p>Join hundreds of businesses already advertising on CLICKaLINKS.</p>
              <div className="cta-buttons">
                <a href="/" className="cta-btn primary">View Advertising Grid</a>
                <a href="/how-it-works" className="cta-btn secondary">Learn How It Works</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;