import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function Success() {
  const [sessionData, setSessionData] = useState(null);
  const location = useLocation();

  // Parse query parameters from the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const squareId = queryParams.get('square');
    const sessionId = queryParams.get('session_id');
    
    setSessionData({
      squareId: squareId,
      sessionId: sessionId
    });

    // Here you could also verify the payment with your backend
    console.log('Payment successful for square:', squareId);
    console.log('Stripe session ID:', sessionId);

  }, [location]);

  return (
    <div className="success-page">
      <h1>Payment Successful! 🎉</h1>
      <p>Thank you for your purchase!</p>
      
      {sessionData && (
        <div className="success-details">
          <p><strong>Square ID:</strong> {sessionData.squareId}</p>
          <p><strong>Session ID:</strong> {sessionData.sessionId}</p>
        </div>
      )}
      
      <button onClick={() => window.location.href = '/'}>
        Return to Home
      </button>
    </div>
  );
}

export default Success;