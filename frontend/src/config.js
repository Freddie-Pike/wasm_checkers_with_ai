// Test Checker sets.
export const TEST_RED_CHECKER_LIST = [
  {
    "x": 1, "y": 1, "isKing": true,
  },
  {
    "x": 3, "y": 3, "isKing": true,
  },
  {
    "x": 4, "y": 6, "isKing": false,
  }
]

export const TEST_BLACK_CHECKER_LIST = [
  {
    "x": 2, "y": 2, "isKing": false,
  },
  {
    "x": 2, "y": 4, "isKing": true,
  },
  {
    "x": 6, "y": 6, "isKing": false,
  },
  {
    "x": 7, "y": 7, "isKing": true,
  }
]

export const RED_ABOUT_TO_WIN_RED_CHECKERS = [
  {
    "x": 3, "y": 3, "isKing": true,
  }
]

export const RED_ABOUT_TO_WIN_BLACK_CHECKERS = [
  {
    "x": 2, "y": 2, "isKing": true,
  },
]

export const BLACK_CHECKER_IN_CORNER_RED_CHECKERS = [
  {
    "x": 3, "y": 3, "isKing": true,
  }
]

export const BLACK_CHECKER_IN_CORNER_BLACK_CHECKERS = [
  {
    "x": 6, "y": 6, "isKing": true,
  },
  {
    "x": 2, "y": 0, "isKing": true,
  },
]


// Game logic.
export const KINGABLE_RED_CHECKER_LIST = [
  {
    "x": 0, "y": 0
  },
  {
    "x": 2, "y": 0
  },
  {
    "x": 4, "y": 0
  },
  {
    "x": 6, "y": 0
  },
]

export const KINGABLE_BLACK_CHECKER_LIST = [
  {
    "x": 1, "y": 7,
  },
  {
    "x": 3, "y": 7,
  },
  {
    "x": 5, "y": 7,
  },
  {
    "x": 7, "y": 7,
  }
]

export const KING_MOVE_COORDINATES = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1]
]

export const RED_MOVE_COORDINATES = [
  [1, -1],
  [-1, -1],
]

export const BLACK_MOVE_COORDINATES = [
  [1, 1],
  [-1, 1],
]