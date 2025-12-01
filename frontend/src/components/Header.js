import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <header className="header">
      <div className="header-container">
        {/* Promotional Strip */}
        <div className="promo-strip">
          <div className="promo-content">
            <span className="promo-text">🚀 Direct Advertising Platform</span>
            <span className="promo-separator">•</span>
            <span className="promo-text">💰 £1 Per Day</span>
            <span className="promo-separator">•</span>
            <span className="promo-text">📈 Reach Thousands</span>
            <span className="promo-separator">•</span>
            <span className="promo-text">⚡ Instant Setup</span>
            <span className="promo-separator">•</span>
            <span className="promo-text">🎯 Click. Shop. Repeat.</span>
          </div>
        </div>
        
        {/* Logo Section */}
        <div className="logo-section">
          <Link to="/" className="logo-link" aria-label="ClickaLinks Home">
            <img
              src="/logo.PNG"
              alt="ClickaLinks - Direct Advertising Platform"
              className="logo-image"
            />
          </Link>
        </div>

        {/* Mobile: Search Bar under Logo */}
        {isMobile ? (
          <div className="mobile-search-under-logo">
            <SearchBar isMobile={true} />
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
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
