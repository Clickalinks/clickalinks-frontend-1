import React from 'react';

function App() {
  console.log('🎯 SIMPLE APP IS RENDERING!');
  return (
    <div style={{ padding: '50px', textAlign: 'center', backgroundColor: '#f0f8ff', minHeight: '100vh' }}>
      <h1 style={{ color: '#0066cc', fontSize: '48px' }}>🎉 CLICKALINKS IS LIVE!</h1>
      <p style={{ fontSize: '24px', color: '#333' }}>React is working correctly!</p>
      <button 
        onClick={() => alert('🎯 Success! Your React app is working!')}
        style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Test Button - Click Me!
      </button>
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '10px' }}>
        <h3>Next Steps:</h3>
        <p>If this loads, we'll restore your components one by one.</p>
      </div>
    </div>
  );
}

export default App;