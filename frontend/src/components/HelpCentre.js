import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HelpCentre.css';

const HelpCentre = () => {
  const [openSection, setOpenSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      questions: [
        {
          q: 'How do I create an advertising campaign?',
          a: 'Creating a campaign is simple! Just follow these 3 steps: 1) Browse our grid and select an available square, 2) Upload your business logo and enter your business details, 3) Choose your campaign duration and complete payment. Your ad will go live immediately after payment confirmation.'
        },
        {
          q: 'What information do I need to provide?',
          a: 'You\'ll need to provide: your business name, contact email address, website URL (or deal link), and your company logo. That\'s it! No complicated forms or lengthy sign-up process.'
        },
        {
          q: 'How long does it take for my ad to go live?',
          a: 'Your advertisement goes live immediately after your payment is confirmed. There\'s no waiting period - as soon as you complete the checkout process, your ad appears on the grid!'
        },
        {
          q: 'Can I choose which square to advertise on?',
          a: 'Yes! You can browse through all 2000 available squares across 10 pages and select any square that\'s currently available. Simply click on an empty square to start your campaign.'
        }
      ]
    },
    {
      id: 'pricing-payment',
      title: 'Pricing & Payment',
      icon: '💳',
      questions: [
        {
          q: 'How much does it cost to advertise?',
          a: 'Our pricing is simple and transparent: £1 per day. You can choose campaign durations of 10 days (£10), 20 days (£20), 30 days (£30), or 60 days (£60). No hidden fees, no contracts, no surprises.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit and debit cards (Visa, MasterCard, American Express) as well as PayPal. All payments are processed securely through Stripe.'
        },
        {
          q: 'Can I use a promo code?',
          a: 'Yes! If you have a promo code, you can enter it during the payment process. Promo codes can provide discounts or free days on your campaign. Each code can only be used once per user.'
        },
        {
          q: 'Will I receive an invoice?',
          a: 'Yes! After your payment is confirmed, you\'ll receive a confirmation email with your invoice attached as a PDF. This includes all your campaign details and payment information.'
        },
        {
          q: 'What happens if my payment fails?',
          a: 'If your payment fails, your campaign won\'t be activated. Please check your payment details and try again. If the problem persists, contact our support team at support@clickalinks.com.'
        }
      ]
    },
    {
      id: 'campaign-management',
      title: 'Campaign Management',
      icon: '📊',
      questions: [
        {
          q: 'How long can my campaign run?',
          a: 'You can choose from 10, 20, 30, or 60-day campaigns. Your ad will automatically stop displaying when your campaign duration expires. You can always purchase a new campaign to continue advertising.'
        },
        {
          q: 'Can I change my logo or link after my campaign starts?',
          a: 'Currently, changes to active campaigns require purchasing a new campaign. If you need to update your information, please contact support@clickalinks.com and we\'ll help you find the best solution.'
        },
        {
          q: 'How do I know how many clicks my ad is getting?',
          a: 'We track clicks on all advertisements. While detailed analytics aren\'t currently available in your account, you can contact us at support@clickalinks.com to request click statistics for your campaign.'
        },
        {
          q: 'What happens when my campaign expires?',
          a: 'When your campaign expires, your advertisement is automatically removed from the grid. The square becomes available for other businesses to purchase. You\'ll receive an email notification before your campaign expires.'
        },
        {
          q: 'Can I extend my campaign?',
          a: 'Yes! You can purchase a new campaign for the same or different square to extend your advertising. Simply select the square again and complete a new purchase.'
        }
      ]
    },
    {
      id: 'technical-issues',
      title: 'Technical Issues',
      icon: '🔧',
      questions: [
        {
          q: 'My logo isn\'t displaying correctly. What should I do?',
          a: 'Make sure your logo is in a standard image format (JPG, PNG, GIF) and under 5MB. For best results, use a square logo (1:1 aspect ratio) with a transparent or white background. If issues persist, try a different image file.'
        },
        {
          q: 'I can\'t see my ad on the grid after payment. What\'s wrong?',
          a: 'First, try refreshing the page. If your ad still doesn\'t appear, check that your payment was successful by looking for the confirmation email. If you received a confirmation email but don\'t see your ad, contact support@clickalinks.com with your transaction ID.'
        },
        {
          q: 'The website is loading slowly. Is this normal?',
          a: 'The grid contains many images, so initial loading may take a moment. If the site continues to load slowly, try clearing your browser cache or using a different browser. If problems persist, let us know at support@clickalinks.com.'
        },
        {
          q: 'I didn\'t receive my confirmation email. What should I do?',
          a: 'First, check your spam/junk folder. If you still don\'t see it, the email may have been delayed. Contact us at support@clickalinks.com with your business name and square number, and we\'ll resend your confirmation and invoice.'
        },
        {
          q: 'Can I use the same email for multiple campaigns?',
          a: 'Yes, you can use the same email address for multiple campaigns. Each campaign is independent, so you can advertise multiple businesses or run multiple campaigns simultaneously.'
        }
      ]
    },
    {
      id: 'logo-requirements',
      title: 'Logo & Image Requirements',
      icon: '🖼️',
      questions: [
        {
          q: 'What are the logo requirements?',
          a: 'Your logo should be: in JPG, PNG, or GIF format; under 5MB in size; ideally square (1:1 aspect ratio) for best display; and have a transparent or white background. High-resolution images work best.'
        },
        {
          q: 'What size should my logo be?',
          a: 'While there\'s no strict size requirement, we recommend logos that are at least 500x500 pixels for best quality. Square logos (equal width and height) display best on our grid.'
        },
        {
          q: 'Can I use a rectangular logo?',
          a: 'Yes, rectangular logos are accepted, but they will be cropped or scaled to fit the square format. For the best appearance, we recommend using a square logo or creating a square version of your logo.'
        },
        {
          q: 'What file formats are supported?',
          a: 'We support JPG, JPEG, PNG, and GIF formats. PNG files with transparent backgrounds work particularly well for professional-looking advertisements.'
        }
      ]
    },
    {
      id: 'account-support',
      title: 'Account & Support',
      icon: '👤',
      questions: [
        {
          q: 'Do I need to create an account?',
          a: 'No! ClickaLinks doesn\'t require account creation. Simply select a square, provide your business details, and complete payment. Your campaign goes live immediately - no sign-up needed.'
        },
        {
          q: 'How do I contact support?',
          a: 'You can reach our support team by email at support@clickalinks.com. We typically respond within 24 hours during business days. You can also use our contact form on the website.'
        },
        {
          q: 'What are your support hours?',
          a: 'Our support team is available Monday through Friday, 9 AM to 5 PM GMT. We aim to respond to all inquiries within 24 hours, though response times may be longer on weekends.'
        },
        {
          q: 'Can I get a refund?',
          a: 'Refunds are handled on a case-by-case basis. If you experience technical issues or have concerns about your campaign, please contact support@clickalinks.com and we\'ll work with you to find a solution.'
        },
        {
          q: 'How do I report a problem with another advertiser\'s content?',
          a: 'If you notice inappropriate or problematic content on the grid, please email support@clickalinks.com with the square number and a description of the issue. We take content moderation seriously and will investigate promptly.'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(qa => 
      qa.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qa.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const quickLinks = [
    { title: 'Start Your Campaign', path: '/campaign', icon: '🚀' },
    { title: 'How It Works', path: '/how-it-works', icon: '📖' },
    { title: 'Contact Support', path: '/contact', icon: '📧' },
    { title: 'About Us', path: '/about', icon: 'ℹ️' }
  ];

  return (
    <div className="help-centre">
      {/* Hero Section */}
      <div className="help-hero">
        <div className="container">
          <h1>Help Centre</h1>
          <p className="subtitle">Find answers to common questions and get the support you need</p>
          
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="help-search"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links-section">
        <div className="container">
          <h2>Quick Links</h2>
          <div className="quick-links-grid">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.path} className="quick-link-card">
                <span className="quick-link-icon">{link.icon}</span>
                <span className="quick-link-title">{link.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <p className="section-intro">Browse our FAQ categories to find answers to common questions</p>
          
          {filteredCategories.length === 0 && searchQuery ? (
            <div className="no-results">
              <p>No results found for "{searchQuery}". Try a different search term or <Link to="/contact">contact support</Link>.</p>
            </div>
          ) : (
            <div className="faq-categories">
              {filteredCategories.map((category) => (
                <div key={category.id} className="faq-category">
                  <button
                    className="faq-category-header"
                    onClick={() => toggleSection(category.id)}
                  >
                    <div className="category-title-wrapper">
                      <span className="category-icon">{category.icon}</span>
                      <h3>{category.title}</h3>
                    </div>
                    <span className="toggle-icon">
                      {openSection === category.id ? '−' : '+'}
                    </span>
                  </button>
                  
                  {openSection === category.id && (
                    <div className="faq-questions">
                      {category.questions.map((qa, index) => (
                        <div key={index} className="faq-item">
                          <h4 className="faq-question">{qa.q}</h4>
                          <p className="faq-answer">{qa.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="support-cta-section">
        <div className="container">
          <div className="support-cta-card">
            <h2>Still Need Help?</h2>
            <p>Can't find what you're looking for? Our support team is here to help!</p>
            <div className="support-cta-buttons">
              <Link to="/contact" className="cta-button primary">
                Contact Support
              </Link>
              <a href="mailto:support@clickalinks.com" className="cta-button secondary">
                Email Us
              </a>
            </div>
            <p className="support-note">
              📧 support@clickalinks.com • We typically reply within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCentre;

