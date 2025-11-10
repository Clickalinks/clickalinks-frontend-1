import React from 'react';
import './App.css';
import Header from './components/Header';
import RunningStrip from './components/RunningStrip';
import AdGrid from './components/AdGrid';
import Footer from './components/Footer'; // Make sure this line exists
import Success from './components/Success';

// In your Routes section, add:
<Route path="/success" element={<Success />} />
function App() {
  return (
    <div className="App">
      <Header /> 
      <RunningStrip />
      <div className="container">
        <div className="hero">
          <h1>🚀 Direct Advertising Platform🚀</h1>
          <h5>🔻 Learn more about ClickaLinks in our footer information menu 🔻</h5>
        </div>
        <AdGrid />
      </div>
      <Footer /> {/* Make sure this line exists */}
    </div>
  );
}

export default App;