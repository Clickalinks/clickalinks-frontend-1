import React from 'react';

const Header = () => {
  return (
    <header>
      {/* Logo Section */}
      <div className="logo-section">
        <a href="/">
          <img 
            src="/logo.PNG" 
            alt="CLICKaLINKS - Direct Advertising Platform" 
            className="logo-img"
          />
        </a>
      </div>
      
      {/* Navigation Categories */}
      <nav className="categories-menu" aria-label="Main categories">
        <div className="category-links">
          <a href="#all" className="category-link" aria-label="All categories">All</a>
          <a href="#fashion" className="category-link" aria-label="Fashion category">Fashion</a>
          <a href="#electronics" className="category-link" aria-label="Electronics category">Electronics</a>
          <a href="#beauty" className="category-link" aria-label="Beauty category">Beauty</a>
          <a href="#accessories" className="category-link" aria-label="Accessories category">Accessories</a>
          <a href="#food" className="category-link" aria-label="Food category">Food</a>
          <a href="#home-garden" className="category-link" aria-label="Home & Garden category">Home & Garden</a>
          <a href="#auto" className="category-link" aria-label="Auto category">Auto</a>
          <a href="#services" className="category-link" aria-label="Services category">Services</a>
        </div>
      </nav>
    </header>
  );
};

export default Header;