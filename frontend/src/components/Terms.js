import React from 'react';
import './Terms.css';  // Fixed import - should be Terms.css, not About.css

const Terms = () => {
  return (
    <div>
      {/* Main Content */}
      <div className="terms-container">
        <div className="terms-content">
          <h1>📄 Terms & Conditions</h1>
          <p className="last-updated">Last Updated: December 2025</p>
          
          <div className="terms-section">
            <h2>✅ 1. Agreement to Terms</h2>
            <p>By using CLICKaLINKS services, you agree to these terms. We reserve the right to modify these terms at any time.</p>
          </div>
          
          <div className="terms-section">
            <h2>🔧 2. Service Description</h2>
            <p>CLICKaLINKS provides grid-based advertising space where businesses can purchase squares to display their logos and link to their deals/discount pages.</p>
            <p><strong>Service Includes:</strong></p>
            <ul className="terms-list">
              <li>✅ 2000 advertising squares across 10 pages</li>
              <li>✅ Direct click-through to your website/deals</li>
              <li>✅ Automatic square shuffling for fair visibility</li>
              <li>✅ Secure payment processing</li>
            </ul>
          </div>
          
          <div className="terms-section">
            <h2>📝 3. Advertising Guidelines</h2>
            <p><strong>Allowed Content:</strong></p>
            <ul className="terms-list">
              <li>✅ Legitimate business logos and branding</li>
              <li>✅ Links to genuine deals, discounts, or product pages</li>
              <li>✅ Family-friendly business content</li>
            </ul>
            <p><strong>Prohibited Content:</strong></p>
            <ul className="terms-list">
              <li>❌ Adult, explicit, or offensive material</li>
              <li>❌ Illegal products or services</li>
              <li>❌ Misleading or fraudulent content</li>
              <li>❌ Copyright-infringing material</li>
              <li>❌ Hate speech or discriminatory content</li>
            </ul>
          </div>
          
          <div className="terms-section">
            <h2>💳 4. Pricing & Payments</h2>
            <p><strong>Pricing Structure:</strong></p>
            <ul className="terms-list">
              <li>• 10-day campaign: £10 (£1/day)</li>
              <li>• 20-day campaign: £20 (£1/day)</li>
              <li>• 30-day campaign: £30 (£1/day)</li>
            </ul>
            <p>All payments are processed securely through Stripe. Campaigns begin immediately upon successful payment.</p>
          </div>
          
          <div className="terms-section">
            <h2>🔄 5. Refund & Cancellation Policy</h2>
            <p>Due to the immediate nature of our service, we do not offer refunds once a campaign has started. Please ensure you:</p>
            <ul className="terms-list">
              <li>✅ Select the correct campaign duration</li>
              <li>✅ Upload the appropriate logo</li>
              <li>✅ Provide the correct destination URL</li>
            </ul>
          </div>
          
          <div className="terms-section">
            <h2>⏰ 6. Campaign Duration & Shuffling</h2>
            <p>• Campaigns run for exact duration selected (10/20/30 days)</p>
            <p>• Squares automatically shuffle every 2 hours for fair exposure</p>
            <p>• No manual position requests are accepted</p>
          </div>
          
          <div className="terms-section">
            <h2>👁️ 7. Content Moderation Rights</h2>
            <p>CLICKaLINKS reserves the right to:</p>
            <ul className="terms-list">
              <li>• Remove any content violating our guidelines</li>
              <li>• Suspend accounts for terms violations</li>
              <li>• Make final decisions on content appropriateness</li>
            </ul>
            <p>No refunds provided for removed content due to policy violations.</p>
          </div>
          
          <div className="terms-section">
            <h2>🛡️ 8. Limitation of Liability</h2>
            <p>CLICKaLINKS is not responsible for:</p>
            <ul className="terms-list">
              <li>• Business outcomes or sales from advertising</li>
              <li>• Technical issues with advertiser websites</li>
              <li>• Click fraud or invalid traffic</li>
              <li>• Third-party payment processor issues</li>
            </ul>
          </div>
          
          <div className="terms-section">
            <h2>📞 9. Contact & Support</h2>
            <p>For questions about these terms or our service:</p>
            <p>📧 Email: <a href="mailto:support@clickalinks.com" className="contact-link">support@clickalinks.com</a></p>
            <p>Response time: Within 24 hours during business days</p>
          </div>
          
          <div className="terms-section" style={{marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e2e8f0'}}>
            <h2>🏢 Company Information</h2>
            <p>
              <strong>Clicado Media UK Ltd</strong> is an advertisement company registered in England and Wales, registration number is 16904433.
            </p>
            <p style={{marginTop: '0.5rem'}}>
              <strong>Clicado Media UK Ltd</strong> trading as <strong>clickalinks.com</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;