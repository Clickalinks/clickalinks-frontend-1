import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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

        {/* Navigation Section with Search */}
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

          {/* Search Bar - Next to Navigation (Desktop only) */}
          <div className="search-container desktop-search">
            <SearchBar isMobile={false} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
