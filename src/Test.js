import React from 'react';

function Test() {
  return (
    <div style={{ padding: '20px', background: 'lightgreen' }}>
      <h1>TEST - REACT IS WORKING</h1>
      <button onClick={() => alert('It works!')}>Test Button</button>
    </div>
  );
}

export default Test;