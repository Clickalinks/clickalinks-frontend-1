import React from 'react';
import SEO from './SEO';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <>
      <SEO
        title="Privacy Policy - CLICKaLINKS Data Protection & Privacy"
        description="Read CLICKaLINKS privacy policy. Learn how we collect, store, and protect your data. Transparent data practices, no user tracking, secure cloud storage. GDPR compliant privacy policy for UK-based advertising platform."
        keywords="privacy policy, data protection, GDPR, privacy, data security, clickalinks privacy, advertising privacy, UK privacy policy, data protection UK"
      />
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
            <h2>4. Legal Basis for Processing (GDPR)</h2>
            <p>Under the UK GDPR and EU GDPR, we process your personal data based on the following legal bases:</p>
            <ul>
              <li><strong>Contract Performance:</strong> Processing necessary to fulfill our contract with you (displaying your advertisement, processing payments)</li>
              <li><strong>Legitimate Interests:</strong> Processing for our legitimate business interests (analytics, service improvement, fraud prevention)</li>
              <li><strong>Legal Obligation:</strong> Processing required by law (accounting records, tax compliance)</li>
              <li><strong>Consent:</strong> Where applicable, we obtain explicit consent for specific data processing activities</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Your Data Protection Rights (GDPR)</h2>
            <p>As a data subject under UK GDPR and EU GDPR, you have the following rights regarding your personal data:</p>
            <div className="rights-grid">
              <div className="right-item">
                <h4>Right to Access</h4>
                <p>Request a copy of all personal data we hold about you in a structured, commonly used format</p>
              </div>
              <div className="right-item">
                <h4>Right to Rectification</h4>
                <p>Request correction of inaccurate or incomplete personal data we hold about you</p>
              </div>
              <div className="right-item">
                <h4>Right to Erasure ("Right to be Forgotten")</h4>
                <p>Request deletion of your personal data where there is no compelling reason for continued processing</p>
              </div>
              <div className="right-item">
                <h4>Right to Restrict Processing</h4>
                <p>Request restriction of processing of your personal data in certain circumstances</p>
              </div>
              <div className="right-item">
                <h4>Right to Data Portability</h4>
                <p>Receive your personal data in a structured, machine-readable format and transfer it to another service</p>
              </div>
              <div className="right-item">
                <h4>Right to Object</h4>
                <p>Object to processing of your personal data based on legitimate interests or for direct marketing</p>
              </div>
              <div className="right-item">
                <h4>Right to Withdraw Consent</h4>
                <p>Withdraw consent at any time where processing is based on consent (this does not affect lawfulness of processing before withdrawal)</p>
              </div>
              <div className="right-item">
                <h4>Right to Lodge a Complaint</h4>
                <p>Lodge a complaint with the UK Information Commissioner's Office (ICO) if you believe your data protection rights have been violated</p>
              </div>
            </div>
            <div className="transparency-note" style={{ marginTop: '20px' }}>
              <strong>Exercising Your Rights:</strong> To exercise any of these rights, please contact us at support@clickalinks.com. 
              We will respond to your request within one month (extendable to two months for complex requests). 
              We may require proof of identity before processing your request.
            </div>
          </section>

          <section className="policy-section">
            <h2>6. Data Retention</h2>
            <p>We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy:</p>
            <div className="info-category">
              <h3>Campaign Data</h3>
              <ul>
                <li><strong>Active Campaigns:</strong> Retained for the duration of your campaign</li>
                <li><strong>Expired Campaigns:</strong> Advertising content removed immediately after campaign expiry; transaction data retained for 7 years for accounting and legal compliance</li>
                <li><strong>Logo Images:</strong> Removed from active storage after campaign expiry; may be retained in backup systems for up to 90 days</li>
              </ul>
            </div>
            <div className="info-category" style={{ marginTop: '20px' }}>
              <h3>Analytics Data</h3>
              <ul>
                <li><strong>Click Analytics:</strong> Retained for 24 months for campaign performance analysis, then anonymized or deleted</li>
                <li><strong>Transaction Records:</strong> Retained for 7 years as required by UK tax and accounting law</li>
              </ul>
            </div>
            <div className="info-category" style={{ marginTop: '20px' }}>
              <h3>Communication Records</h3>
              <ul>
                <li><strong>Email Correspondence:</strong> Retained for 3 years for customer service and dispute resolution purposes</li>
                <li><strong>Support Requests:</strong> Retained for 2 years after resolution</li>
              </ul>
            </div>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              <strong>Note:</strong> Some data may be retained longer if required by law, regulation, or for legal claims. 
              We will securely delete or anonymize data at the end of the retention period.
            </p>
          </section>

          <section className="policy-section">
            <h2>7. Data Security Measures</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, loss, destruction, or alteration:</p>
            <div className="usage-grid">
              <div className="usage-item">
                <div className="usage-icon">🔐</div>
                <div>
                  <h4>Encryption</h4>
                  <p>All data transmissions are encrypted using SSL/TLS. Data at rest in Firebase is encrypted</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">🛡️</div>
                <div>
                  <h4>Access Controls</h4>
                  <p>Strict access controls limit data access to authorized personnel only on a need-to-know basis</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">☁️</div>
                <div>
                  <h4>Secure Cloud Storage</h4>
                  <p>Firebase (Google Cloud) provides enterprise-grade security with regular security audits and compliance certifications</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">🔒</div>
                <div>
                  <h4>Payment Security</h4>
                  <p>Payment processing handled by Stripe (PCI DSS Level 1 compliant) - we never store payment card details</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">🔍</div>
                <div>
                  <h4>Regular Monitoring</h4>
                  <p>Continuous monitoring for security threats, unauthorized access, and suspicious activity</p>
                </div>
              </div>
              <div className="usage-item">
                <div className="usage-icon">📋</div>
                <div>
                  <h4>Data Minimization</h4>
                  <p>We collect and process only the minimum amount of data necessary to provide our Service</p>
                </div>
              </div>
            </div>
            <div className="transparency-note" style={{ marginTop: '20px' }}>
              <strong>Data Breach Notification:</strong> In the unlikely event of a data breach that may affect your personal data, 
              we will notify you and the relevant supervisory authority (ICO) within 72 hours as required by GDPR, 
              unless the breach is unlikely to result in a risk to your rights and freedoms.
            </div>
          </section>

          <section className="policy-section">
            <h2>8. Cookies & Tracking Technologies</h2>
            <p>We use minimal tracking technologies to provide and improve our Service:</p>
            <div className="info-category">
              <h3>Essential Cookies (Strictly Necessary)</h3>
              <ul>
                <li><strong>Session Storage:</strong> Temporary storage for campaign purchase progress (cleared when browser session ends)</li>
                <li><strong>Local Storage:</strong> Used to cache your welcome modal preference (dismissal status)</li>
              </ul>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                These are necessary for the Service to function and cannot be disabled. They do not contain personal information 
                and are used only for technical functionality.
              </p>
            </div>
            <div className="info-category" style={{ marginTop: '20px' }}>
              <h3>What We Don't Use</h3>
              <ul>
                <li>❌ Third-party analytics cookies (Google Analytics, etc.)</li>
                <li>❌ Advertising/tracking cookies</li>
                <li>❌ Social media tracking pixels</li>
                <li>❌ Cross-site tracking technologies</li>
                <li>❌ Behavioral profiling cookies</li>
              </ul>
            </div>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              <strong>Managing Storage:</strong> You can clear cookies and local storage at any time through your browser settings. 
              This will not affect your active campaigns but may reset certain preferences (e.g., welcome modal will show again).
            </p>
          </section>

          <section className="policy-section">
            <h2>9. International Data Transfers</h2>
            <p>Your data may be stored and processed outside the UK/EEA:</p>
            <div className="info-category">
              <h3>Data Location</h3>
              <ul>
                <li><strong>Firebase (Google Cloud):</strong> Data is primarily stored in EU/UK data centers, but may be processed in the United States by Google</li>
                <li><strong>Stripe:</strong> Payment data is processed in accordance with Stripe's data processing terms, primarily in the EU/US</li>
              </ul>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                <strong>Safeguards:</strong> International transfers are protected by appropriate safeguards:
              </p>
              <ul style={{ marginTop: '10px' }}>
                <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                <li>Adequacy decisions where applicable</li>
                <li>Service providers' compliance with GDPR and UK GDPR requirements</li>
              </ul>
            </div>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              By using our Service, you consent to the transfer of your data as described above. 
              We ensure all international transfers comply with applicable data protection laws.
            </p>
          </section>

          <section className="policy-section">
            <h2>10. Children's Privacy</h2>
            <p>Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal data from children.</p>
            <p>If we become aware that we have collected personal data from a child under 18 without parental consent, we will take steps to delete that information immediately.</p>
            <p>If you are a parent or guardian and believe your child has provided us with personal data, please contact us at support@clickalinks.com.</p>
          </section>

          <section className="policy-section">
            <h2>11. Data Control & Your Rights</h2>
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
            <h2>12. Data Sharing & Third-Party Services</h2>
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
            <h2>13. Supervisory Authority</h2>
            <p>If you are based in the UK or EU and believe we have not adequately addressed your data protection concerns, you have the right to lodge a complaint with your local data protection authority:</p>
            <div className="info-category">
              <h3>UK Information Commissioner's Office (ICO)</h3>
              <ul>
                <li><strong>Website:</strong> <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>ico.org.uk</a></li>
                <li><strong>Phone:</strong> 0303 123 1113</li>
                <li><strong>Address:</strong> Information Commissioner's Office, Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF</li>
              </ul>
              <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                For EU residents, you may contact your local data protection authority. 
                A list of EU data protection authorities is available at: 
                <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', marginLeft: '5px' }}>edpb.europa.eu</a>
              </p>
            </div>
          </section>

          <section className="policy-section">
            <h2>14. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.</p>
            <p><strong>Material Changes:</strong> If we make material changes to how we process your personal data, we will:</p>
            <ul>
              <li>Update the "Last Updated" date at the top of this policy</li>
              <li>Notify you by email if you have an active campaign or recent contact with us</li>
              <li>Provide a summary of material changes on our website</li>
            </ul>
            <p><strong>Review:</strong> We encourage you to review this Privacy Policy periodically to stay informed about how we protect your data.</p>
            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
              <strong>Continued Use:</strong> Your continued use of the Service after changes to this Privacy Policy constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="policy-section">
            <h2>15. Contact & Questions</h2>
            <div className="contact-info">
              <p>If you have questions about your data or privacy, or wish to exercise your data protection rights, we're happy to help.</p>
              <div className="contact-details">
                <p><strong>Email:</strong> <a href="mailto:support@clickalinks.com" style={{ color: '#667eea', textDecoration: 'none' }}>support@clickalinks.com</a></p>
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>We typically reply within 24 hours during business days (Monday-Friday, 9 AM - 5 PM GMT).</p>
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  <strong>Data Protection Officer:</strong> For data protection inquiries, please email support@clickalinks.com with "Data Protection" in the subject line.
                </p>
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
                  <h4>No User Tracking</h4>
                  <p>No user accounts, cookies, or personal profiling</p>
                </div>
              </div>
              <div className="approach-item">
                <span className="approach-icon">💾</span>
                <div>
                  <h4>Secure Storage</h4>
                  <p>Cloud storage with industry-standard security</p>
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
    </>
  );
};

export default PrivacyPolicy;