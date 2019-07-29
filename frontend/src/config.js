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


// Typed Array versions:
// Each typed array has 4 values for each piece on the board. They represent:
// 0 --> x position. Values from 0-7.
// 1 --> y position. Values from 0-7.
// 2 --> is the checker a king. Values from 0-1.
// 3 --> is active. If 0 the checker won't appear on the board. Values from 0-1.
export const RED_ABOUT_TO_WIN_RED_CHECKERS_TYPED_ARRAY = new Int8Array(
  RED_ABOUT_TO_WIN_RED_CHECKERS.length * 4
);
for (let i = 0; i < RED_ABOUT_TO_WIN_RED_CHECKERS_TYPED_ARRAY.length; i += 4) {
  RED_ABOUT_TO_WIN_RED_CHECKERS_TYPED_ARRAY[i] = RED_ABOUT_TO_WIN_RED_CHECKERS[i / 4].x;
  RED_ABOUT_TO_WIN_RED_CHECKERS_TYPED_ARRAY[i + 1] = RED_ABOUT_TO_WIN_RED_CHECKERS[i / 4].y;
  RED_ABOUT_TO_WIN_RED_CHECKERS_TYPED_ARRAY[i + 2] = RED_ABOUT_TO_WIN_RED_CHECKERS[i / 4].isKing;
  RED_ABOUT_TO_WIN_RED_CHECKERS_TYPED_ARRAY[i + 3] = 1;
}

export const TEST_RED_CHECKER_LIST_TYPED_ARRAY = new Int8Array(
  TEST_RED_CHECKER_LIST.length * 4
);
for (let i = 0; i < TEST_RED_CHECKER_LIST_TYPED_ARRAY.length; i += 4) {
  TEST_RED_CHECKER_LIST_TYPED_ARRAY[i] = TEST_RED_CHECKER_LIST[i / 4].x;
  TEST_RED_CHECKER_LIST_TYPED_ARRAY[i + 1] = TEST_RED_CHECKER_LIST[i / 4].y;
  TEST_RED_CHECKER_LIST_TYPED_ARRAY[i + 2] = TEST_RED_CHECKER_LIST[i / 4].isKing;
  TEST_RED_CHECKER_LIST_TYPED_ARRAY[i + 3] = 1;
}