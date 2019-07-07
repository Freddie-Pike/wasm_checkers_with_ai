import React from 'react';
import './App.css';
import CheckerBoard from './components/CheckerBoard';
import CheckerBoardPattern from './components/CheckerBoardPattern';
import CheckerList from './components/CheckerList';

function App() {
  return (
    <div className="main-container">
      <CheckerBoard>
        <CheckerBoardPattern />
        <CheckerList color="red" coordinates={
          [
            {
              "x": 1, "y": 1
            },
            {
              "x": 5, "y": 7
            }
          ]
        } />
        <CheckerList color="black" coordinates={
          [
            {
              "x": 2, "y": 2
            },
            {
              "x": 6, "y": 6
            }
          ]
        } />
      </CheckerBoard>
    </div>
  );
}

export default App;
