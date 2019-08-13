import React, { useState, Fragment } from 'react';
import { cloneDeep, pullAt } from 'lodash'
import '../App.css';

import { CheckerProvider } from '../context';
import { TEST_RED_CHECKER_LIST, TEST_BLACK_CHECKER_LIST, KINGABLE_RED_CHECKER_LIST, KINGABLE_BLACK_CHECKER_LIST, RED_ABOUT_TO_WIN_RED_CHECKERS, RED_ABOUT_TO_WIN_BLACK_CHECKERS } from '../config';
import { RED_MOVE_COORDINATES, BLACK_MOVE_COORDINATES, KING_MOVE_COORDINATES } from '../config';
import CheckerBoard from './CheckerBoard';
import CheckerBoardPattern from './CheckerBoardPattern';
import CheckerList from './CheckerList';
import CheckerListTypedArrays from './CheckerListTypedArrays';
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
    // debugger;
    let isKingNumber;
    if (isCheckerKing) {
      isKingNumber = 1;
    } else {
      isKingNumber = 0;
    }
    window.rustAlphaBetaInstance.do_move(oldCoordinates, newCoordinates, isKingNumber);
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

  function evalCurrentPlayer() {
    setPositionEvaluation(window.UIGameState.stateEvaluation('red'));
  }

  // Execute random move if AI.
  if (!window.UIGameState.hasGameEnded) {
    if (window.UIGameState.playerTurn === 'black') {

      // TODO: Add in performance analysis. Use performance.now().
      // Rust Alphabeta.
      let start = performance.now();
      let rustGetAlphaBetaMove = window.rustAlphaBetaInstance.getMove();
      console.log(`rustGetAlphaBetaMove is ${rustGetAlphaBetaMove}`);
      let rustTempBestMoveSelectedPiece = window.rustAlphaBetaInstance.get_tempBestMoveSelectedPiece();
      let rustTempBestMove = window.rustAlphaBetaInstance.get_tempBestMove();
      let rustIsKing = false;
      if (rustTempBestMoveSelectedPiece[2] == 1) {
        rustIsKing = true;
      }
      window.UIGameState.doMove(
        [rustTempBestMoveSelectedPiece[0], rustTempBestMoveSelectedPiece[1]],
        [rustTempBestMove[0], rustTempBestMove[1]],
        rustIsKing,
      );
      window.rustAlphaBetaInstance.do_move(
        [rustTempBestMoveSelectedPiece[0], rustTempBestMoveSelectedPiece[1]],
        [rustTempBestMove[0], rustTempBestMove[1]],
        rustTempBestMoveSelectedPiece[2],
      );
      let elpased = performance.now() - start;
      console.log('rust move generation time: ', elpased);

      // Javascript Alphabeta
      // let start = performance.now();
      // let getAlphaBetaMove = window.AlphaBeta.getMove();
      // console.log(`getAlphaBetaMove is ${getAlphaBetaMove}`);
      // let isKingNumber;
      // if (window.AlphaBeta.tempBestMoveSelectedPiece.isKing) {
      //   isKingNumber = 1;
      // } else {
      //   isKingNumber = 0;
      // }
      // window.UIGameState.doMove(
      //   [window.AlphaBeta.tempBestMoveSelectedPiece.x, window.AlphaBeta.tempBestMoveSelectedPiece.y],
      //   [window.AlphaBeta.tempBestMove.x, window.AlphaBeta.tempBestMove.y],
      //   window.AlphaBeta.tempBestMoveSelectedPiece.isKing,
      // );
      // window.rustAlphaBetaInstance.do_move(
      //   [window.AlphaBeta.tempBestMoveSelectedPiece.x, window.AlphaBeta.tempBestMoveSelectedPiece.y],
      //   [window.AlphaBeta.tempBestMove.x, window.AlphaBeta.tempBestMove.y],
      //   isKingNumber,
      // );
      // let elpased = performance.now() - start;
      // console.log('JavaScript move generation time: ', elpased);


      updateUI();
    }
  }

  let style = {
    top: "1rem",
    right: "1rem",
    height: "24rem",
    width: "8rem",
    backgroundColor: "red",
    position: "absolute",
  }

  return (
    <CheckerProvider value={{
      playerTurn: playerTurn,
      setPlayerTurn: setPlayerTurn,
      hasGameEnded: hasGameEnded,
      doMove: doMove,
    }}>
      <Fragment >
        <div className="main-container">
          <CheckerBoard>
            <CheckerBoardPattern />
            <CheckerListTypedArrays color="red" coordinates={redCheckerList} random={false} />
            <CheckerListTypedArrays color="black" coordinates={blackCheckerList} random={false} />
          </CheckerBoard>
          <WinnerComponent />
          {/* <button onClick={undoLastRedMove}>Undo Last Move</button> */}
          <button onClick={evalCurrentPlayer}>Update State Evalutation</button>
          <span>Current eval for {'red'} is {positionEvaluation} </span>
        </div>
        <div style={style}></div>
      </Fragment>
    </CheckerProvider >
  );
}

export default CheckerManager;
