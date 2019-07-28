import { cloneDeep, pullAt } from 'lodash'

import { RED_MOVE_COORDINATES, BLACK_MOVE_COORDINATES, KING_MOVE_COORDINATES } from './config';
import { checkIfOutOfBounds, checkIfMoveIsInCheckerList } from './helpers';
import { TEST_RED_CHECKER_LIST, TEST_BLACK_CHECKER_LIST, KINGABLE_RED_CHECKER_LIST, KINGABLE_BLACK_CHECKER_LIST, RED_ABOUT_TO_WIN_RED_CHECKERS, RED_ABOUT_TO_WIN_BLACK_CHECKERS } from './config';

class CheckerGameState {
  constructor() {
    this.redCheckerList = RED_ABOUT_TO_WIN_RED_CHECKERS;
    this.blackCheckerList = RED_ABOUT_TO_WIN_BLACK_CHECKERS;
    this.playerTurn = 'red';
    this.hasGameEnded = false;
  }

  setGameStatus() {
    if (this.redCheckerList.length === 0 || this.blackCheckerList.length === 0) {
      this.hasGameEnded = true;
    }
  }

  getMoveCoordinates(isKing) {
    let moveCoordinates;
    if (isKing === true) {
      moveCoordinates = cloneDeep(KING_MOVE_COORDINATES);
    } else if (this.playerTurn === 'red') {
      moveCoordinates = cloneDeep(RED_MOVE_COORDINATES);
    } else if (this.playerTurn === 'black') {
      moveCoordinates = cloneDeep(BLACK_MOVE_COORDINATES);
    } else {
      throw `Can't determine move coordinates.`
    }
    return moveCoordinates;
  }

  determineIfValidMove(x, y) {
    return checkIfOutOfBounds(x, y) &&
      checkIfMoveIsInCheckerList(x, y, this.redCheckerList) &&
      checkIfMoveIsInCheckerList(x, y, this.blackCheckerList);
  }

  getAvailableMoves(x, y, isKing) {
    let moveCoordinates = this.getMoveCoordinates(isKing);
    let indicesToRemove = [];
    moveCoordinates.forEach((moveCoordinate, index, moveCoordinatesArray) => {
      let newX = moveCoordinate[0] + x;
      let newY = moveCoordinate[1] + y;
      let jumpedCheckerList;

      if (this.playerTurn === 'red') {
        jumpedCheckerList = this.blackCheckerList.filter((checker) => {
          return checker.x === newX & checker.y === newY;
        });
      } else if (this.playerTurn === 'black') {
        jumpedCheckerList = this.redCheckerList.filter((checker) => {
          return checker.x === newX & checker.y === newY;
        });
      }

      let jumpedChecker = jumpedCheckerList.pop()
      if (jumpedChecker !== undefined) {
        newX += moveCoordinate[0];
        newY += moveCoordinate[1];
      }
      if (this.determineIfValidMove(newX, newY)) {
        moveCoordinatesArray[index] = [newX, newY];
      } else {
        indicesToRemove.push(index);
      }
    });
    pullAt(moveCoordinates, indicesToRemove);
    return moveCoordinates;
  }

  isOnKingPosition(newCoordinates) {
    let kingCoordinates;
    if (this.playerTurn === 'red') {
      kingCoordinates = KINGABLE_RED_CHECKER_LIST;
    } else if (this.playerTurn === 'black') {
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

  getActionFromCoordinates(oldCoordinates, newCoordinates) {
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

  doMove(oldCoordinates, newCoordinates, isCheckerKing) {
    let isKingNow = this.isOnKingPosition(newCoordinates);
    let actionCoordinates = this.getActionFromCoordinates(oldCoordinates, newCoordinates);
    let potentialJumpedCoordinate = [
      oldCoordinates[0] + actionCoordinates[0],
      oldCoordinates[1] + actionCoordinates[1],
    ];

    if (this.playerTurn === 'red') {
      this.playerTurn = 'black';
      let newRedCheckerListWithoutClickedChecker = cloneDeep(this.redCheckerList);
      newRedCheckerListWithoutClickedChecker = newRedCheckerListWithoutClickedChecker.filter((checker) => {
        return !(checker.x === oldCoordinates[0] & checker.y === oldCoordinates[1]);
      });
      newRedCheckerListWithoutClickedChecker.push({
        x: newCoordinates[0],
        y: newCoordinates[1],
        isKing: isKingNow === true ? true : isCheckerKing,
      });
      this.redCheckerList = newRedCheckerListWithoutClickedChecker;

      // Execute Jump.
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(this.blackCheckerList);
      newBlackCheckerListWithoutClickedChecker = newBlackCheckerListWithoutClickedChecker.filter((checker) => {
        return !(checker.x === potentialJumpedCoordinate[0] & checker.y === potentialJumpedCoordinate[1]);
      });
      this.blackCheckerList = newBlackCheckerListWithoutClickedChecker;

    } else if (this.playerTurn === 'black') {
      this.playerTurn = 'red';
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(this.blackCheckerList);
      newBlackCheckerListWithoutClickedChecker = newBlackCheckerListWithoutClickedChecker.filter((checker) => {
        return !(checker.x === oldCoordinates[0] & checker.y === oldCoordinates[1]);
      });
      newBlackCheckerListWithoutClickedChecker.push({
        x: newCoordinates[0],
        y: newCoordinates[1],
        isKing: isKingNow === true ? true : isCheckerKing,
      });
      this.blackCheckerList = newBlackCheckerListWithoutClickedChecker;

      // Execute Jump.
      let newRedCheckerListWithoutClickedChecker = cloneDeep(this.redCheckerList);
      newRedCheckerListWithoutClickedChecker = newRedCheckerListWithoutClickedChecker.filter((checker) => {
        return !(checker.x === potentialJumpedCoordinate[0] & checker.y === potentialJumpedCoordinate[1]);
      })
      this.redCheckerList = newRedCheckerListWithoutClickedChecker;
    } else {
      throw `playerTurn is an invalid turn. Got ${this.playerTurn} instead.`
    }
    this.setGameStatus();
  }

  // Random AI

  getLegalCheckerFromList(checkerList) {
    let hasNotFoundCheckerWithLegalMove = true;
    let availableMoves;
    let checker;

    while (hasNotFoundCheckerWithLegalMove) {
      checker = checkerList[Math.floor(Math.random() * checkerList.length)];
      availableMoves = this.getAvailableMoves(checker.x, checker.y, checker.isKing);
      if (availableMoves.length > 0) {
        hasNotFoundCheckerWithLegalMove = false;
      }
    }
    return {
      availableMoves: availableMoves,
      checker: checker,
    };
  }

  executeRandomMove() {
    let checkerList;
    if (this.playerTurn === 'red') {
      checkerList = this.redCheckerList;
    } else {
      checkerList = this.blackCheckerList;
    }
    const { availableMoves, checker } = this.getLegalCheckerFromList(checkerList);
    this.doMove(
      [checker.x, checker.y],
      availableMoves[Math.floor(Math.random() * availableMoves.length)],
      checker.isKing,
    )
  }

  undoMove() {
    alert('hey');
    // if (playerTurn === 'black') {
    //   let newRedCheckerListWithoutClickedChecker = cloneDeep(redCheckerList);
    //   newRedCheckerListWithoutClickedChecker.push(window.justDeleted);
    //   newRedCheckerListWithoutClickedChecker = newRedCheckerListWithoutClickedChecker.filter((checker) => {
    //     return !(checker.x === window.justAdded.x & checker.y === window.justAdded.y);
    //   });
    //   setRedCheckerList(newRedCheckerListWithoutClickedChecker);
    //   setPlayerTurn(playerTurn === 'red' ? 'black' : 'red');
    // } else if (playerTurn === 'red') {
    //   let newBlackCheckerListWithoutClickedChecker = cloneDeep(blackCheckerList);
    //   newBlackCheckerListWithoutClickedChecker.push(window.justDeleted);
    //   newBlackCheckerListWithoutClickedChecker = newBlackCheckerListWithoutClickedChecker.filter((checker) => {
    //     return !(checker.x === window.justAdded.x & checker.y === window.justAdded.y);
    //   });
    //   setBlackCheckerList(newBlackCheckerListWithoutClickedChecker);
    //   setPlayerTurn(playerTurn === 'red' ? 'black' : 'red');
    // }
  }


}

export default CheckerGameState;