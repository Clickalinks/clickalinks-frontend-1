import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Hello World!</h1>
        <p>Welcome to my first React app</p>
        <button onClick={() => alert('Button clicked!')}>
          Click me!
        </button>
      </header>
    </div>
  );
}

export default App;