import React, { useState } from 'react';
import './App.css';

import { CheckerProvider } from './context';
import CheckerBoard from './components/CheckerBoard';
import CheckerBoardPattern from './components/CheckerBoardPattern';
import CheckerList from './components/CheckerList';

const RED_CHECKER_LIST = [
  {
    "x": 1, "y": 1, "isKing": true,
  },
  {
    "x": 5, "y": 7
  }
]

const BLACK_CHECKER_LIST = [
  {
    "x": 2, "y": 2
  },
  {
    "x": 6, "y": 6
  }
]

// TODO: Convert CheckerList values(x & y) into 
// Typed Byte Array. 8 by 8 with each position being a 
// piece on the board. Make it 32 bits if that's faster.
function App() {
  const [redCheckerList, setRedCheckerList] = useState(RED_CHECKER_LIST);

  return (
    <CheckerProvider value={{
      redCheckerList: redCheckerList,
      setRedCheckerList: setRedCheckerList,
    }}>
      <div className="main-container">
        <CheckerBoard>
          <CheckerBoardPattern />
          <CheckerList color="red" coordinates={redCheckerList} />
          <CheckerList color="black" coordinates={BLACK_CHECKER_LIST} />
        </CheckerBoard>
      </div>
    </CheckerProvider>
  );
}

export default App;
