import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-content">
        <header className="privacy-header">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>
          <div className="security-badge">
            <div className="lock-icon">🔒</div>
            <span>Simple, transparent data practices</span>
          </div>
        </header>

        <div className="privacy-body">
          <section className="policy-section">
            <h2>1. Information We Collect</h2>
            <p>
              We only collect information that's necessary to display your advertising campaign. 
              No user accounts, no tracking, no analytics.
            </p>
            
            <div className="info-category">
              <h3>Campaign Information</h3>
              <ul>
                <li><strong>Business Details:</strong> Business name, contact email, website</li>
                <li><strong>Advertising Content:</strong> Logo image, deal description</li>
                <li><strong>Campaign Settings:</strong> Selected square number, duration, amount</li>
              </ul>
            </div>

            <div className="transparency-note">
              <strong>Note:</strong> We do NOT collect IP addresses, create user accounts, 
              track browsing, or use any analytics. Payment processing is simulated for this demo.
            </div>
          </section>

          <section className="policy-section">
            <h2>2. How We Use Your Information</h2>
            <div className="usage-grid">
              <div className="usage-item">
                <div className="usage-icon">🖼️</div>
                <div>
                  <h4>Display Advertising</h4>
                  <p>Show your business logo and deal on the grid</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">⏰</div>
                <div>
                  <h4>Manage Duration</h4>
                  <p>Display your ad for the selected time period</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">🔄</div>
                <div>
                  <h4>Square Rotation</h4>
                  <p>Include your ad in automatic shuffling</p>
                </div>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>3. Data Storage</h2>
            <div className="storage-info">
              <div className="storage-item">
                <h3>📍 Browser Local Storage</h3>
                <p>All campaign data is stored locally in your web browser. This means:</p>
                <ul>
                  <li>You have full control over the data</li>
                  <li>Data persists until you clear browser storage</li>
                  <li>No external servers store your information</li>
                  <li>Easy to remove by clearing browser data</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>4. Data Control</h2>
            <p>
              Since we don't have user accounts, you maintain control through your browser:
            </p>
            <div className="control-points">
              <div className="control-item">
                <strong>View Data:</strong> Your ad is publicly visible on the advertising grid
              </div>
              <div className="control-item">
                <strong>Data Removal:</strong> Clear browser storage to delete all campaign data
              </div>
              <div className="control-item">
                <strong>Automatic Expiry:</strong> Ads stop displaying after your selected duration
              </div>
              <div className="control-item">
                <strong>No Accounts:</strong> No login required, no personal profiles
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>5. Data Sharing</h2>
            <p>
              <strong>We do not share your data with anyone.</strong> Your business information 
              is only used to display your advertising campaign on our platform. No third-party 
              services, no data brokers, no advertisers.
            </p>
          </section>

          <section className="policy-section">
            <h2>6. Contact & Questions</h2>
            <div className="contact-info">
              <p>If you have questions about your data or privacy, we're happy to help.</p>
              <div className="contact-details">
                <p><strong>Email:</strong> privacy@clickalinks.com</p>
              </div>
            </div>
          </section>

          <section className="policy-section commitment">
            <h2>Our Privacy Approach</h2>
            <div className="approach-grid">
              <div className="approach-item">
                <span className="approach-icon">🎯</span>
                <div>
                  <h4>Minimal Collection</h4>
                  <p>Only what's needed for your ad campaign</p>
                </div>
              </div>
              <div className="approach-item">
                <span className="approach-icon">🚫</span>
                <div>
                  <h4>No Tracking</h4>
                  <p>No analytics, cookies, or user profiling</p>
                </div>
              </div>
              <div className="approach-item">
                <span className="approach-icon">💾</span>
                <div>
                  <h4>Local Storage</h4>
                  <p>Your data stays in your browser</p>
                </div>
              </div>
              <div className="approach-item">
                <span className="approach-icon">👁️</span>
                <div>
                  <h4>Transparent</h4>
                  <p>Clear about what we do and don't do</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="privacy-footer">
          <p>Simple advertising, simple privacy.</p>
          <div className="footer-links">
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact Us</a>
            <a href="/">Return to Home</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;