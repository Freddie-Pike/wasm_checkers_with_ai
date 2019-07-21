import React, { useState } from 'react';
import './App.css';

import { CheckerProvider } from './context';
import { TEST_RED_CHECKER_LIST, TEST_BLACK_CHECKER_LIST } from './config';
import CheckerBoard from './components/CheckerBoard';
import CheckerBoardPattern from './components/CheckerBoardPattern';
import CheckerList from './components/CheckerList';

// TODO: Convert CheckerList values(x & y) into 
// Typed Byte Array. 8 by 8 with each position being a 
// piece on the board. Make it 32 bits if that's faster.
function App() {
  const [redCheckerList, setRedCheckerList] = useState(TEST_RED_CHECKER_LIST);
  const [blackCheckerList, setBlackCheckerList] = useState(TEST_BLACK_CHECKER_LIST);

  return (
    <CheckerProvider value={{
      redCheckerList: redCheckerList,
      setRedCheckerList: setRedCheckerList,
      blackCheckerList: blackCheckerList,
      setBlackCheckerList: setBlackCheckerList,
    }}>
      <div className="main-container">
        <CheckerBoard>
          <CheckerBoardPattern />
          <CheckerList color="red" coordinates={redCheckerList} />
          <CheckerList color="black" coordinates={blackCheckerList} />
        </CheckerBoard>
      </div>
    </CheckerProvider>
  );
}

export default App;
