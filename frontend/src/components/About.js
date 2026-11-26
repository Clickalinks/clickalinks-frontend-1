import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import './About.css';

const About = () => {
  return (
    <>
      <SEO
        title="About CLICKaLINKS | Games and Apps | Tap. Get. Play."
        description="CLICKaLINKS is a UK grid for games and apps. Players tap a square and press Get. Developers place a game from £1 a day. Founded in Devon in 2025 by Noor, Clicado Media UK Ltd."
        keywords="about clickalinks, games advertising, app store grid, indie games UK, tap get play, clickalinks games, £1 a day game promotion"
      />
      <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="container">
          <h1>About CLICKaLINKS</h1>
          <p className="subtitle">A place to find games, and a square for the people who make them</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-content">
        <div className="container">
          {/* About CLICKaLINKS Section */}
          <div className="content-section">
            <div className="section-card">
              <h2>About CLICKaLINKS</h2>
              <p>
                <strong>CLICKaLINKS</strong> is a UK grid of games and apps. A player taps a square, sees the
                icon, screenshots, rating and a Get button, then continues to the App Store or Google Play.
                A developer can put a game on that grid from £1 a day.
              </p>
              <p>
                Founded in 2025, CLICKaLINKS was built to be simple and fair. Big studios buy installs from
                the large ad networks. A solo developer or a small studio usually cannot. A square here is
                a plain way to be seen while a game is new.
              </p>
            </div>
          </div>

          {/* Why We Started */}
          <div className="content-section">
            <div className="section-card">
              <h2>Why We Started</h2>
              <p>
                Most new games disappear. The stores are crowded, and a launch without a large ad budget
                is easy to miss. CLICKaLINKS is a wall where a game can sit in the open, with its real
                store page one tap away.
              </p>
              <p>
                The company started in Devon. I drive a taxi here, and I build the site myself. The same
                idea that shaped the first version still holds: a fair price, a simple page, and a place
                that a small maker can actually afford.
              </p>
            </div>
          </div>

          {/* A Local Idea with a National Vision */}
          <div className="content-section">
            <div className="section-card">
              <h2>A Local Idea with a National Vision</h2>
              <p>
                CLICKaLINKS was founded in Devon. The games on the grid can come from anywhere.
              </p>
              <p>
                The company is proud of those roots. The grid is for games and apps made anywhere, and the
                company behind it remains in Devon.
              </p>
            </div>
          </div>

          {/* Founder's Note */}
          <div className="content-section">
            <div className="section-card">
              <h2>Founder's Note</h2>
              <blockquote style={{fontStyle: 'italic', borderLeft: '4px solid #667eea', paddingLeft: '20px', margin: '20px 0', fontSize: '1.1em', color: '#4a5568'}}>
                "My name is Noor. I’m a taxi driver and the founder and developer of Clickalinks.com. I built
                CLICKaLINKS so a game or app can be seen without a large advertising budget. Tap a square,
                press Get, and the store does the rest. I want it to stay practical and fair."
              </blockquote>
            </div>
          </div>

          {/* What Makes CLICKaLINKS Different */}
          <div className="content-section">
            <div className="section-card">
              <h2>What Makes CLICKaLINKS Different</h2>
              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">💰</div>
                  <h3>A square from £1 a day</h3>
                  <p>Priced for a solo developer or a small studio, not a large user-acquisition budget</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📲</div>
                  <h3>A real store page</h3>
                  <p>Icon, screenshots, rating and a Get button that opens the App Store or Google Play</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📱</div>
                  <h3>Made for phones</h3>
                  <p>On a computer, rest on a square. On a phone, tap it. The same page opens.</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎮</div>
                  <h3>For indie games and apps</h3>
                  <p>A place to be seen in the first weeks after launch</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🇬🇧</div>
                  <h3>Built in the UK</h3>
                  <p>Clicado Media UK Ltd, founded in Devon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stats-wrapper">
              <h2 className="stats-title">By The Numbers</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">2,000+</div>
                  <div className="stat-label">Squares for games</div>
                  <div className="stat-description">Available across all pages</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-number">£1</div>
                  <div className="stat-label">Starting Price Per Day</div>
                  <div className="stat-description">For a game or an app</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-number">10</div>
                  <div className="stat-label">Pages of the grid</div>
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

          {/* Company Information */}
          <div className="content-section">
            <div className="section-card">
              <h2>Company Information</h2>
              <p>
                <strong>Clicado Media UK Ltd</strong> is registered in England and Wales, number 16904433.
              </p>
              <p style={{marginTop: '0.5rem'}}>
                <strong>Clicado Media UK Ltd</strong> trading as <strong>clickalinks.com</strong>
              </p>
            </div>
          </div>

          {/* Explore More */}
          <div className="content-section">
            <div className="section-card">
              <h2>Explore More</h2>
              <p>
                Learn how the platform works and start your campaign when you are ready.
              </p>
              <div className="cta-buttons">
                <Link to="/how-it-works" className="cta-btn secondary">How It Works</Link>
                <Link to="/campaign" className="cta-btn primary">Start Your Campaign</Link>
                <Link to="/blog" className="cta-btn secondary">Read the Blog</Link>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <div className="section-card accent">
              <h3>Ready to Get Started?</h3>
              <p>Put a game on the grid, or tap one that is already there.</p>
              <div className="cta-buttons">
                <a href="/" className="cta-btn primary">Open the games grid</a>
                <Link to="/campaign" className="cta-btn secondary">Start a Campaign</Link>
                <Link to="/how-it-works" className="cta-btn secondary">How It Works</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default About;