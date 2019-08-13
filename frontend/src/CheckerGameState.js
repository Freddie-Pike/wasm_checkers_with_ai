import { cloneDeep, pullAt, remove } from 'lodash'

import { RED_MOVE_COORDINATES, BLACK_MOVE_COORDINATES, KING_MOVE_COORDINATES } from './config';
import { checkIfOutOfBounds, checkIfMoveIsInCheckerList, checkIfMoveIsInTypedArrayCheckerList } from './helpers';
import {
  TEST_RED_CHECKER_LIST,
  TEST_BLACK_CHECKER_LIST,
  KINGABLE_RED_CHECKER_LIST,
  KINGABLE_BLACK_CHECKER_LIST,
  RED_ABOUT_TO_WIN_RED_CHECKERS,
  RED_ABOUT_TO_WIN_BLACK_CHECKERS,
  BLACK_CHECKER_IN_CORNER_RED_CHECKERS,
  BLACK_CHECKER_IN_CORNER_BLACK_CHECKERS,
  RED_ABOUT_TO_WIN_RED_CHECKERS_TYPED_ARRAY,
  RED_ABOUT_TO_WIN_BLACK_CHECKERS_TYPED_ARRAY,
  TEST_RED_CHECKER_LIST_TYPED_ARRAY,
  TEST_BLACK_CHECKER_LIST_TYPED_ARRAY,
} from './config';

const INFINITY = 1000000;
const NEGATIVE_INFINITY = -1000000;

class CheckerGameState {
  constructor() {
    this.redCheckerList = RED_ABOUT_TO_WIN_RED_CHECKERS_TYPED_ARRAY;
    this.blackCheckerList = RED_ABOUT_TO_WIN_BLACK_CHECKERS_TYPED_ARRAY;
    this.playerTurn = 'red';
    this.hasGameEnded = false;
    this.winner = null;

    // UndoMove Move.
    // For Red
    this.redJustCompletedMove = null;
    this.redJustCompletedMoveLastPosition = null;
    this.blackJustDeletedChecker = null;
    // For Black
    this.blackJustCompletedMove = null;
    this.blackJustCompletedMoveLastPosition = null;
    this.redJustDeletedChecker = null;


  }

  setGameStatus() {
    if (this.getActiveCheckers(this.redCheckerList) === 0 || this.getActiveCheckers(this.blackCheckerList) === 0) {
      this.hasGameEnded = true;
      this.winner = this.playerTurn === 'red' ? 'black' : 'red';
    } else {
      this.hasGameEnded = false;
      this.winner = null;
    }
  }

  getMoveCoordinates(isKing) {
    let moveCoordinates;
    // NOTE: I need to cloneDeep the coordinates so I don't modify the import.
    if (isKing) {
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

  determineIfValidMoveInTypedArray(x, y) {
    return checkIfOutOfBounds(x, y) &&
      checkIfMoveIsInTypedArrayCheckerList(x, y, this.redCheckerList) &&
      checkIfMoveIsInTypedArrayCheckerList(x, y, this.blackCheckerList);
  }

  getAvailableMoves(x, y, isKing) {
    let moveCoordinates = this.getMoveCoordinates(isKing);
    let indicesToRemove = [];
    // TODO: Instead of for each, use a normal for loop so it converts over 
    // to Rust better.
    moveCoordinates.forEach((moveCoordinate, index, moveCoordinatesArray) => {
      let newX = moveCoordinate[0] + x;
      let newY = moveCoordinate[1] + y;
      let jumpedChecker;

      if (this.playerTurn === 'red') {
        jumpedChecker = this.findChecker(newX, newY, this.blackCheckerList);
      } else if (this.playerTurn === 'black') {
        jumpedChecker = this.findChecker(newX, newY, this.redCheckerList);
      }

      if (jumpedChecker !== null) {
        newX += moveCoordinate[0];
        newY += moveCoordinate[1];
      }
      if (this.determineIfValidMoveInTypedArray(newX, newY)) {
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

    // Create function to filter array.
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

  // TODO: I don't think I need to use cloneDeep in this function anymore, 
  // should check this and replace it.
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
      let removedChecker = this.removeChecker(
        oldCoordinates[0],
        oldCoordinates[1],
        newRedCheckerListWithoutClickedChecker,
      );
      let newRedChecker = {
        x: newCoordinates[0],
        y: newCoordinates[1],
        isKing: isKingNow === true ? true : isCheckerKing,
      }
      this.redJustCompletedMoveLastPosition = removedChecker;
      this.redJustCompletedMove = newRedChecker;
      this.updateChecker(
        oldCoordinates[0],
        oldCoordinates[1],
        newRedChecker.x,
        newRedChecker.y,
        newRedChecker.isKing,
        true,
        newRedCheckerListWithoutClickedChecker,
      );
      this.redCheckerList = newRedCheckerListWithoutClickedChecker;

      // Execute Jump.
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(this.blackCheckerList);
      let removedBlackChecker = this.removeChecker(
        potentialJumpedCoordinate[0],
        potentialJumpedCoordinate[1],
        newBlackCheckerListWithoutClickedChecker,
      );
      if (removedBlackChecker !== null) {
        this.blackJustDeletedChecker = removedBlackChecker;
        this.blackCheckerList = newBlackCheckerListWithoutClickedChecker;
      } else {
        this.blackJustDeletedChecker = null;
      }
    } else if (this.playerTurn === 'black') {
      this.playerTurn = 'red';
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(this.blackCheckerList);
      let removedChecker = this.removeChecker(
        oldCoordinates[0],
        oldCoordinates[1],
        newBlackCheckerListWithoutClickedChecker,
      );
      let newBlackChecker = {
        x: newCoordinates[0],
        y: newCoordinates[1],
        isKing: isKingNow === true ? true : isCheckerKing,
      }
      this.blackJustCompletedMoveLastPosition = removedChecker;
      this.blackJustCompletedMove = newBlackChecker;
      this.updateChecker(
        oldCoordinates[0],
        oldCoordinates[1],
        newBlackChecker.x,
        newBlackChecker.y,
        newBlackChecker.isKing,
        true,
        newBlackCheckerListWithoutClickedChecker,
      )
      this.blackCheckerList = newBlackCheckerListWithoutClickedChecker;

      // Execute Jump.
      let newRedCheckerListWithoutClickedChecker = cloneDeep(this.redCheckerList);
      let removedRedChecker = this.removeChecker(
        potentialJumpedCoordinate[0],
        potentialJumpedCoordinate[1],
        newRedCheckerListWithoutClickedChecker,
      );
      if (removedRedChecker !== null) {
        this.redJustDeletedChecker = removedRedChecker;
        this.redCheckerList = newRedCheckerListWithoutClickedChecker;
      } else {
        this.redJustDeletedChecker = null;
      }
    } else {
      throw `playerTurn is an invalid turn. Got ${this.playerTurn} instead.`
    }
    this.setGameStatus();
  }

  // NOTE: Used for random AI move.
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

  undoMove(justCompletedMove, justCompletedMoveLastPosition, justDeletedMove = null) {
    if (this.playerTurn === 'black') {
      let newRedCheckerListWithoutClickedChecker = cloneDeep(this.redCheckerList);
      this.updateChecker(
        justCompletedMove.x,
        justCompletedMove.y,
        justCompletedMoveLastPosition.x,
        justCompletedMoveLastPosition.y,
        justCompletedMoveLastPosition.isKing,
        true,
        newRedCheckerListWithoutClickedChecker,
      );
      this.redCheckerList = newRedCheckerListWithoutClickedChecker;

      // UndoJump
      if (justDeletedMove !== null) {
        this.updateChecker(
          justDeletedMove.x,
          justDeletedMove.y,
          justDeletedMove.x,
          justDeletedMove.y,
          justDeletedMove.isKing,
          true,
          this.blackCheckerList,
        );
      }

    } else if (this.playerTurn === 'red') {
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(this.blackCheckerList);
      this.updateChecker(
        justCompletedMove.x,
        justCompletedMove.y,
        justCompletedMoveLastPosition.x,
        justCompletedMoveLastPosition.y,
        justCompletedMoveLastPosition.isKing,
        true,
        newBlackCheckerListWithoutClickedChecker,
      );
      this.blackCheckerList = newBlackCheckerListWithoutClickedChecker;

      // UndoJump
      if (justDeletedMove !== null) {
        this.updateChecker(
          justDeletedMove.x,
          justDeletedMove.y,
          justDeletedMove.x,
          justDeletedMove.y,
          justDeletedMove.isKing,
          true,
          this.redCheckerList,
        );
      }
    }
    this.playerTurn = this.playerTurn === 'red' ? 'black' : 'red';
    this.setGameStatus();
  }

  stateEvaluation(player) {
    let score = 0;

    if (this.winner === player && this.hasGameEnded) {
      score = INFINITY;
    } else if (this.hasGameEnded) {
      score = NEGATIVE_INFINITY;
    } else {
      if (player === 'red') {
        score += (this.getActiveCheckers(this.redCheckerList) - this.getActiveCheckers(this.blackCheckerList)) * 100;
      } else if (player === 'black') {
        score += (this.getActiveCheckers(this.blackCheckerList) - this.getActiveCheckers(this.redCheckerList)) * 100;
      } else {
        throw "Unrecognized player"
      }
    }
    return score
  }

  // TypedArray functions
  // TODO: The below functions should go in a separate function.
  getActiveCheckers(checkerList) {
    let activeCounter = 0;
    for (let i = 0; i < checkerList.length; i += 4) {
      if (checkerList[i + 3]) {
        activeCounter += 1;
      }
    }
    return activeCounter;
  }

  removeChecker(x, y, checkerList, shouldFindRemovedCheckers = false) {
    let removedChecker;
    for (let i = 0; i < checkerList.length; i += 4) {
      if (checkerList[i] === x && checkerList[i + 1] === y) {
        if (shouldFindRemovedCheckers) {
          checkerList[i + 3] = 0;
          removedChecker = {
            x: checkerList[i],
            y: checkerList[i + 1],
            isKing: checkerList[i + 2],
          }
        } else if (checkerList[i + 3] === 1) {
          checkerList[i + 3] = 0;
          removedChecker = {
            x: checkerList[i],
            y: checkerList[i + 1],
            isKing: checkerList[i + 2],
          }
        }
      }
    }
    return removedChecker;
  }

  updateChecker(oldX, oldY, x, y, isKing, activeStatus, checkerList) {
    let didUpdate = false;
    let updatedChecker;
    for (let i = 0; i < checkerList.length; i += 4) {
      if (checkerList[i] === oldX && checkerList[i + 1] === oldY) {
        checkerList[i] = x;
        checkerList[i + 1] = y;
        checkerList[i + 2] = isKing;
        checkerList[i + 3] = activeStatus;

        updatedChecker = {
          x: checkerList[i],
          y: checkerList[i + 1],
          isKing: checkerList[i + 2],
        }
        didUpdate = true;
        break;
      }
    }
    if (!didUpdate) {
      throw "Didn't update checker in updateChecker"
    }
    return updatedChecker;
  }

  findChecker(x, y, checkerList, shouldFindRemovedCheckers = false) {
    let foundChecker = null;
    for (let i = 0; i < checkerList.length; i += 4) {
      if (checkerList[i] === x && checkerList[i + 1] === y) {
        if (shouldFindRemovedCheckers) {
          foundChecker = {
            x: checkerList[i],
            y: checkerList[i + 1],
            isKing: checkerList[i + 2],
          }
        } else if (checkerList[i + 3] === 1) {
          foundChecker = {
            x: checkerList[i],
            y: checkerList[i + 1],
            isKing: checkerList[i + 2],
          }
        }
      }
    }
    return foundChecker;
  }
}

export default CheckerGameState;