import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <header className="header">
      {/* Centered Logo */}
      <div className="logo-container">
        <Link to="/">
          <img 
            src="/logo.PNG" 
            alt="CLICKaLINKS - Multi-Page Advertising Platform" 
            className="logo"
          />
        </Link>
      </div>
      
      {/* Page Navigation Boxes - Horizontal */}
      <nav className="page-navigation" aria-label="Page navigation">
        {pages.map(page => (
          <Link 
            key={page}
            to={page === 1 ? "/" : `/page${page}`}
            className="page-box"
          >
            Page {page}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default Header;