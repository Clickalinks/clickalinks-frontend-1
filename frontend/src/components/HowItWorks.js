import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <>
      <SEO
        title="How CLICKaLINKS Works | Place a Game from £1 a Day"
        description="Choose a square, add your game icon and store link, and pay. Players tap the square, see the store page, and press Get. £1 a day for iPhone and Android games and apps."
        keywords="how clickalinks works, promote an indie game, app store advertising, £1 a day, tap get play, place a game"
      />
      <div className="how-it-works">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <h1>How It Works</h1>
          <p className="subtitle">Put a game on the grid in three steps</p>
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
              <p>Browse the grid across 10 pages and choose an open square. That square becomes your game’s place on the wall.</p>
            </div>

            {/* Section 2 */}
            <div className="section-card">
              <div className="card-icon">
                <div className="icon-wrapper">
                  <i className="fas fa-upload"></i>
                </div>
                <div className="step-number">02</div>
              </div>
              <h3>Add your game</h3>
              <p>Upload the app icon and paste the App Store or Google Play link. Players who press Get are taken to that store page.</p>
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
              <p>Choose 10, 20, 30 or 60 days at £1 a day. The square goes live when payment is confirmed, and Get opens the store.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>Simple & Transparent Pricing</h2>
            <p>£1 a day. Pick the length of the launch.</p>
          </div>
          
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="price-header">
                <div className="duration">10 Days</div>
                <div className="price">£10</div>
              </div>
              <ul className="features">
                <li>A short launch test</li>
                <li>Useful around release day</li>
                <li>Live after payment</li>
              </ul>
              <Link to="/campaign" className="cta-button">Get Started</Link>
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
              <Link to="/campaign" className="cta-button primary">Get Started</Link>
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
              <Link to="/campaign" className="cta-button">Get Started</Link>
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
              <Link to="/campaign" className="cta-button">Get Started</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>Ready to Launch?</h2>
            <p>Start a campaign or explore the grid before you decide.</p>
          </div>
          <div className="cta-buttons">
            <Link to="/campaign" className="cta-button primary">Start Your Campaign</Link>
            <Link to="/page1" className="cta-button">View the Grid</Link>
            <Link to="/help" className="cta-button">Help Centre</Link>
          </div>
        </div>
      </div>

    </div>
    </>
  );
};

export default HowItWorks;