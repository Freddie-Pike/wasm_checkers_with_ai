import React, { useState, Fragment } from 'react';
import { cloneDeep } from 'lodash'
import '../App.css';

import { CheckerProvider } from '../context';
import { TEST_RED_CHECKER_LIST, TEST_BLACK_CHECKER_LIST, RED_ABOUT_TO_WIN_RED_CHECKERS, RED_ABOUT_TO_WIN_BLACK_CHECKERS } from '../config';
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
  const [redCheckerList, setRedCheckerList] = useState(TEST_RED_CHECKER_LIST);
  const [blackCheckerList, setBlackCheckerList] = useState(TEST_BLACK_CHECKER_LIST);
  const [playerTurn, setPlayerTurn] = useState('red');
  const [hasGameEnded, setHasGameEnded] = useState(false);

  function getMoveCoordinates(isKing) {
    let moveCoordinates;
    if (isKing === true) {
      moveCoordinates = cloneDeep(KING_MOVE_COORDINATES);
    } else if (playerTurn === 'red') {
      moveCoordinates = cloneDeep(RED_MOVE_COORDINATES);
    } else if (playerTurn === 'black') {
      moveCoordinates = cloneDeep(BLACK_MOVE_COORDINATES);
    } else {
      throw `Can't determine move coordinates.`
    }
    return moveCoordinates;
  }

  function determineIfValidMove(x, y) {
    return checkIfOutOfBounds(x, y) &&
      checkIfMoveIsInCheckerList(x, y, redCheckerList) &&
      checkIfMoveIsInCheckerList(x, y, blackCheckerList);
  }

  function getAvailableMoves(x, y, isKing) {
    let moveCoordinates = getMoveCoordinates(isKing);
    let indicesToRemove = [];
    moveCoordinates.forEach((moveCoordinate, index, moveCoordinatesArray) => {
      let newX = moveCoordinate[0] + x;
      let newY = moveCoordinate[1] + y;
      let jumpedCheckerList;

      if (playerTurn === 'red') {
        jumpedCheckerList = blackCheckerList.filter((checker) => {
          return checker.x === newX & checker.y === newY;
        });
      } else if (playerTurn === 'black') {
        jumpedCheckerList = redCheckerList.filter((checker) => {
          return checker.x === newX & checker.y === newY;
        });
      }

      let jumpedChecker = jumpedCheckerList.pop()
      if (jumpedChecker !== undefined) {
        newX += moveCoordinate[0];
        newY += moveCoordinate[1];
      }
      if (determineIfValidMove(newX, newY)) {
        moveCoordinatesArray[index] = [newX, newY];
      } else {
        indicesToRemove.push(index);
      }
    });
    indicesToRemove.forEach((index) => {
      moveCoordinates.splice(index, 1);
    });
    return moveCoordinates;
  }

  function doMove(checkerColor) {
    // Pop off of checkerList
  }

  // Gets checker with a legal move.
  function getLegalCheckerFromList(checkerList) {
    let hasFoundCheckerWithLegalMove = false;
    while (hasFoundCheckerWithLegalMove) {
      checkerList.random(index);
      availableMoves = checkerList.getAvailableMoves();
      if (availableMoves.length > 0) {
        hasFoundCheckerWithLegalMove = true;
      }
    }
    return hasFoundCheckerWithLegalMove;
  }

  return (
    <CheckerProvider value={{
      redCheckerList: redCheckerList,
      setRedCheckerList: setRedCheckerList,
      blackCheckerList: blackCheckerList,
      setBlackCheckerList: setBlackCheckerList,
      playerTurn: playerTurn,
      setPlayerTurn: setPlayerTurn,
      hasGameEnded: hasGameEnded,
      setHasGameEnded: setHasGameEnded,
      getAvailableMoves: getAvailableMoves,
    }}>
      <Fragment>
        <CheckerBoard>
          <CheckerBoardPattern />
          <CheckerList color="red" coordinates={redCheckerList} random={false} />
          <CheckerList color="black" coordinates={blackCheckerList} random={true} />
        </CheckerBoard>
        <WinnerComponent />
      </Fragment>
    </CheckerProvider>
  );
}

export default CheckerManager;
