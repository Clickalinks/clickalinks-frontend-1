import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [isMobile, setIsMobile] = useState(false);
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);
  const quickLinksRef = useRef(null);
  const quickLinks = [
    { label: 'Start your campaign', path: '/campaign' },
    { label: 'How it works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Help centre', path: '/help' }
  ];

  // Detect mobile screen size (NOT tablets - tablets use desktop layout)
  useEffect(() => {
    let resizeTimeout;
    const checkMobile = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const width = window.innerWidth;
        const userAgent = navigator.userAgent;
        
        // Tablets (>= 768px) should use desktop layout
        if (width >= 768) {
          setIsMobile(false);
          return;
        }
        
        // For < 768px, check if it's actually a phone (not tablet)
        const isTablet = /iPad|Android/i.test(userAgent) && width >= 600;
        setIsMobile(!isTablet && width < 768);
      }, 150);
    };
    
    // Initial check
    const width = window.innerWidth;
    const userAgent = navigator.userAgent;
    if (width >= 768) {
      setIsMobile(false);
    } else {
      const isTablet = /iPad|Android/i.test(userAgent) && width >= 600;
      setIsMobile(!isTablet && width < 768);
    }
    
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkMobile, 200);
    });
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Get current active page number
  const getCurrentPage = () => {
    if (location.pathname === '/') return 1;
    const match = location.pathname.match(/\/page(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  // Handle mobile dropdown change
  const handleMobileNavChange = (e) => {
    const selectedPage = parseInt(e.target.value);
    if (selectedPage === 1) {
      navigate('/');
    } else {
      navigate(`/page${selectedPage}`);
    }
  };

  const toggleQuickLinks = () => {
    setIsQuickLinksOpen((prev) => !prev);
  };

  const scrollToGrid = (event) => {
    const onGrid = location.pathname === '/' || /^\/page\d+$/.test(location.pathname);
    if (!onGrid) return;
    event.preventDefault();
    document.querySelector('.positions-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleQuickLinkSelect = (path) => {
    setIsQuickLinksOpen(false);
    navigate(path);
  };

  useEffect(() => {
    if (!isQuickLinksOpen) return;
    const handleOutsideClick = (event) => {
      if (quickLinksRef.current && !quickLinksRef.current.contains(event.target)) {
        setIsQuickLinksOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsQuickLinksOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isQuickLinksOpen]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Promotional Strip */}
        <div className="promo-strip">
          <div className="promo-content">
            <span className="promo-text">🎮 Games and apps</span>
            <span className="promo-separator">•</span>
            <span className="promo-text">💰 £1 Per Day</span>
            <span className="promo-separator">•</span>
            <span className="promo-text">⚖️ Fair visibility</span>
            <span className="promo-separator">•</span>
            <span className="promo-text">⚡ Instant Setup</span>
            <span className="promo-separator">•</span>
            <span className="promo-text">🎮 Tap. Get. Play.</span>
          </div>
        </div>
        
        <div className="brand-row">
          <div className="logo-section">
            <Link to="/" className="logo-link" aria-label="ClickaLinks Home">
              <img
                src="/logo.PNG?v=neon"
                alt="ClickaLinks — Tap. Get. Play."
                className="logo-image"
              />
            </Link>
          </div>
          <aside className="header-guide" aria-label="How to use ClickaLinks">
            <p className="header-guide-title">Tap a square. Press Get.</p>
            <ol className="header-guide-steps">
              <li><strong>Tap</strong> any game on the grid</li>
              <li><strong>Get</strong> opens the App Store or Google Play</li>
              <li><strong>Play</strong> once it is installed</li>
            </ol>
            <div className="header-guide-actions">
              <Link to="/" className="header-guide-primary" onClick={scrollToGrid}>
                Browse games
              </Link>
              <Link to="/how-it-works" className="header-guide-secondary">
                Place a game · £1/day
              </Link>
            </div>
          </aside>
        </div>

        {/* Mobile: Search Bar under Logo */}
        {isMobile ? (
          <div className="mobile-search-under-logo">
            <div className="mobile-search-row">
              <SearchBar isMobile={true} />
              <div className="quick-links-dropdown" ref={quickLinksRef}>
                <button
                  type="button"
                  className="quick-links-button"
                  onClick={toggleQuickLinks}
                  aria-expanded={isQuickLinksOpen}
                  aria-haspopup="menu"
                >
                  Quick links
                </button>
                {isQuickLinksOpen && (
                  <div className="quick-links-menu" role="menu">
                    {quickLinks.map(link => (
                      <button
                        key={link.path}
                        type="button"
                        className="quick-links-item"
                        role="menuitem"
                        onClick={() => handleQuickLinkSelect(link.path)}
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Desktop: Navigation Section with Search */
          <div className="nav-search-wrapper">
            {/* Navigation Section */}
            <nav className="navigation-section" aria-label="Page navigation">
              <div className="nav-container">
                {pages.map(page => {
                  const isActive = 
                    (page === 1 && location.pathname === '/') || 
                    location.pathname === `/page${page}`;
                    
                  return (
                    <Link
                      key={page}
                      to={page === 1 ? "/" : `/page${page}`}
                      className={`nav-item ${isActive ? 'nav-active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={`Navigate to Page ${page}`}
                    >
                      <span className="nav-number">{page}</span>
                      <span className="nav-label">Page</span>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Search Bar - Next to Navigation */}
            <div className="search-container desktop-search">
              <SearchBar isMobile={false} />
            </div>
            <div className="quick-links-dropdown" ref={quickLinksRef}>
              <button
                type="button"
                className="quick-links-button"
                onClick={toggleQuickLinks}
                aria-expanded={isQuickLinksOpen}
                aria-haspopup="menu"
              >
                Quick links
              </button>
              {isQuickLinksOpen && (
                <div className="quick-links-menu" role="menu">
                  {quickLinks.map(link => (
                    <button
                      key={link.path}
                      type="button"
                      className="quick-links-item"
                      role="menuitem"
                      onClick={() => handleQuickLinkSelect(link.path)}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
