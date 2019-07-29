import { cloneDeep } from 'lodash'

const INFINITY = 1000000;
const NEGATIVE_INFINITY = -1000000;

class AlphaBeta {
  constructor(maxDepth, player) {
    this.maxDepth = maxDepth;
    this.currentMaxDepth = maxDepth; // Maybe unneeded?
    this.player = player;
    this.gameState = cloneDeep(window.UIGameState);
    this.timeStart = 0; // Not implemented yet, but should probably be later.
    this.tempBestMove = 0;
    this.tempBestMoveSelectedPiece = 0;
    this.reset();
  }

  reset() {
    this.gameState = cloneDeep(window.UIGameState);
    this.tempBestMove = null;
    this.tempBestMoveSelectedPiece = null;
  }

  getMove() {
    this.reset();
    let alphaBetaValue = this.alpha_beta_algorithm(this.gameState, 0, NEGATIVE_INFINITY, INFINITY, true);
    return this.tempBestMove;
  }

  isTerminal(state, depth) {
    if (this.currentMaxDepth > 0 && depth >= this.currentMaxDepth) {
      return true;
    }
    return state.hasGameEnded === true; // Change function to return value.
  }

  alpha_beta_algorithm(state, depth, alpha, beta, max_player) {
    if (this.isTerminal(state, depth)) {
      return state.stateEvaluation(this.player);
    }

    if (state.playerTurn === 'red') {
      for (let i = 0; i < state.redCheckerList.length; i++) {
        let checker = state.redCheckerList[i];
        let availableMoves = state.getAvailableMoves(checker.x, checker.y, checker.isKing);
        for (let j = 0; j < availableMoves.length; j++) {
          let availableMove = availableMoves[j]
          state.doMove([checker.x, checker.y], [availableMove[0], availableMove[1]], checker.isKing);
          const {
            redJustCompletedMove,
            redJustCompletedMoveLastPosition,
            blackJustDeletedChecker,
          } = state
          let value = this.alpha_beta_algorithm(state, depth + 1, alpha, beta, false)
          state.undoMove(
            redJustCompletedMove,
            redJustCompletedMoveLastPosition,
            blackJustDeletedChecker,
          );
          if (max_player && value > alpha) {
            if (depth == 0) {
              this.tempBestMove = redJustCompletedMove;
              this.tempBestMoveSelectedPiece = redJustCompletedMoveLastPosition;
            }
            alpha = value
          }
          else if (!max_player && value < beta) {
            beta = value;
          }
          if (alpha >= beta) {
            break;
          }
        }
      }
      if (max_player) {
        return alpha;
      } else {
        return beta;
      }
    } else if (state.playerTurn === 'black') {
      for (let i = 0; i < state.blackCheckerList.length; i++) {
        let checker = state.blackCheckerList[i];
        let availableMoves = state.getAvailableMoves(checker.x, checker.y, checker.isKing);
        for (let j = 0; j < availableMoves.length; j++) {
          let availableMove = availableMoves[j]
          state.doMove([checker.x, checker.y], [availableMove[0], availableMove[1]], checker.isKing);
          const {
            blackJustCompletedMove,
            blackJustCompletedMoveLastPosition,
            redJustDeletedChecker,
          } = state
          let value = this.alpha_beta_algorithm(state, depth + 1, alpha, beta, false)
          state.undoMove(
            blackJustCompletedMove,
            blackJustCompletedMoveLastPosition,
            redJustDeletedChecker,
          );
          if (max_player && value > alpha) {
            if (depth == 0) {
              this.tempBestMove = blackJustCompletedMove;
              this.tempBestMoveSelectedPiece = blackJustCompletedMoveLastPosition;
            }
            alpha = value
          }
          else if (!max_player && value < beta) {
            beta = value;
          }
          if (alpha >= beta) {
            break;
          }
        }
      }
      if (max_player) {
        return alpha;
      } else {
        return beta;
      }
    }
  }
}

export default AlphaBeta;