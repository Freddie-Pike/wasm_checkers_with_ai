import _ from 'lodash'

export function checkIfOutOfBounds(x, y) {
  if (x < 0 || x > 7) {
    return false
  }
  if (y < 0 || y > 7) {
    return false
  }

  return true;
}

export function checkIfMoveIsInCheckerList(x, y, checkerList) {
  let foundChecker = _.find(checkerList, { x, y });
  if (foundChecker !== undefined) {
    return false
  }
  return true;
}

export function checkIfMoveIsInTypedArrayCheckerList(x, y, checkerList) {
  let foundChecker = window.UIGameState.findChecker(x, y, checkerList);
  if (foundChecker !== null) {
    return false
  }
  return true;
}