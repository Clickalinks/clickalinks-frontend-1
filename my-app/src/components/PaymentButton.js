import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51SQ6vZR4ooGqKuuu3FR0zWxgKTQJsz3UsWtAweYFthqJqvTDL5vseIRbNLAoPboKZHX9nRxl4cOiM0ceaofeu7ce006n2Zg89j');

const PaymentButton = () => {

   const handleClick = async () => {
  try {
    console.log('Sending request to backend...');
    
    // ADD THIS REQUEST BODY - customize with your data
    const requestBody = {
      squareId: "1",  // Change to actual square ID
      duration: 10,   // 10, 20, or 30 days
      purchaseData: {
        businessName: "Test Business",  // Change to actual business name
        contactEmail: "test@example.com", // Change to actual email
        adText: "Amazing business offer!" // Change to actual ad text
      }
    };
    
    const response = await fetch('http://localhost:3001/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)  // ADD THIS LINE
    });
    
    const session = await response.json();
    console.log('Session response:', session);
    
    if (session.url) {
      console.log('Redirecting to:', session.url);
      window.location.href = session.url;
    } else {
      console.error('No URL in response:', session);
      alert('Payment error: No checkout URL received');
    }
    
  } catch (error) {
    console.error('Error:', error);
    alert('Payment error: ' + error.message);
  }
}; 
  return (
    <button onClick={handleClick} className="pay-button">
      <i className="fas fa-credit-card"></i>
      Get Started with ClickaLinks - $10.00
    </button>
  );
};

export default PaymentButton;