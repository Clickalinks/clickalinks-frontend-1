import React, { useState } from 'react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        {/* Hamburger Menu */}
        <div className="hamburger-menu" onClick={toggleMenu}>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </div>
        
        {/* Centered Logo */}
        <div className="logo-container">
          <a href="/">
            <img 
              src="/logo.PNG" 
              alt="CLICKaLINKS - Direct Advertising Platform" 
              className="logo"
            />
          </a>
        </div>
      </header>

      {/* Categories Side Menu */}
      <div className={`categories-side-menu ${menuOpen ? 'active' : ''}`}>
        <div className="categories-container">
          <a href="#all" className="category-link" onClick={closeMenu}>All Categories</a>
          <a href="#fashion" className="category-link" onClick={closeMenu}>Fashion</a>
          <a href="#electronics" className="category-link" onClick={closeMenu}>Electronics</a>
          <a href="#beauty" className="category-link" onClick={closeMenu}>Beauty</a>
          <a href="#accessories" className="category-link" onClick={closeMenu}>Accessories</a>
          <a href="#food" className="category-link" onClick={closeMenu}>Food & Drink</a>
          <a href="#home-garden" className="category-link" onClick={closeMenu}>Home & Garden</a>
          <a href="#auto" className="category-link" onClick={closeMenu}>Auto</a>
          <a href="#services" className="category-link" onClick={closeMenu}>Services</a>
        </div>
      </div>
      
      {/* Overlay to close menu when clicking outside */}
      <div 
        className={`menu-overlay ${menuOpen ? 'active' : ''}`} 
        onClick={closeMenu}
      ></div>
    </>
  );
};

export default Header;