import React from 'react';
import { Link } from 'react-router-dom';
import './PromoLanding.css';

const PromoLanding = () => {
  return (
    <div className="promo-landing">
      {/* Hero Section */}
      <div className="promo-hero">
        <div className="promo-hero-content">
          <h1 className="promo-hero-title">
            A game square from <span className="highlight">£1 a day</span>
          </h1>
          <p className="promo-hero-subtitle">
            Put your game or app on the grid. Players tap the square and press Get.
          </p>
          <div className="promo-hero-stats">
            <div className="stat-item">
              <div className="stat-number">£1</div>
              <div className="stat-label">Per Day</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2,000</div>
              <div className="stat-label">Squares</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10</div>
              <div className="stat-label">Pages</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Visibility</div>
            </div>
          </div>
          <Link to="/" className="promo-cta-button">
            Start Your Campaign Now
          </Link>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="promo-benefits">
        <div className="container">
          <h2 className="promo-section-title">Why Choose ClickaLinks?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Affordable Pricing</h3>
              <p>£1 a day. No contract on top of the days you choose. Priced for a small game, not a large studio budget.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🎯</div>
              <h3>Fair Rotation</h3>
              <p>Our automatic shuffle system ensures every advertiser gets equal visibility. No favorites, just fair play.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h3>Instant Activation</h3>
              <p>Your advertisement goes live immediately after payment. No waiting periods, no delays.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📊</div>
              <h3>Click Analytics</h3>
              <p>Track your ad performance with simple, clear analytics. See how your campaign is performing.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Secure & Safe</h3>
              <p>Robust security measures protect your data. PCI DSS compliant payment processing via Stripe.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🤝</div>
              <h3>Support When You Need It</h3>
              <p>Our support team is here to help. Get assistance with setup, questions, or any issues.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="promo-how-it-works">
        <div className="container">
          <h2 className="promo-section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3>Choose Your Square</h3>
              <p>Pick an open square on the games grid.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3>Select Duration</h3>
              <p>Choose 10, 20, 30, or 60 days. Flexible plans to match your goals.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3>Enter Details</h3>
              <p>Add the game name, the app icon, and the App Store or Play Store link.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-item">
              <div className="step-number">4</div>
              <h3>Go Live!</h3>
              <p>Pay, and the square goes live. Get opens the store.</p>
            </div>
          </div>
          <Link to="/" className="promo-cta-button secondary">
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="promo-pricing">
        <div className="container">
          <h2 className="promo-section-title">Simple, Transparent Pricing</h2>
          <p className="promo-section-subtitle">All plans include fair rotation, instant activation, and click analytics</p>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-duration">10 Days</div>
              <div className="pricing-amount">£10</div>
              <div className="pricing-rate">£1.00/day</div>
              <ul className="pricing-features">
                <li>✓ Perfect for testing</li>
                <li>✓ Short-term promotions</li>
                <li>✓ Immediate visibility</li>
              </ul>
              <Link to="/" className="pricing-button">Choose Plan</Link>
            </div>
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-duration">20 Days</div>
              <div className="pricing-amount">£20</div>
              <div className="pricing-rate">£1.00/day</div>
              <ul className="pricing-features">
                <li>✓ Great value for money</li>
                <li>✓ Sustained visibility</li>
                <li>✓ Optimal exposure</li>
              </ul>
              <Link to="/" className="pricing-button">Choose Plan</Link>
            </div>
            <div className="pricing-card">
              <div className="pricing-duration">30 Days</div>
              <div className="pricing-amount">£30</div>
              <div className="pricing-rate">£1.00/day</div>
              <ul className="pricing-features">
                <li>✓ Extended reach</li>
                <li>✓ Maximum exposure</li>
                <li>✓ Best value</li>
              </ul>
              <Link to="/" className="pricing-button">Choose Plan</Link>
            </div>
            <div className="pricing-card">
              <div className="pricing-duration">60 Days</div>
              <div className="pricing-amount">£60</div>
              <div className="pricing-rate">£1.00/day</div>
              <ul className="pricing-features">
                <li>✓ Long-term presence</li>
                <li>✓ Premium placement</li>
                <li>✓ Maximum ROI</li>
              </ul>
              <Link to="/" className="pricing-button">Choose Plan</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="promo-social-proof">
        <div className="container">
          <h2 className="promo-section-title">How a player finds a game</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-text">
                Tap or rest on a square. The store page opens with the icon, screenshots and rating.
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-text">
                Press Get. iPhone opens the App Store. Android opens Google Play.
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-text">
                Squares shuffle, so a new game is not stuck at the back of the grid.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="promo-final-cta">
        <div className="container">
          <h2>Ready to place a game?</h2>
          <p>A square from £1 a day. Get sends players to the store.</p>
          <Link to="/" className="promo-cta-button large">
            Start Your Campaign Now
          </Link>
          <p className="cta-note">Browsing the grid is free. Paying starts only when you claim a square.</p>
        </div>
      </div>
    </div>
  );
};

export default PromoLanding;

