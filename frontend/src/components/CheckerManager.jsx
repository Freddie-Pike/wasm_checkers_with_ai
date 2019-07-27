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
  const [redCheckerList, setRedCheckerList] = useState(RED_ABOUT_TO_WIN_RED_CHECKERS);
  const [blackCheckerList, setBlackCheckerList] = useState(RED_ABOUT_TO_WIN_BLACK_CHECKERS);
  const [playerTurn, setPlayerTurn] = useState('red');
  const [hasGameEnded, setHasGameEnded] = useState(false);
  let jumpedPieces = [];

  function checkIfWonGame(newRedCheckerList, newBlackCheckerList) {
    if (newRedCheckerList.length === 0 || newBlackCheckerList.length === 0) {
      setHasGameEnded(true);
      setPlayerTurn(playerTurn === 'red' ? 'black' : 'red');
    }
  }

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
    jumpedPieces = []
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
        jumpedPieces.push([newX, newY]);
      }
      if (determineIfValidMove(newX, newY)) {
        moveCoordinatesArray[index] = [newX, newY];
      } else {
        indicesToRemove.push(index);
      }
    });
    pullAt(moveCoordinates, indicesToRemove);
    return moveCoordinates;
  }

  function isOnKingPosition(newCoordinates) {
    let kingCoordinates;
    if (playerTurn === 'red') {
      kingCoordinates = KINGABLE_RED_CHECKER_LIST;
    } else if (playerTurn === 'black') {
      kingCoordinates = KINGABLE_BLACK_CHECKER_LIST;
    }

    let isOnKingPosition = kingCoordinates.filter((checker) => {
      return checker.x === newCoordinates[0] & checker.y === newCoordinates[1];
    })

    if (isOnKingPosition.length === 0) {
      return false;
    }
    return true;
  }

  function getActionFromCoordinates(oldCoordinates, newCoordinates) {
    let action_taken = [
      newCoordinates[0] - oldCoordinates[0],
      newCoordinates[1] - oldCoordinates[1]
    ];
    let action_direction_row;
    let action_direction_col;

    // If positive row action, action_direction_row is 1.
    if (action_taken[0] < 0) {
      action_direction_row = -1
    } else {
      action_direction_row = 1
    }

    // If positive column action, action_direction_col is 1.
    if (action_taken[1] < 0) {
      action_direction_col = -1
    } else {
      action_direction_col = 1
    }

    return [action_direction_row, action_direction_col];
  }

  function doMove(oldCoordinates, newCoordinates, isCheckerKing) {
    let isKingNow = isOnKingPosition(newCoordinates);
    let actionCoordinates = getActionFromCoordinates(oldCoordinates, newCoordinates);
    let potentialJumpedCoordinate = [
      oldCoordinates[0] + actionCoordinates[0],
      oldCoordinates[1] + actionCoordinates[1],
    ];

    if (playerTurn === 'red') {
      setPlayerTurn('black');
      let newRedCheckerListWithoutClickedChecker = cloneDeep(redCheckerList);
      newRedCheckerListWithoutClickedChecker = newRedCheckerListWithoutClickedChecker.filter((checker) => {
        return !(checker.x === oldCoordinates[0] & checker.y === oldCoordinates[1]);
      });
      newRedCheckerListWithoutClickedChecker.push({
        x: newCoordinates[0],
        y: newCoordinates[1],
        isKing: isKingNow === true ? true : isCheckerKing,
      });
      setRedCheckerList(newRedCheckerListWithoutClickedChecker);

      // Execute Jump.
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(blackCheckerList);
      newBlackCheckerListWithoutClickedChecker = newBlackCheckerListWithoutClickedChecker.filter((checker) => {
        return !(checker.x === potentialJumpedCoordinate[0] & checker.y === potentialJumpedCoordinate[1]);
      })
      setBlackCheckerList(newBlackCheckerListWithoutClickedChecker);
      checkIfWonGame(newRedCheckerListWithoutClickedChecker, newBlackCheckerListWithoutClickedChecker);

    } else if (playerTurn === 'black') {
      setPlayerTurn('red');
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(blackCheckerList);
      newBlackCheckerListWithoutClickedChecker = newBlackCheckerListWithoutClickedChecker.filter((checker) => {
        return !(checker.x === oldCoordinates[0] & checker.y === oldCoordinates[1]);
      });
      newBlackCheckerListWithoutClickedChecker.push({
        x: newCoordinates[0],
        y: newCoordinates[1],
        isKing: isKingNow === true ? true : isCheckerKing,
      });
      setBlackCheckerList(newBlackCheckerListWithoutClickedChecker);

      // Execute Jump.
      let newRedCheckerListWithoutClickedChecker = cloneDeep(redCheckerList);
      newRedCheckerListWithoutClickedChecker = newRedCheckerListWithoutClickedChecker.filter((checker) => {
        return !(checker.x === potentialJumpedCoordinate[0] & checker.y === potentialJumpedCoordinate[1]);
      })
      setRedCheckerList(newRedCheckerListWithoutClickedChecker);
      checkIfWonGame(newRedCheckerListWithoutClickedChecker, newBlackCheckerListWithoutClickedChecker);
    } else {
      throw `playerTurn is an invalid turn. Got ${playerTurn} instead.`
    }
  }

  // Gets checker with a legal move.
  function getLegalCheckerFromList(checkerList) {
    let hasNotFoundCheckerWithLegalMove = true;
    let availableMoves;
    let checker;

    while (hasNotFoundCheckerWithLegalMove) {
      checker = checkerList[Math.floor(Math.random() * checkerList.length)];
      availableMoves = getAvailableMoves(checker.x, checker.y, checker.isKing);
      if (availableMoves.length > 0) {
        hasNotFoundCheckerWithLegalMove = false;
      }
    }
    return {
      availableMoves: availableMoves,
      checker: checker,
    };
  }

  if (playerTurn === 'black') {
    if (hasGameEnded) {
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
          doMove: doMove,
        }}>
          <Fragment>
            <CheckerBoard>
              <CheckerBoardPattern />
              <CheckerList color="red" coordinates={redCheckerList} random={false} />
              <CheckerList color="black" coordinates={blackCheckerList} random={false} />
            </CheckerBoard>
            <WinnerComponent />
          </Fragment>
        </CheckerProvider>
      );
    }
    const { availableMoves, checker } = getLegalCheckerFromList(blackCheckerList);
    doMove(
      [checker.x, checker.y],
      availableMoves[Math.floor(Math.random() * availableMoves.length)],
      checker.isKing,
    )

    return null;
  }
  else {
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
        doMove: doMove,
      }}>
        <Fragment>
          <CheckerBoard>
            <CheckerBoardPattern />
            <CheckerList color="red" coordinates={redCheckerList} random={false} />
            <CheckerList color="black" coordinates={blackCheckerList} random={false} />
          </CheckerBoard>
          <WinnerComponent />
        </Fragment>
      </CheckerProvider>
    );
  }
}

export default CheckerManager;
