import { cloneDeep } from 'lodash'

const INFINITY = 1000000;
const NEGATIVE_INFINITY = -1000000;

class AlphaBeta {
  constructor(maxDepth, player) {
    this.maxDepth = maxDepth;
    this.currentMaxDepth = maxDepth; // Maybe unneeded?
    this.player = player;
    this.gameState = cloneDeep(window.UIGameState);
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
    // NOTE: alphaBetaValue returned currently isn't used. Can probably remove
    // the return value once I determine the return values are the same once
    // in Rust the version once I implement it.
    let alphaBetaValue = this.alpha_beta_algorithm(this.gameState, 0, NEGATIVE_INFINITY, INFINITY, true);
    return this.tempBestMove;
  }

  isTerminal(state, depth) {
    if (this.currentMaxDepth > 0 && depth >= this.currentMaxDepth) {
      return true;
    }
    return state.hasGameEnded === true;
  }

  alpha_beta_algorithm(state, depth, alpha, beta, max_player) {
    if (this.isTerminal(state, depth)) {
      return state.stateEvaluation(this.player);
    }

    if (state.playerTurn === 'red') {
      for (let i = 0; i < state.redCheckerList.length; i += 4) {
        let checker = {
          x: state.redCheckerList[i],
          y: state.redCheckerList[i + 1],
          isKing: state.redCheckerList[i + 2],
        };
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
      for (let i = 0; i < state.blackCheckerList.length; i += 4) {
        let checker = {
          x: state.blackCheckerList[i],
          y: state.blackCheckerList[i + 1],
          isKing: state.blackCheckerList[i + 2],
        };
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