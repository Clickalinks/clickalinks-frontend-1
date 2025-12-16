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

        <div className="privacy-intro">
          <h2>About ClickaLinks</h2>
          <p>
            <strong>ClickaLinks</strong> is an advertising platform that connects businesses with customers looking for great deals. 
            We provide an affordable way for businesses of all sizes to showcase their offers on our advertising grid, 
            helping customers easily discover genuine savings. Our mission is to make finding real deals simple by giving 
            businesses an affordable way to advertise their everyday deals and helping customers discover savings all year round.
          </p>
        </div>

        <div className="privacy-body">
          <section className="policy-section">
            <h2>1. Information We Collect</h2>
            <p>
              We only collect information that's necessary to display your advertising campaign and process your purchase. 
              We do not require user accounts or login credentials to use our platform.
            </p>
            
            <div className="info-category">
              <h3>Campaign Information</h3>
              <ul>
                <li><strong>Business Details:</strong> Business name, contact email address, website URL</li>
                <li><strong>Advertising Content:</strong> Business logo image (stored securely in Firebase Storage)</li>
                <li><strong>Campaign Settings:</strong> Selected advertising square number, campaign duration, payment amount</li>
                <li><strong>Payment Information:</strong> Transaction ID, payment status, purchase date (processed securely through Stripe)</li>
              </ul>
            </div>

            <div className="info-category">
              <h3>Click Analytics</h3>
              <p>
                When visitors click on your advertising square, we collect minimal analytics data to help you understand 
                the performance of your campaign:
              </p>
              <ul>
                <li>Square number that was clicked</li>
                <li>Business name associated with the square</li>
                <li>Website URL that was opened</li>
                <li>Page number where the click occurred</li>
                <li>Timestamp of the click</li>
                <li>Basic browser information (user agent, referrer) - limited to 200 characters</li>
              </ul>
            </div>

            <div className="transparency-note">
              <strong>Note:</strong> We do NOT collect personal identification information beyond your business contact email. 
              We do NOT create user accounts, track individual browsing behavior, or use third-party analytics services. 
              Payment processing is handled securely through Stripe, and we do not store credit card information.
            </div>
          </section>

          <section className="policy-section">
            <h2>2. How We Use Your Information</h2>
            <p>
              Your information is used solely for the purpose of operating our advertising platform and providing you with 
              the services you've purchased. Here's how we use your data:
            </p>
            <div className="usage-grid">
              <div className="usage-item">
                <div className="usage-icon">🖼️</div>
                <div>
                  <h4>Display Your Advertisement</h4>
                  <p>Show your business logo and link on the advertising grid for the duration of your campaign</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">⏰</div>
                <div>
                  <h4>Manage Campaign Duration</h4>
                  <p>Track and manage your campaign's active period, automatically removing your ad when it expires</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">🔄</div>
                <div>
                  <h4>Square Rotation & Fair Display</h4>
                  <p>Include your ad in our automatic shuffling system to ensure fair rotation and equal visibility</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">📊</div>
                <div>
                  <h4>Campaign Analytics</h4>
                  <p>Track clicks on your advertising square to provide you with performance metrics</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">📧</div>
                <div>
                  <h4>Communication</h4>
                  <p>Send you confirmation emails when your campaign goes live and invoice information</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">💳</div>
                <div>
                  <h4>Payment Processing</h4>
                  <p>Process your payment securely through Stripe and maintain transaction records</p>
                </div>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>3. Data Storage</h2>
            <p>
              Your campaign data is stored securely to ensure your advertisements display correctly and your information 
              is protected. We use industry-standard cloud storage services:
            </p>
            <div className="storage-info">
              <div className="storage-item">
                <h3>☁️ Firebase Firestore (Cloud Database)</h3>
                <p>Your campaign information is stored in Firebase Firestore, a secure cloud database. This includes:</p>
                <ul>
                  <li>Business name, contact email, and website URL</li>
                  <li>Campaign settings (square number, duration, amount)</li>
                  <li>Payment and transaction information</li>
                  <li>Campaign status and expiration dates</li>
                  <li>Click analytics data</li>
                </ul>
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  <strong>Why:</strong> Cloud storage ensures your advertisement displays correctly for all visitors, 
                  not just on your device. It also allows us to manage campaign expiration and rotation automatically.
                </p>
              </div>
              <div className="storage-item" style={{ marginTop: '20px' }}>
                <h3>🖼️ Firebase Storage (Image Hosting)</h3>
                <p>Your business logo is stored in Firebase Storage, a secure cloud storage service:</p>
                <ul>
                  <li>Logo images are stored securely in the cloud</li>
                  <li>Images are optimized for fast loading</li>
                  <li>Access is restricted to authorized display only</li>
                </ul>
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  <strong>Why:</strong> Cloud storage ensures your logo displays reliably for all visitors and provides 
                  fast loading times.
                </p>
              </div>
              <div className="storage-item" style={{ marginTop: '20px' }}>
                <h3>💾 Browser Local Storage (Temporary Cache)</h3>
                <p>Some data may be temporarily cached in your browser's local storage for performance:</p>
                <ul>
                  <li>Used to improve page loading speed</li>
                  <li>Can be cleared at any time through your browser settings</li>
                  <li>Does not affect your campaign's display to other visitors</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="policy-section">
            <h2>4. Data Control & Your Rights</h2>
            <p>
              You have control over your data and can request changes or removal at any time:
            </p>
            <div className="control-points">
              <div className="control-item">
                <strong>View Your Campaign:</strong> Your advertisement is publicly visible on the advertising grid during your campaign period
              </div>
              <div className="control-item">
                <strong>Request Data Removal:</strong> Contact us at support@clickalinks.com to request removal of your campaign data (note: this will remove your advertisement from the grid)
              </div>
              <div className="control-item">
                <strong>Automatic Expiry:</strong> Your advertisement automatically stops displaying after your selected campaign duration expires
              </div>
              <div className="control-item">
                <strong>Update Information:</strong> Contact us if you need to update your business information or campaign details
              </div>
              <div className="control-item">
                <strong>Access Your Data:</strong> Request a copy of the data we hold about your campaign by contacting support@clickalinks.com
              </div>
              <div className="control-item">
                <strong>No User Accounts:</strong> No login required to use our platform - purchase and go live immediately
              </div>
            </div>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              <strong>Note:</strong> If you request data removal while your campaign is active, your advertisement will be 
              removed from the grid. We may retain transaction records for accounting and legal compliance purposes, but 
              will remove all advertising content and personal information.
            </p>
          </section>

          <section className="policy-section">
            <h2>5. Data Sharing & Third-Party Services</h2>
            <p>
              We are committed to protecting your privacy. Here's how we handle data sharing:
            </p>
            <div className="info-category">
              <h3>What We Don't Share</h3>
              <ul>
                <li>We do NOT sell your data to third parties</li>
                <li>We do NOT share your information with data brokers</li>
                <li>We do NOT use your data for marketing purposes beyond our platform</li>
                <li>We do NOT share your contact information with other businesses</li>
              </ul>
            </div>
            <div className="info-category" style={{ marginTop: '20px' }}>
              <h3>Third-Party Services We Use</h3>
              <p>We use the following trusted third-party services to operate our platform:</p>
              <ul>
                <li>
                  <strong>Firebase (Google):</strong> For secure cloud storage of your campaign data and logo images. 
                  Firebase is a Google service with industry-standard security and privacy practices. 
                  <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', marginLeft: '5px' }}>Learn more</a>
                </li>
                <li>
                  <strong>Stripe:</strong> For secure payment processing. Stripe handles all payment transactions and 
                  does not share your payment information with us. We only receive transaction confirmations.
                  <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', marginLeft: '5px' }}>Learn more</a>
                </li>
                <li>
                  <strong>Email Service Providers:</strong> We use email services (SMTP/SendGrid) to send you confirmation 
                  emails and invoices. These services only process emails and do not store your data.
                </li>
              </ul>
            </div>
            <div className="transparency-note" style={{ marginTop: '20px' }}>
              <strong>Important:</strong> Your business name, logo, and website link are publicly displayed on our 
              advertising grid as part of the service you've purchased. This is necessary for your advertisement to function.
            </div>
          </section>

          <section className="policy-section">
            <h2>6. Contact & Questions</h2>
            <div className="contact-info">
              <p>If you have questions about your data or privacy, we're happy to help.</p>
              <div className="contact-details">
                <p><strong>Email:</strong> <a href="mailto:support@clickalinks.com" style={{ color: '#667eea', textDecoration: 'none' }}>support@clickalinks.com</a></p>
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>We typically reply within 24 hours during business days.</p>
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

          <section className="policy-section" style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e2e8f0'}}>
            <h2>Company Information</h2>
            <div className="contact-info">
              <p>
                <strong>Clicado Media UK Ltd</strong> is an advertisement company registered in England and Wales, registration number is 16904433.
              </p>
              <p style={{marginTop: '0.5rem'}}>
                <strong>Clicado Media UK Ltd</strong> trading as <strong>clickalinks.com</strong>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;