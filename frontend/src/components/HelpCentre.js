import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
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
          q: 'How do I put a game on the grid?',
          a: 'Choose an open square, upload your app icon, paste your App Store or Google Play link, then pick 10, 20, 30 or 60 days and pay. The square goes live when payment is confirmed.'
        },
        {
          q: 'What do I need to provide?',
          a: 'The game or studio name, a contact email, the store link, and the app icon. Players who press Get are sent to that store link.'
        },
        {
          q: 'How long until the game is live?',
          a: 'The square goes live when payment is confirmed. There is no extra review queue on the site.'
        },
        {
          q: 'Can I choose the square?',
          a: 'Yes. Any open square across the 10 pages can be chosen. Tap or click an open square to start.'
        }
      ]
    },
    {
      id: 'pricing-payment',
      title: 'Pricing & Payment',
      icon: '💳',
      questions: [
        {
          q: 'How much does a square cost?',
          a: '£1 per day. A 10-day run is £10, 20 days is £20, 30 days is £30, and 60 days is £60. There is no contract on top of that.'
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
          a: 'You can choose 10, 20, 30, or 60 days. When the time ends, the square comes off the grid. You can buy another run if you want the game to stay.'
        },
        {
          q: 'Can I change the icon or store link after the square is live?',
          a: 'A live square stays as it was purchased, so the grid stays fair. If a store link is wrong, email support@clickalinks.com with the square number and we will help.'
        },
        {
          q: 'How do I know how many clicks my ad is getting?',
          a: 'Get presses are counted. A developer dashboard is not on the site yet. Email support@clickalinks.com if you want the count for your square.'
        },
        {
          q: 'What happens when my campaign expires?',
          a: 'When the days run out, the game leaves the grid and the square can be taken by another game. You should get an email before that happens.'
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
          q: 'My app icon is not showing. What should I do?',
          a: 'Use a JPG, PNG, GIF or WebP under 2MB. A square icon, at least 500 by 500 pixels, fills the square best. If it still fails, email support@clickalinks.com.'
        },
        {
          q: 'I paid and the game is not on the grid. What is wrong?',
          a: 'Refresh the page and check the confirmation email. If the email arrived and the square is still empty, email support@clickalinks.com with the transaction id.'
        },
        {
          q: 'The website is loading slowly. Is this normal?',
          a: 'The grid contains many images, so initial loading may take a moment. If the site continues to load slowly, try clearing your browser cache or using a different browser. If problems persist, let us know at support@clickalinks.com.'
        },
        {
          q: 'I didn\'t receive my confirmation email. What should I do?',
          a: 'Check spam first. If it is still missing, email support@clickalinks.com with the game name and square number and we will resend the confirmation.'
        },
        {
          q: 'Can I use the same email for multiple campaigns?',
          a: 'Yes. The same email can cover more than one game. Each square is its own run.'
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
          a: 'Your logo should be: in JPG, PNG, GIF, or WebP format; under 2MB in size; ideally square (1:1 aspect ratio) for best display; and have a transparent or white background. High-resolution images (at least 500x500 pixels) work best for clear display on the grid.'
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
          a: 'We support JPG, JPEG, PNG, GIF, and WebP formats. PNG files with transparent backgrounds work particularly well for professional-looking advertisements. All files must be under 2MB in size.'
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
          a: 'No account is required. Choose a square, add the game and the store link, and pay. The square goes live when payment is confirmed.'
        },
        {
          q: 'How do I contact support?',
          a: 'You can reach our support team by email at support@clickalinks.com. We typically respond within 24 hours during business days. For urgent matters, please include "URGENT" in your subject line.'
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
    { title: 'Blog', path: '/blog', icon: '📝' },
    { title: 'Contact Support', path: 'mailto:support@clickalinks.com', icon: '📧', external: true },
    { title: 'About Us', path: '/about', icon: 'ℹ️' }
  ];

  return (
    <>
      <SEO
        title="Help Centre | Games and Apps | CLICKaLINKS"
        description="Help for players and developers on CLICKaLINKS. How to open a game, press Get, or place your own game from £1 a day."
        keywords="clickalinks help, place a game, app store link, £1 a day, tap get play"
      />
      <div className="help-centre">
      {/* Hero Section */}
      <div className="help-hero">
        <div className="container">
          <h1>Help Centre</h1>
          <p className="subtitle">Answers for players and for people placing a game</p>
          
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
              link.external ? (
                <a key={index} href={link.path} className="quick-link-card">
                  <span className="quick-link-icon">{link.icon}</span>
                  <span className="quick-link-title">{link.title}</span>
                </a>
              ) : (
                <Link key={index} to={link.path} className="quick-link-card">
                  <span className="quick-link-icon">{link.icon}</span>
                  <span className="quick-link-title">{link.title}</span>
                </Link>
              )
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
              <p>No results found for "{searchQuery}". Try a different search term or <a href="mailto:support@clickalinks.com">contact support</a>.</p>
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
              <a href="mailto:support@clickalinks.com" className="cta-button primary">
                Contact Support
              </a>
              <Link to="/about" className="cta-button secondary">
                Learn More About Us
              </Link>
            </div>
            <p className="support-note">
              📧 support@clickalinks.com • We typically reply within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default HelpCentre;

