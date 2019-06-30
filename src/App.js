import React from 'react';
import './App.css';
import CheckerBoard from './components/CheckerBoard';
import CheckerBoardPattern from './components/CheckerBoardPattern';

function App() {
  return (
    <div className="main-container">
      <CheckerBoard>
        <CheckerBoardPattern />
      </CheckerBoard>
    </div>
  );
}

export default App;
