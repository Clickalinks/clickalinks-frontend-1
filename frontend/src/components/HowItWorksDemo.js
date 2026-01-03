import React, { useState, useEffect, useRef } from 'react';
import './HowItWorksDemo.css';

const HowItWorksDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animationRunning, setAnimationRunning] = useState(false);
  const [demoSquares, setDemoSquares] = useState(Array(200).fill(null));
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [squaresFilled, setSquaresFilled] = useState(0);
  const intervalRef = useRef(null);

  const steps = [
    {
      title: "Choose Your Square",
      description: "Browse 2,000 advertising spots across 10 pages",
      icon: "🎯"
    },
    {
      title: "Upload Your Logo",
      description: "Add your business logo (JPEG, PNG, or WebP)",
      icon: "🖼️"
    },
    {
      title: "Select Duration",
      description: "Choose 10, 20, 30, or 60 days at £1 per day",
      icon: "📅"
    },
    {
      title: "Complete Payment",
      description: "Secure payment via Stripe - instant activation",
      icon: "💳"
    },
    {
      title: "Go Live!",
      description: "Your ad appears immediately with fair rotation",
      icon: "🚀"
    }
  ];

  // Auto-advance steps for demo
  useEffect(() => {
    if (animationRunning) {
      const timer = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next >= steps.length) {
            setAnimationRunning(false);
            return prev;
          }
          return next;
        });
      }, 4000); // Change step every 4 seconds

      return () => clearInterval(timer);
    }
  }, [animationRunning, steps.length]);

  // Animate squares filling up
  useEffect(() => {
    if (currentStep >= 4 && !animationRunning) {
      // Fill squares gradually for demo effect
      let count = 0;
      const fillInterval = setInterval(() => {
        count += 1;
        setSquaresFilled(count);
        
        // Fill random squares
        setDemoSquares(prev => {
          const newSquares = [...prev];
          const emptyIndices = newSquares
            .map((sq, idx) => sq === null ? idx : null)
            .filter(idx => idx !== null);
          
          if (emptyIndices.length > 0 && count <= 50) {
            const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            newSquares[randomIdx] = {
              logo: '📊',
              businessName: 'Demo Business',
              animated: true
            };
          }
          return newSquares;
        });

        if (count >= 50) {
          clearInterval(fillInterval);
        }
      }, 100);
    }
  }, [currentStep, animationRunning]);

  // Simulate square selection
  useEffect(() => {
    if (currentStep === 0) {
      setTimeout(() => {
        setSelectedSquare(25);
      }, 1000);
    }
  }, [currentStep]);

  // Simulate logo upload
  useEffect(() => {
    if (currentStep === 1) {
      setTimeout(() => {
        setLogoUploaded(true);
      }, 1500);
    }
  }, [currentStep]);

  // Simulate payment
  useEffect(() => {
    if (currentStep === 3) {
      setTimeout(() => {
        setPaymentComplete(true);
      }, 1500);
    }
  }, [currentStep]);

  const startDemo = () => {
    setCurrentStep(0);
    setAnimationRunning(true);
    setSelectedSquare(null);
    setLogoUploaded(false);
    setPaymentComplete(false);
    setSquaresFilled(0);
    setDemoSquares(Array(200).fill(null));
  };

  const resetDemo = () => {
    setAnimationRunning(false);
    setCurrentStep(0);
    setSelectedSquare(null);
    setLogoUploaded(false);
    setPaymentComplete(false);
    setSquaresFilled(0);
    setDemoSquares(Array(200).fill(null));
  };

  return (
    <div className="demo-container">
      {/* Hero Section */}
      <div className="demo-hero">
        <div className="demo-hero-content">
          <h1>How ClickaLinks Works</h1>
          <p className="demo-subtitle">Interactive Demonstration</p>
          <div className="demo-controls">
            <button 
              onClick={startDemo} 
              className="demo-button primary"
              disabled={animationRunning}
            >
              ▶️ Start Animation
            </button>
            <button 
              onClick={resetDemo} 
              className="demo-button secondary"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="steps-indicator">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`step-indicator ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
          >
            <div className="step-indicator-icon">{step.icon}</div>
            <div className="step-indicator-content">
              <div className="step-indicator-title">{step.title}</div>
              <div className="step-indicator-number">Step {index + 1}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Demo Area */}
      <div className="demo-main">
        <div className="demo-grid-container">
          {/* Grid Visualization */}
          <div className="demo-grid-wrapper">
            <h2 className="demo-section-title">Advertising Grid (200 Squares)</h2>
            <div className="demo-grid">
              {demoSquares.map((square, index) => (
                <div
                  key={index}
                  className={`demo-square ${
                    index === selectedSquare ? 'selected' : ''
                  } ${
                    square ? 'occupied' : ''
                  } ${
                    square?.animated ? 'animate-pop' : ''
                  }`}
                  style={{
                    animationDelay: square?.animated ? `${index * 0.01}s` : '0s'
                  }}
                >
                  {index === selectedSquare && currentStep === 0 && (
                    <div className="selection-pulse"></div>
                  )}
                  {square && (
                    <div className="square-content">
                      <div className="square-logo">{square.logo}</div>
                      <div className="square-name">{square.businessName}</div>
                    </div>
                  )}
                  {!square && index === selectedSquare && currentStep >= 1 && currentStep < 4 && (
                    <div className="pending-indicator">
                      <div className="pending-spinner"></div>
                    </div>
                  )}
                  {!square && index === selectedSquare && currentStep === 4 && paymentComplete && (
                    <div className="square-content animate-fade-in">
                      <div className="square-logo">🎉</div>
                      <div className="square-name">Live!</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel - Step Details */}
          <div className="demo-side-panel">
            <div className={`step-detail-card ${currentStep === 0 ? 'active' : ''}`}>
              <div className="step-detail-icon">{steps[0].icon}</div>
              <h3>{steps[0].title}</h3>
              <p>{steps[0].description}</p>
              {currentStep === 0 && selectedSquare !== null && (
                <div className="demo-highlight">
                  <div className="highlight-text">✓ Square #{selectedSquare + 1} Selected</div>
                </div>
              )}
            </div>

            <div className={`step-detail-card ${currentStep === 1 ? 'active' : ''}`}>
              <div className="step-detail-icon">{steps[1].icon}</div>
              <h3>{steps[1].title}</h3>
              <p>{steps[1].description}</p>
              {currentStep === 1 && (
                <div className="logo-upload-demo">
                  <div className={`upload-box ${logoUploaded ? 'uploaded' : ''}`}>
                    {logoUploaded ? (
                      <>
                        <div className="upload-icon">✓</div>
                        <div className="upload-text">Logo Uploaded!</div>
                      </>
                    ) : (
                      <>
                        <div className="upload-icon">📤</div>
                        <div className="upload-text">Uploading...</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={`step-detail-card ${currentStep === 2 ? 'active' : ''}`}>
              <div className="step-detail-icon">{steps[2].icon}</div>
              <h3>{steps[2].title}</h3>
              <p>{steps[2].description}</p>
              {currentStep === 2 && (
                <div className="duration-selector-demo">
                  {[10, 20, 30, 60].map((days) => (
                    <div key={days} className="duration-option">
                      <div className="duration-days">{days} Days</div>
                      <div className="duration-price">£{days}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={`step-detail-card ${currentStep === 3 ? 'active' : ''}`}>
              <div className="step-detail-icon">{steps[3].icon}</div>
              <h3>{steps[3].title}</h3>
              <p>{steps[3].description}</p>
              {currentStep === 3 && (
                <div className="payment-demo">
                  <div className={`payment-box ${paymentComplete ? 'complete' : ''}`}>
                    {paymentComplete ? (
                      <>
                        <div className="payment-icon">✓</div>
                        <div className="payment-text">Payment Successful!</div>
                      </>
                    ) : (
                      <>
                        <div className="payment-icon">💳</div>
                        <div className="payment-text">Processing...</div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={`step-detail-card ${currentStep === 4 ? 'active' : ''}`}>
              <div className="step-detail-icon">{steps[4].icon}</div>
              <h3>{steps[4].title}</h3>
              <p>{steps[4].description}</p>
              {currentStep === 4 && (
                <div className="live-stats">
                  <div className="stat-item">
                    <div className="stat-value">{squaresFilled}</div>
                    <div className="stat-label">Squares Filled</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">Fair Rotation</div>
                    <div className="stat-label">Active System</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">24/7</div>
                    <div className="stat-label">Always Live</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="demo-features">
          <div className="feature-showcase">
            <div className="showcase-item">
              <div className="showcase-icon">🔄</div>
              <h4>Fair Rotation</h4>
              <p>Automatic shuffling ensures equal visibility</p>
            </div>
            <div className="showcase-item">
              <div className="showcase-icon">⚡</div>
              <h4>Instant Activation</h4>
              <p>Go live immediately after payment</p>
            </div>
            <div className="showcase-item">
              <div className="showcase-icon">💰</div>
              <h4>£1 Per Day</h4>
              <p>Affordable pricing for all businesses</p>
            </div>
            <div className="showcase-item">
              <div className="showcase-icon">📊</div>
              <h4>Click Tracking</h4>
              <p>Monitor your campaign performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksDemo;
