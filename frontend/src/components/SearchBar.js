import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './SearchBar.css';

const SearchBar = ({ isMobile = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Search businesses
  const searchBusinesses = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'purchasedSquares'));
      const results = [];
      const searchTerm = query.toLowerCase().trim();
      const now = new Date();

      querySnapshot.forEach(docSnapshot => {
        const data = docSnapshot.data();
        if (data && data.status === 'active') {
          // Check if expired
          if (data.endDate) {
            const endDate = new Date(data.endDate);
            if (endDate <= now) return; // Skip expired
          }

          const businessName = (data.businessName || '').toLowerCase();
          const squareNum = data.squareNumber || parseInt(docSnapshot.id);
          
          // Search by business name
          if (businessName.includes(searchTerm)) {
            results.push({
              squareNumber: squareNum,
              pageNumber: data.pageNumber || Math.ceil(squareNum / 200),
              businessName: data.businessName || 'Unknown Business',
              logoData: data.logoData,
              dealLink: data.dealLink
            });
          }
        }
      });

      // Sort by square number
      results.sort((a, b) => a.squareNumber - b.squareNumber);
      setSearchResults(results);
      setShowResults(results.length > 0);
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchBusinesses(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchBusinesses]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (result) => {
    setSearchQuery('');
    setShowResults(false);
    navigate(`/page${result.pageNumber}`, { 
      state: { highlightSquare: result.squareNumber } 
    });
    // Scroll to square after navigation
    setTimeout(() => {
      const squareElement = document.querySelector(`[data-square="${result.squareNumber}"]`);
      if (squareElement) {
        squareElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        squareElement.style.outline = '3px solid #ff6b35';
        squareElement.style.outlineOffset = '2px';
        setTimeout(() => {
          squareElement.style.outline = '';
          squareElement.style.outlineOffset = '';
        }, 3000);
      }
    }, 500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleResultClick(searchResults[0]);
    }
  };

  return (
    <div className={`search-bar-wrapper ${isMobile ? 'mobile-search' : ''}`}>
      <form onSubmit={handleSearchSubmit} className={`search-form ${isMobile ? 'mobile-search-form' : ''}`}>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="🔍 Search businesses..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchResults.length > 0) setShowResults(true);
            }}
            className={`search-input ${isMobile ? 'mobile-search-input' : ''}`}
            aria-label="Search businesses"
          />
          {isSearching && <div className="search-spinner"></div>}
          {searchQuery && !isSearching && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowResults(false);
              }}
              className="search-clear"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button 
          type="submit" 
          className={`search-button ${isMobile ? 'mobile-search-button' : ''}`} 
          aria-label="Search"
        >
          <span>{isMobile ? '🔍' : 'Search'}</span>
        </button>
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="search-results">
          <div className="search-results-header">
            Found {searchResults.length} business{searchResults.length !== 1 ? 'es' : ''}
          </div>
          {searchResults.slice(0, 10).map((result) => (
            <div
              key={result.squareNumber}
              className="search-result-item"
              onClick={() => handleResultClick(result)}
            >
              {result.logoData && (
                <img
                  src={result.logoData}
                  alt={result.businessName}
                  className="search-result-logo"
                />
              )}
              <div className="search-result-info">
                <div className="search-result-name">{result.businessName}</div>
                <div className="search-result-location">
                  Square #{result.squareNumber} • Page {result.pageNumber}
                </div>
              </div>
            </div>
          ))}
          {searchResults.length > 10 && (
            <div className="search-results-footer">
              And {searchResults.length - 10} more...
            </div>
          )}
        </div>
      )}
      {showResults && searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="search-results">
          <div className="search-no-results">
            No businesses found matching "{searchQuery}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;

