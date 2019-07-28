import React, { useState } from 'react';
import CheckerManager from './components/CheckerManager';
import CheckerGameState from './CheckerGameState';

window.UIGameState = new CheckerGameState()

// TODO: Convert CheckerList values(x & y) into 
// Typed Byte Array. 8 by 8 with each position being a 
// piece on the board. Make it 32 bits if that's faster.
function App() {
  return (
    <div className="main-container">
      <CheckerManager />
    </div>
  );
}

export default App;
