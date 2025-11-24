import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <header className="header">
      {/* Main Header Content */}
      <div className="header-content">
        <div className="logo-section">
          <Link to="/" className="logo-link">
            <img
              src="/logo.PNG"
              alt="CLICKaLINKS"
              style={{
                height: '130px', // Fixed height
                width: 'auto',
                maxWidth: '1000px',
                objectFit: 'contain'
              }}
            />
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="navigation-section">
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
                >
                  <span className="nav-number">{page}</span>
                  <span className="nav-label">Page</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;