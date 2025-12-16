import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="container">
          <h1>About CLICKaLINKS</h1>
          <p className="subtitle">Connecting Trusted Businesses with Shoppers Looking to Save</p>
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
                <strong>CLICKaLINKS</strong> is a UK-based deals and promotions platform created to help customers 
                find genuine savings and to give businesses an affordable, effective way to advertise their offers. 
                We connect trusted businesses with people who actively want to save money — not just during major 
                sale events, but all year round.
              </p>
              <p>
                Founded in 2025, CLICKaLINKS was built with simplicity, fairness, and accessibility at its core. 
                We believe that great deals shouldn't be hidden behind expensive advertising campaigns or limited 
                to a few days on the calendar. Our platform gives businesses of all sizes — from local independents 
                to growing online brands — the opportunity to showcase their offers directly to engaged shoppers.
              </p>
            </div>
          </div>

          {/* Why We Started */}
          <div className="content-section">
            <div className="section-card">
              <h2>Why We Started</h2>
              <p>
                CLICKaLINKS began with a simple observation: finding real online deals outside of major holiday 
                sales had become unnecessarily difficult. Most discounts are heavily promoted during events like 
                Christmas, Black Friday, or Valentine's Day, while everyday savings often go unnoticed.
              </p>
              <p>
                The idea came from real conversations. As a taxi driver in Devon, I speak with customers daily — 
                working families, retirees, students, and business owners. A common topic kept coming up: the rising 
                cost of living and how hard it is to find reliable discounts on everyday products and services. Like 
                many others, I personally experienced the pressure of living bill to bill, maintaining a road-worthy 
                vehicle, and covering increasing expenses.
              </p>
              <p>
                Those conversations inspired CLICKaLINKS. The platform was created to support people facing real 
                financial pressures, while also helping businesses reach customers without paying high advertising fees. 
                Our mission is simple: make everyday deals easier to find and more accessible for everyone.
              </p>
            </div>
          </div>

          {/* A Local Idea with a National Vision */}
          <div className="content-section">
            <div className="section-card">
              <h2>A Local Idea with a National Vision</h2>
              <p>
                CLICKaLINKS was founded in Devon, but our vision reaches across the UK. What started as a local idea 
                driven by everyday struggles has grown into a platform designed to benefit communities nationwide.
              </p>
              <p>
                We are proud of our roots and the honest, hardworking values that shaped the business. By supporting 
                local and online businesses alike, CLICKaLINKS helps strengthen communities while giving shoppers smarter 
                ways to save money — no matter where they live.
              </p>
            </div>
          </div>

          {/* Founder's Note */}
          <div className="content-section">
            <div className="section-card">
              <h2>Founder's Note</h2>
              <blockquote style={{fontStyle: 'italic', borderLeft: '4px solid #667eea', paddingLeft: '20px', margin: '20px 0', fontSize: '1.1em', color: '#4a5568'}}>
                "CLICKaLINKS wasn't created in a boardroom — it was created on the road. After years of speaking to 
                customers and experiencing the same financial challenges myself, I realised there had to be a better way 
                for people to find real deals throughout the year. This platform is built for everyday people, everyday 
                businesses, and everyday savings."
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
                  <h3>Affordable Advertising for Businesses</h3>
                  <p>Low-cost advertising solutions that work for businesses of all sizes</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🎯</div>
                  <h3>Real Deals Promoted All Year Round</h3>
                  <p>Not just seasonal — genuine savings available throughout the year</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">📱</div>
                  <h3>Easy-to-Use Platform for Shoppers</h3>
                  <p>Simple navigation to find the deals you're looking for</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🏪</div>
                  <h3>Support for Local and Independent Businesses</h3>
                  <p>Helping local businesses reach customers without breaking the bank</p>
                </div>
                <div className="feature-card">
                  <div className="feature-icon">🇬🇧</div>
                  <h3>UK-Focused, Community-Driven Approach</h3>
                  <p>Built in the UK, for UK businesses and shoppers</p>
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

          {/* Company Information */}
          <div className="content-section">
            <div className="section-card">
              <h2>Company Information</h2>
              <p>
                <strong>Clicado Media UK Ltd</strong> is an advertisement company registered in England and Wales, registration number is 16904433.
              </p>
              <p style={{marginTop: '0.5rem'}}>
                <strong>Clicado Media UK Ltd</strong> trading as <strong>clickalinks.com</strong>
              </p>
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