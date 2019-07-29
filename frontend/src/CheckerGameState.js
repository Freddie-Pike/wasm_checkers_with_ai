import { cloneDeep, pullAt, remove } from 'lodash'

import { RED_MOVE_COORDINATES, BLACK_MOVE_COORDINATES, KING_MOVE_COORDINATES } from './config';
import { checkIfOutOfBounds, checkIfMoveIsInCheckerList } from './helpers';
import {
  TEST_RED_CHECKER_LIST,
  TEST_BLACK_CHECKER_LIST,
  KINGABLE_RED_CHECKER_LIST,
  KINGABLE_BLACK_CHECKER_LIST,
  RED_ABOUT_TO_WIN_RED_CHECKERS,
  RED_ABOUT_TO_WIN_BLACK_CHECKERS,
  BLACK_CHECKER_IN_CORNER_RED_CHECKERS,
  BLACK_CHECKER_IN_CORNER_BLACK_CHECKERS,
} from './config';

const INFINITY = 1000000;
const NEGATIVE_INFINITY = -1000000;

class CheckerGameState {
  constructor() {
    this.redCheckerList = RED_ABOUT_TO_WIN_RED_CHECKERS;
    this.blackCheckerList = RED_ABOUT_TO_WIN_BLACK_CHECKERS;
    this.playerTurn = 'black';
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
    if (this.redCheckerList.length === 0 || this.blackCheckerList.length === 0) {
      this.hasGameEnded = true;
      this.winner = this.playerTurn === 'red' ? 'black' : 'red';
    } else {
      this.hasGameEnded = false;
      this.winner = null;
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
      let removedChecker = remove(newRedCheckerListWithoutClickedChecker, (checker) => {
        return checker.x === oldCoordinates[0] & checker.y === oldCoordinates[1];
      });
      let newRedChecker = {
        x: newCoordinates[0],
        y: newCoordinates[1],
        isKing: isKingNow === true ? true : isCheckerKing,
      }
      this.redJustCompletedMoveLastPosition = removedChecker[0];
      this.redJustCompletedMove = newRedChecker;
      newRedCheckerListWithoutClickedChecker.push(newRedChecker);
      this.redCheckerList = newRedCheckerListWithoutClickedChecker;

      // Execute Jump.
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(this.blackCheckerList);
      let removedBlackChecker = remove(newBlackCheckerListWithoutClickedChecker, (checker) => {
        return checker.x === potentialJumpedCoordinate[0] & checker.y === potentialJumpedCoordinate[1];
      });
      if (removedBlackChecker.length > 0) {
        this.blackJustDeletedChecker = removedBlackChecker[0];
        this.blackCheckerList = newBlackCheckerListWithoutClickedChecker;
      } else {
        this.blackJustDeletedChecker = null;
      }
    } else if (this.playerTurn === 'black') {
      this.playerTurn = 'red';
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(this.blackCheckerList);
      let removedChecker = remove(newBlackCheckerListWithoutClickedChecker, (checker) => {
        return checker.x === oldCoordinates[0] & checker.y === oldCoordinates[1];
      });
      let newBlackChecker = {
        x: newCoordinates[0],
        y: newCoordinates[1],
        isKing: isKingNow === true ? true : isCheckerKing,
      }
      this.blackJustCompletedMoveLastPosition = removedChecker[0];
      this.blackJustCompletedMove = newBlackChecker;
      newBlackCheckerListWithoutClickedChecker.push(newBlackChecker);
      this.blackCheckerList = newBlackCheckerListWithoutClickedChecker;

      // Execute Jump.
      let newRedCheckerListWithoutClickedChecker = cloneDeep(this.redCheckerList);
      let removedRedChecker = remove(newRedCheckerListWithoutClickedChecker, (checker) => {
        return checker.x === potentialJumpedCoordinate[0] & checker.y === potentialJumpedCoordinate[1];
      });
      if (removedRedChecker.length > 0) {
        this.redJustDeletedChecker = removedRedChecker[0];
        this.redCheckerList = newRedCheckerListWithoutClickedChecker;
      } else {
        this.redJustDeletedChecker = null;
      }
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

  undoMove(justCompletedMove, justCompletedMoveLastPosition, justDeletedMove = null) {
    if (this.playerTurn === 'black') {
      let newRedCheckerListWithoutClickedChecker = cloneDeep(this.redCheckerList);
      newRedCheckerListWithoutClickedChecker.push(justCompletedMoveLastPosition);
      remove(newRedCheckerListWithoutClickedChecker, (checker) => {
        return checker.x === justCompletedMove.x & checker.y === justCompletedMove.y;
      });
      this.redCheckerList = newRedCheckerListWithoutClickedChecker;

      // UndoJump
      if (justDeletedMove !== null) {
        this.blackCheckerList.push(justDeletedMove);
      }

    } else if (this.playerTurn === 'red') {
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(this.blackCheckerList);
      newBlackCheckerListWithoutClickedChecker.push(justCompletedMoveLastPosition);
      remove(newBlackCheckerListWithoutClickedChecker, (checker) => {
        return checker.x === justCompletedMove.x & checker.y === justCompletedMove.y;
      });
      this.blackCheckerList = newBlackCheckerListWithoutClickedChecker;

      // UndoJump
      if (justDeletedMove !== null) {
        this.redCheckerList.push(justDeletedMove);
      }
    }
    this.playerTurn = this.playerTurn === 'red' ? 'black' : 'red';
    this.setGameStatus();
  }

  undoLastMove() {
    if (this.playerTurn === 'black') {
      let newRedCheckerListWithoutClickedChecker = cloneDeep(this.redCheckerList);
      newRedCheckerListWithoutClickedChecker.push(this.redJustCompletedMoveLastPosition);
      remove(newRedCheckerListWithoutClickedChecker, (checker) => {
        return checker.x === this.redJustCompletedMove.x & checker.y === this.redJustCompletedMove.y;
      });
      this.redCheckerList = newRedCheckerListWithoutClickedChecker;

      // UndoJump
      if (this.blackJustDeletedChecker !== null) {
        this.blackCheckerList.push(this.blackJustDeletedChecker);
      }
    } else if (this.playerTurn === 'red') {
      let newBlackCheckerListWithoutClickedChecker = cloneDeep(this.blackCheckerList);
      newBlackCheckerListWithoutClickedChecker.push(this.blackJustCompletedMoveLastPosition);
      remove(newBlackCheckerListWithoutClickedChecker, (checker) => {
        return checker.x === this.blackJustCompletedMove.x & checker.y === this.blackJustCompletedMove.y;
      });
      this.blackCheckerList = newBlackCheckerListWithoutClickedChecker;

      // UndoJump
      if (this.redJustDeletedChecker !== null) {
        this.redCheckerList.push(this.redJustDeletedChecker);
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
        score += (this.redCheckerList.length - this.blackCheckerList.length) * 100;
        score += Math.floor(Math.random() * 5) + 1
      } else if (player === 'black') {
        score += (this.blackCheckerList.length - this.redCheckerList.length) * 100;
        score += Math.floor(Math.random() * 5) + 1
      } else {
        throw "Unrecognized player"
      }
    }
    return score
  }
}

export default CheckerGameState;