import React, { useState, Fragment } from 'react';
import { cloneDeep, pullAt } from 'lodash'
import '../App.css';

import { CheckerProvider } from '../context';
import { TEST_RED_CHECKER_LIST, TEST_BLACK_CHECKER_LIST, KINGABLE_RED_CHECKER_LIST, KINGABLE_BLACK_CHECKER_LIST, RED_ABOUT_TO_WIN_RED_CHECKERS, RED_ABOUT_TO_WIN_BLACK_CHECKERS } from '../config';
import { RED_MOVE_COORDINATES, BLACK_MOVE_COORDINATES, KING_MOVE_COORDINATES } from '../config';
import CheckerBoard from './CheckerBoard';
import CheckerBoardPattern from './CheckerBoardPattern';
import CheckerList from './CheckerList';
import WinnerComponent from './WinnerComponent';
import { checkIfOutOfBounds, checkIfMoveIsInCheckerList } from '../helpers';

// _.sample(moveCoordinates)

// TODO: Convert CheckerList values(x & y) into 
// Typed Byte Array. 8 by 8 with each position being a 
// piece on the board. Make it 32 bits if that's faster.
function CheckerManager() {
  const [redCheckerList, setRedCheckerList] = useState(window.UIGameState.redCheckerList);
  const [blackCheckerList, setBlackCheckerList] = useState(window.UIGameState.blackCheckerList);
  const [playerTurn, setPlayerTurn] = useState(window.UIGameState.playerTurn);
  const [hasGameEnded, setHasGameEnded] = useState(window.UIGameState.hasGameEnded);
  const [positionEvaluation, setPositionEvaluation] = useState(0);

  function updateUI() {
    setPlayerTurn(window.UIGameState.playerTurn);
    setRedCheckerList(window.UIGameState.redCheckerList);
    setBlackCheckerList(window.UIGameState.blackCheckerList);
    setHasGameEnded(window.UIGameState.hasGameEnded);
  }

  function doMove(oldCoordinates, newCoordinates, isCheckerKing) {
    window.UIGameState.doMove(oldCoordinates, newCoordinates, isCheckerKing);
    updateUI();
  }

  function undoLastRedMove() {
    window.UIGameState.undoMove(
      window.UIGameState.redJustCompletedMove,
      window.UIGameState.redJustCompletedMoveLastPosition,
      window.UIGameState.blackJustDeletedChecker,
    );
    updateUI();
  }

  function undoLastMove() {
    window.UIGameState.undoLastMove();
    updateUI();
  }

  function evalCurrentPlayer() {
    setPositionEvaluation(window.UIGameState.stateEvaluation('red'));
  }

  // Execute random move if AI.
  // if (!window.UIGameState.hasGameEnded) {
  //   if (window.UIGameState.playerTurn === 'black') {
  //     window.UIGameState.executeRandomMove();
  //     updateUI();
  //   }
  // }

  return (
    <CheckerProvider value={{
      playerTurn: playerTurn,
      setPlayerTurn: setPlayerTurn,
      hasGameEnded: hasGameEnded,
      doMove: doMove,
    }}>
      <Fragment>
        <CheckerBoard>
          <CheckerBoardPattern />
          <CheckerList color="red" coordinates={redCheckerList} random={false} />
          <CheckerList color="black" coordinates={blackCheckerList} random={false} />
        </CheckerBoard>
        <WinnerComponent />
        {/* <button onClick={undoLastMove}>Undo Last Move</button> */}
        <button onClick={evalCurrentPlayer}>Update State Evalutation</button>
        <span>Current eval for {'red'} is {positionEvaluation} </span>
      </Fragment>
    </CheckerProvider >
  );
}

export default CheckerManager;
