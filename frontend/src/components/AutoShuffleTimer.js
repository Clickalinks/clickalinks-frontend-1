import React, { useState, useEffect } from 'react';
import './AutoShuffleTimer.css';

const AutoShuffleTimer = () => {
  const [timeUntilShuffle, setTimeUntilShuffle] = useState('Calculating...');
  const [isVisible, setIsVisible] = useState(true);

  // Shuffle algorithm
  const shuffleSquares = () => {
    console.log('🔄 Auto-shuffling squares...');
    
    try {
      const purchases = JSON.parse(localStorage.getItem('squarePurchases') || '{}');
      const pagePurchases = {};
      
      // Group purchases by page
      Object.keys(purchases).forEach(squareNumber => {
        const squareNum = parseInt(squareNumber);
        const page = Math.ceil(squareNum / 200);
        if (!pagePurchases[page]) pagePurchases[page] = [];
        pagePurchases[page].push({ 
          squareNumber: squareNum, 
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
      window.dispatchEvent(new CustomEvent('shuffleCompleted', { 
        detail: { timestamp: Date.now() } 
      }));
      
      console.log('✅ Squares shuffled successfully!');
      
      // Show visual notification
      showShuffleNotification();
    } catch (error) {
      console.error('❌ Error shuffling squares:', error);
    }
  };

  // Show shuffle notification
  const showShuffleNotification = () => {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.shuffle-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'shuffle-notification';
    notification.textContent = '🔄 Squares have been shuffled!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  };

  // Calculate time until next shuffle
  const updateTimer = () => {
    try {
      const lastShuffleTime = parseInt(localStorage.getItem('lastShuffle') || '0');
      const now = Date.now();
      const TWO_HOURS = 2 * 60 * 60 * 1000;
      const nextShuffleTime = lastShuffleTime + TWO_HOURS;
      const timeLeft = nextShuffleTime - now;

      if (timeLeft <= 0) {
        // Time to shuffle!
        shuffleSquares();
        setTimeUntilShuffle('Now');
        setTimeout(updateTimer, 1000);
      } else {
        // Convert to hours and minutes
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        if (hours > 0) {
          setTimeUntilShuffle(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeUntilShuffle(`${minutes}m ${seconds}s`);
        } else {
          setTimeUntilShuffle(`${seconds}s`);
        }
      }
    } catch (error) {
      console.error('❌ Error updating timer:', error);
      setTimeUntilShuffle('Error');
    }
  };

  // Initialize shuffle scheduler
  useEffect(() => {
    // Set initial last shuffle time if not exists
    if (!localStorage.getItem('lastShuffle')) {
      localStorage.setItem('lastShuffle', Date.now().toString());
      console.log('⏰ Initial shuffle time set');
    }

    // Update timer every second for precise countdown
    const timerInterval = setInterval(updateTimer, 1000);
    
    // Initial update
    updateTimer();

    // 2-hour shuffle interval (backup)
    const shuffleInterval = setInterval(shuffleSquares, 2 * 60 * 60 * 1000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(shuffleInterval);
    };
  }, []);

  // Manual shuffle button
  const manualShuffle = () => {
    if (window.confirm('Shuffle all advertising squares now? This will randomly rearrange all occupied squares.')) {
      shuffleSquares();
      updateTimer();
    }
  };

  if (!isVisible) {
    return (
      <div className="shuffle-timer-minimized">
        <button 
          onClick={() => setIsVisible(true)}
          className="show-shuffle-btn"
          title="Show Shuffle Timer"
        >
          🔄
        </button>
      </div>
    );
  }

  return (
    <div className="shuffle-timer-compact">
      <div className="timer-content-compact">
        <div className="timer-info-compact">
          <span className="timer-icon-compact">🔄</span>
          <span className="timer-text">Next shuffle: {timeUntilShuffle}</span>
        </div>
        <div className="timer-actions">
          <button 
            onClick={manualShuffle}
            className="shuffle-btn-compact"
            title="Shuffle Now"
          >
            Shuffle
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="minimize-btn"
            title="Minimize"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoShuffleTimer;