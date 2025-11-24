import React from 'react';
import { useNavigate } from 'react-router-dom';

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="cancel-container">
      <div className="cancel-content">
        <div className="cancel-icon">❌</div>
        <h1>Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges have been made.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Return to Grid
        </button>
      </div>
    </div>
  );
};

export default Cancel;