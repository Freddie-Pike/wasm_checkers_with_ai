import React, { useState } from 'react';
import CheckerManager from './components/CheckerManager';
import CheckerGameState from './CheckerGameState';
import AlphaBeta from './AlphaBeta';

window.UIGameState = new CheckerGameState();
// TODO: Currently searching using a tree depth of 3, there's some instability with 
// depths greater than 3 that should be fixed.
window.AlphaBeta = new AlphaBeta(3, 'black');

function App() {
  return (
    <CheckerManager />
  );
}

export default App;
