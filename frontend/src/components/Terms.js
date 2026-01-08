import React from 'react';
import SEO from './SEO';
import './Terms.css';  // Fixed import - should be Terms.css, not About.css

const Terms = () => {
  return (
    <>
      <SEO
        title="Terms & Conditions - CLICKaLINKS Advertising Platform"
        description="Read CLICKaLINKS terms and conditions. Learn about our advertising guidelines, pricing, refund policy, campaign duration, content moderation, and service terms. UK-based advertising platform terms."
        keywords="terms and conditions, advertising terms, service terms, clickalinks terms, UK advertising terms, business terms, legal terms"
      />
      <div>
      {/* Main Content */}
      <div className="terms-container">
        <div className="terms-content">
          <h1>📄 Terms & Conditions</h1>
          <p className="last-updated">Last Updated: January 2026</p>
          
          <div className="terms-section">
            <h2>✅ 1. Agreement to Terms</h2>
            <p>By accessing and using CLICKaLINKS ("the Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the Service.</p>
            <p><strong>Modifications:</strong> We reserve the right to modify these terms at any time. Material changes will be notified by updating the "Last Updated" date. Your continued use of the Service after changes constitutes acceptance of the modified terms.</p>
            <p><strong>Eligibility:</strong> You must be at least 18 years old and have the legal capacity to enter into contracts to use this Service. By using the Service, you represent and warrant that you meet these requirements.</p>
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
              <li>• 60-day campaign: £60 (£1/day)</li>
            </ul>
            <p><strong>Currency:</strong> All prices are displayed in British Pounds (GBP). Prices include applicable VAT where required by UK law.</p>
            <p><strong>Payment Processing:</strong> All payments are processed securely through Stripe. We do not store or have access to your full payment card details. Stripe handles all payment data in compliance with PCI DSS standards.</p>
            <p><strong>Payment Authorization:</strong> By providing payment information, you authorize us to charge the full amount for your selected campaign duration. Payments are required in advance and are non-refundable except as specified in Section 5.</p>
            <p><strong>Campaign Activation:</strong> Campaigns begin immediately upon successful payment confirmation. The campaign duration is calculated from the moment payment is confirmed.</p>
            <p><strong>Failed Payments:</strong> If payment fails, your campaign will not be activated. You will be notified and can attempt payment again. We reserve the right to refuse service in cases of repeated payment failures.</p>
          </div>
          
          <div className="terms-section">
            <h2>🔄 5. Refund & Cancellation Policy</h2>
            <p>Due to the immediate and automated nature of our service, refunds are generally not available once a campaign has started. However, we handle refunds on a case-by-case basis for exceptional circumstances such as:</p>
            <ul className="terms-list">
              <li>Technical issues preventing your advertisement from displaying</li>
              <li>Duplicate payments or billing errors</li>
              <li>Unforeseen circumstances beyond your control</li>
            </ul>
            <p>To request a refund, please contact support@clickalinks.com with your transaction ID and a detailed explanation. Please ensure you:</p>
            <ul className="terms-list">
              <li>✅ Select the correct campaign duration</li>
              <li>✅ Upload the appropriate logo (JPG, PNG, or GIF format, under 5MB)</li>
              <li>✅ Provide the correct destination URL (HTTPS required)</li>
              <li>✅ Verify all business information before completing payment</li>
            </ul>
          </div>
          
          <div className="terms-section">
            <h2>⏰ 6. Campaign Duration & Shuffling</h2>
            <p>• Campaigns run for the exact duration selected (10, 20, 30, or 60 days)</p>
            <p>• Squares automatically shuffle every 2 hours to ensure fair exposure for all advertisers</p>
            <p>• No manual position requests are accepted - all positions are assigned randomly through our fair shuffle system</p>
            <p>• Your advertisement may appear on different pages throughout your campaign to maximize visibility</p>
          </div>
          
          <div className="terms-section">
            <h2>👁️ 7. Content Moderation Rights</h2>
            <p>CLICKaLINKS reserves the right to:</p>
            <ul className="terms-list">
              <li>• Review, reject, or remove any content at our sole discretion</li>
              <li>• Remove any content violating our guidelines without prior notice</li>
              <li>• Suspend or terminate campaigns for terms violations</li>
              <li>• Make final decisions on content appropriateness</li>
              <li>• Refuse service to any business for any reason</li>
              <li>• Require changes to logos or content before approval</li>
            </ul>
            <p><strong>No Refunds:</strong> No refunds will be provided for campaigns removed due to policy violations. This includes but is not limited to: prohibited content, misleading information, copyright infringement, or any breach of these terms.</p>
            <p><strong>Content Standards:</strong> All content must comply with UK advertising standards and regulations, including the Advertising Standards Authority (ASA) codes. We reserve the right to reject content that may violate UK law or advertising standards.</p>
          </div>
          
          <div className="terms-section">
            <h2>📋 8. User Responsibilities & Warranties</h2>
            <p><strong>By using our Service, you warrant and represent that:</strong></p>
            <ul className="terms-list">
              <li>• You have the legal right and authority to advertise the business/product</li>
              <li>• All information provided is accurate, current, and complete</li>
              <li>• You own or have proper authorization to use any logos, images, or content submitted</li>
              <li>• Your content does not infringe any third-party rights (copyright, trademark, etc.)</li>
              <li>• Your destination website is functional, secure (HTTPS), and compliant with applicable laws</li>
              <li>• You will not engage in any fraudulent, deceptive, or illegal practices</li>
              <li>• You will not attempt to manipulate click statistics or system performance</li>
            </ul>
            <p><strong>Indemnification:</strong> You agree to indemnify, defend, and hold harmless Clicado Media UK Ltd, its directors, employees, and affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, your content, or any breach of these terms.</p>
          </div>
          
          <div className="terms-section">
            <h2>⚖️ 9. Intellectual Property Rights</h2>
            <p><strong>Platform Ownership:</strong> The CLICKaLINKS platform, including its design, functionality, and all intellectual property rights, are owned by Clicado Media UK Ltd or its licensors. You may not copy, modify, distribute, or create derivative works based on our platform.</p>
            <p><strong>Your Content:</strong> You retain ownership of your business logos, images, and content submitted to us. However, by submitting content, you grant Clicado Media UK Ltd a non-exclusive, worldwide, royalty-free license to:</p>
            <ul className="terms-list">
              <li>• Display your content on our advertising grid</li>
              <li>• Store and process your content to provide the Service</li>
              <li>• Use your content for promotional purposes related to CLICKaLINKS (with your permission)</li>
            </ul>
            <p><strong>Trademarks:</strong> CLICKaLINKS, Clicado Media UK Ltd, and related marks are trademarks of Clicado Media UK Ltd. You may not use our trademarks without prior written consent.</p>
          </div>
          
          <div className="terms-section">
            <h2>🛡️ 10. Limitation of Liability & Disclaimers</h2>
            <p><strong>Service Availability:</strong> While we strive to maintain high service availability, we do not guarantee that the Service will be uninterrupted, error-free, or available at all times. We may perform maintenance, updates, or experience technical issues that temporarily affect service availability.</p>
            <p><strong>CLICKaLINKS is not responsible for:</strong></p>
            <ul className="terms-list">
              <li>• Business outcomes, sales, or revenue generated from advertising</li>
              <li>• Technical issues with advertiser websites or third-party services</li>
              <li>• Click fraud, invalid traffic, or automated clicks</li>
              <li>• Third-party payment processor issues or delays</li>
              <li>• Loss of data or content due to technical failures</li>
              <li>• Indirect, incidental, or consequential damages</li>
              <li>• Loss of profits, business opportunities, or goodwill</li>
            </ul>
            <p><strong>Maximum Liability:</strong> Our total liability to you for any claims arising from the Service shall not exceed the total amount you paid for your campaign in the 12 months preceding the claim.</p>
            <p><strong>Exclusions:</strong> Nothing in these terms excludes or limits our liability for death or personal injury caused by negligence, fraud, or any other liability that cannot be excluded by law.</p>
          </div>
          
          <div className="terms-section">
            <h2>⏸️ 11. Service Availability & Termination</h2>
            <p><strong>Service Availability:</strong> We strive to provide 99% uptime but do not guarantee continuous, uninterrupted access. Scheduled maintenance will be performed during low-traffic periods when possible.</p>
            <p><strong>Termination by You:</strong> You may stop using the Service at any time. However, paid campaign fees are non-refundable except as specified in our Refund Policy.</p>
            <p><strong>Termination by Us:</strong> We reserve the right to suspend or terminate your access to the Service immediately, without notice, if:</p>
            <ul className="terms-list">
              <li>• You breach these Terms and Conditions</li>
              <li>• Your content violates our guidelines or applicable laws</li>
              <li>• You engage in fraudulent or illegal activity</li>
              <li>• Required by law or regulatory authority</li>
              <li>• For any other reason at our sole discretion</li>
            </ul>
            <p><strong>Effect of Termination:</strong> Upon termination, your campaigns will be removed, and you will lose access to the Service. Data may be retained as required by law or for dispute resolution purposes.</p>
          </div>
          
          <div className="terms-section">
            <h2>🌍 12. Force Majeure</h2>
            <p>We shall not be liable for any failure or delay in performance under these terms due to circumstances beyond our reasonable control, including but not limited to: acts of God, natural disasters, war, terrorism, cyber attacks, internet failures, government actions, pandemics, or any other event that prevents us from providing the Service.</p>
          </div>
          
          <div className="terms-section">
            <h2>📞 13. Contact & Support</h2>
            <p>For questions about these terms or our service:</p>
            <p><strong>📧 Email:</strong> <a href="mailto:support@clickalinks.com" className="contact-link">support@clickalinks.com</a></p>
            <p><strong>Response time:</strong> Within 24 hours during business days (Monday-Friday, 9 AM - 5 PM GMT)</p>
            <p><strong>Support hours:</strong> Monday through Friday, 9 AM to 5 PM GMT</p>
            <p><strong>Complaints:</strong> If you have a complaint about our Service, please contact us at the email above. We will investigate and respond within 14 business days.</p>
          </div>
          
          <div className="terms-section">
            <h2>⚖️ 14. Dispute Resolution & Governing Law</h2>
            <p><strong>Governing Law:</strong> These Terms and Conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
            <p><strong>Dispute Resolution:</strong> If you have a dispute with us, we encourage you to contact us first to resolve it amicably. If we cannot resolve the dispute within 30 days, either party may initiate legal proceedings.</p>
            <p><strong>Consumer Rights:</strong> If you are a consumer based in the UK or EU, nothing in these terms affects your statutory rights under consumer protection laws. You may have additional rights that cannot be excluded by contract.</p>
            <p><strong>Alternative Dispute Resolution:</strong> As a UK-based business, we are committed to resolving disputes fairly. If you are a consumer, you may be entitled to use an alternative dispute resolution service. Contact us for more information.</p>
          </div>
          
          <div className="terms-section">
            <h2>📄 15. General Provisions</h2>
            <p><strong>Entire Agreement:</strong> These Terms and Conditions, together with our Privacy Policy, constitute the entire agreement between you and Clicado Media UK Ltd regarding the Service.</p>
            <p><strong>Severability:</strong> If any provision of these terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
            <p><strong>Waiver:</strong> Our failure to enforce any right or provision of these terms does not constitute a waiver of that right or provision.</p>
            <p><strong>Assignment:</strong> You may not assign or transfer your rights or obligations under these terms without our prior written consent. We may assign our rights and obligations to any third party without notice.</p>
            <p><strong>Notices:</strong> Any notices required under these terms must be sent to support@clickalinks.com. We will send notices to the email address you provide when using the Service.</p>
            <p><strong>Third-Party Rights:</strong> These terms do not create any rights for third parties except where explicitly stated.</p>
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
    </>
  );
};

export default Terms;