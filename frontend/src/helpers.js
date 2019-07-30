export function checkIfOutOfBounds(x, y) {
  // TODO: Replace "7" with a const variable since this is a magic number at the moment.
  if (x < 0 || x > 7) {
    return false
  }
  if (y < 0 || y > 7) {
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