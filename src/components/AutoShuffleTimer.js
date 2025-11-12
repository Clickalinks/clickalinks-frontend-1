import React, { useState, useEffect } from 'react';

const AutoShuffleTimer = () => {
  const [timeUntilShuffle, setTimeUntilShuffle] = useState('');
  const [lastShuffle, setLastShuffle] = useState('');

  // Shuffle algorithm
  const shuffleSquares = () => {
    console.log('🔄 Auto-shuffling squares...');
    
    const purchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
    const pagePurchases = {};
    
    // Group purchases by page
    Object.keys(purchases).forEach(squareNumber => {
      const page = Math.ceil(squareNumber / 200);
      if (!pagePurchases[page]) pagePurchases[page] = [];
      pagePurchases[page].push({ 
        squareNumber: parseInt(squareNumber), 
        ...purchases[squareNumber] 
      });
    });
    
    // Shuffle within each page
    Object.keys(pagePurchases).forEach(page => {
      const pageNum = parseInt(page);
      const purchasesOnPage = pagePurchases[pageNum];
      
      if (purchasesOnPage.length > 1) {
        // Fisher-Yates shuffle algorithm
        const shuffled = [...purchasesOnPage];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Reassign square numbers within the same page
        const startSquare = (pageNum - 1) * 200 + 1;
        shuffled.forEach((purchase, index) => {
          const newSquareNumber = startSquare + index;
          purchases[newSquareNumber] = { 
            ...purchase, 
            squareNumber: newSquareNumber 
          };
          // Remove old square number
          if (purchase.squareNumber !== newSquareNumber) {
            delete purchases[purchase.squareNumber];
          }
        });
      }
    });
    
    localStorage.setItem('squarePurchases', JSON.stringify(purchases));
    localStorage.setItem('lastShuffle', Date.now().toString());
    
    // Trigger refresh of all AdGrid components
    window.dispatchEvent(new Event('storage'));
    console.log('✅ Squares shuffled successfully!');
  };

  // Calculate time until next shuffle
  const updateTimer = () => {
    const lastShuffleTime = parseInt(localStorage.getItem('lastShuffle') || '0');
    const now = Date.now();
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    const nextShuffleTime = lastShuffleTime + TWO_HOURS;
    const timeLeft = nextShuffleTime - now;

    if (timeLeft <= 0) {
      // Time to shuffle!
      shuffleSquares();
      setTimeUntilShuffle('Shuffling now...');
      setTimeout(updateTimer, 1000);
    } else {
      // Convert to hours and minutes
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilShuffle(`${hours}h ${minutes}m`);
      
      // Format last shuffle time
      if (lastShuffleTime > 0) {
        const lastShuffleDate = new Date(lastShuffleTime);
        setLastShuffle(lastShuffleDate.toLocaleTimeString());
      } else {
        setLastShuffle('Never');
      }
    }
  };

  // Initialize shuffle scheduler
  useEffect(() => {
    // Set initial last shuffle time if not exists
    if (!localStorage.getItem('lastShuffle')) {
      localStorage.setItem('lastShuffle', Date.now().toString());
    }

    // Update timer every minute
    const timerInterval = setInterval(updateTimer, 60000);
    
    // Initial update
    updateTimer();

    // 2-hour shuffle interval
    const shuffleInterval = setInterval(shuffleSquares, 2 * 60 * 60 * 1000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(shuffleInterval);
    };
  }, []);

  // Manual shuffle button (for testing)
  const manualShuffle = () => {
    shuffleSquares();
    updateTimer();
  };

  return (
    <div className="shuffle-timer">
      <div className="timer-content">
        <div className="timer-icon">🔄</div>
        <div className="timer-info">
          <div className="next-shuffle">
            <strong>Next Auto-Shuffle:</strong> {timeUntilShuffle}
          </div>
          <div className="last-shuffle">
            <small>Last shuffle: {lastShuffle}</small>
          </div>
        </div>
        <button 
          onClick={manualShuffle}
          className="shuffle-btn"
          title="Shuffle Now (For Testing)"
        >
          🔄
        </button>
      </div>
    </div>
  );
};

export default AutoShuffleTimer;