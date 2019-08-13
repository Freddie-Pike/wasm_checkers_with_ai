use core::panic::PanicInfo;
use wasm_bindgen::prelude::*;

// Called when the wasm module is instantiated
#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    // Use `web_sys`'s global `window` function to get a handle on the global
    // window object.
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");
    let body = document.body().expect("document should have a body");

    // Manufacture the element we're gonna append
    // let val = document.create_element("p")?;
    // val.set_inner_html("Hello from Rust!");
    // body.append_child(&val)?;

    Ok(())
}

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}



#[wasm_bindgen]
#[derive(Clone,Debug)]
pub struct CheckerGameState {
  red_checker_list: Vec<isize>,
  black_checker_list: Vec<isize>,
  player_turn: String,
  has_game_ended: bool,
  winner: String,


  // UndoMove Move.
  // For Red undo.
  red_just_completed_move: Vec<isize>,
  red_just_completed_move_last_position: Vec<isize>,
  black_just_deleted_checker: Vec<isize>,
  // For Black undo.
  black_just_completed_move: Vec<isize>,
  black_just_completed_move_last_position: Vec<isize>,
  red_just_deleted_checker: Vec<isize>,

  // constants
  KING_MOVE_COORDINATES: Vec<Vec<isize>>,
  RED_MOVE_COORDINATES: Vec<Vec<isize>>,
  BLACK_MOVE_COORDINATES: Vec<Vec<isize>>,
  KINGABLE_RED_CHECKER_LIST: Vec<Vec<isize>>,
  KINGABLE_BLACK_CHECKER_LIST: Vec<Vec<isize>>,
  INFINITY: isize,
  NEGATIVE_INFINITY: isize,
}

#[wasm_bindgen]
impl CheckerGameState {
  #[wasm_bindgen(constructor)]
  pub fn new() -> CheckerGameState {
    CheckerGameState {
      red_checker_list: [3, 3, 1, 1].to_vec(),
      black_checker_list: [2, 2, 1, 1].to_vec(),
      player_turn: "black".to_string(), 
      has_game_ended: false,
      winner: "".to_string(),
      // Undo Move Variable
      // For Red undo.
      red_just_completed_move: [].to_vec(),
      red_just_completed_move_last_position: [].to_vec(),
      black_just_deleted_checker: [].to_vec(),
      // For Black undo.
      black_just_completed_move: [].to_vec(),
      black_just_completed_move_last_position: [].to_vec(),
      red_just_deleted_checker: [].to_vec(),

      // constants
      KING_MOVE_COORDINATES: [
        [1, 1].to_vec(),
        [-1, 1].to_vec(),
        [-1, -1].to_vec(),
        [1, -1].to_vec(),
      ].to_vec(),
      RED_MOVE_COORDINATES: [
        [1, 1].to_vec(),
        [-1, 1].to_vec(),
      ].to_vec(),
      BLACK_MOVE_COORDINATES: [
        [1, 1].to_vec(),
        [-1, 1].to_vec(),
      ].to_vec(),
      KINGABLE_RED_CHECKER_LIST: [
        [0, 0].to_vec(),
        [2, 0].to_vec(),
        [4, 0].to_vec(),
        [6, 0].to_vec(),
      ].to_vec(),
      KINGABLE_BLACK_CHECKER_LIST: [
        [1, 7].to_vec(),
        [3, 7].to_vec(),
        [5, 7].to_vec(),
        [7, 7].to_vec(),
      ].to_vec(),
      INFINITY: 1000000,
      NEGATIVE_INFINITY: -1000000,
    }
  }

  pub fn get_red_checker_list(&self) -> Vec<isize> {
    self.red_checker_list.clone()
  }

  pub fn get_black_checker_list(&self) -> Vec<isize> {
    self.black_checker_list.clone()
  }

  // uses function getActiveCheckers.
  fn set_game_status(&mut self) {
    // Count red checkers that are still active.
    let mut red_active_counter: usize = 0;
    let mut i: usize = 0;
    let red_checker_length = *&self.red_checker_list.len() as usize;
    while i < red_checker_length {
      if (self.red_checker_list[i + 3] == 1) {
        red_active_counter += 1;
      }
      i += 4;
    }

    // Count red checkers that are still active.
    let mut black_active_counter: usize = 0;
    let mut i: usize = 0;
    let black_checker_length = *&self.black_checker_list.len() as usize;
    while i < black_checker_length {
      if (self.black_checker_list[i + 3] == 1) {
        black_active_counter += 1;
      }
      i += 4;
    }

    if (red_active_counter == 0 || black_active_counter == 0) {
      self.has_game_ended = true;
      self.winner = if self.player_turn == "red" { "black".to_string() } else { "red".to_string() };
    } else {
      self.has_game_ended = false;
      self.winner = "".to_string();
    }
  }

  fn check_if_out_of_bounds(&self, x: isize, y: isize) -> bool {
    if (x < 0 || x > 7) {
      return false
    }
    if (y < 0 || y > 7) {
      return false
    }

    return true;
  }

  fn is_on_king_position(&self, new_coordinates: Vec<isize>) -> bool {
    let king_coordinates;
    let mut i: usize = 0;

    if (self.player_turn == "red") {
      king_coordinates = &self.KINGABLE_RED_CHECKER_LIST;
    } else {
      king_coordinates = &self.KINGABLE_BLACK_CHECKER_LIST;
    }

    let mut king_coordinates_length = *&king_coordinates.len() as usize;

    // Check if checker is in list.
    i = 0;
    while i < king_coordinates_length {
      if (king_coordinates[i][0] == new_coordinates[0] && king_coordinates[i][1] == new_coordinates[1]) {
        return true;
      }
      i += 1;
    }
    return false;
  }

  fn get_action_from_coordinates(&self, old_coordinates: Vec<isize>, new_coordinates: Vec<isize>) -> Vec<isize> {
    let action_taken = [
      new_coordinates[0] - old_coordinates[0],
      new_coordinates[1] - old_coordinates[1]
    ];
    let action_direction_row: isize;
    let action_direction_col: isize;

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

    return vec![action_direction_row, action_direction_col];
  }
  
  fn determine_if_valid_move(&self, x: isize, y: isize) -> bool {
    let mut found_checker = Vec::new();
    let mut should_find_removed_checkers = true;
    let mut red_checker_length = *&self.red_checker_list.len() as usize;
    let mut black_checker_length = *&self.black_checker_list.len() as usize;
    let mut i: usize = 0;

    // Check if red checker is in list.
    while i < red_checker_length {
      if (&self.red_checker_list[i] == &x && &self.red_checker_list[i + 1] == &y) {
        if (should_find_removed_checkers) {
          found_checker = vec![
            &self.red_checker_list[i], 
            &self.red_checker_list[i + 1], 
            &self.red_checker_list[i + 2]
          ]
        } else if (&self.red_checker_list[i + 3] == &1) {
          found_checker = vec![
            &self.red_checker_list[i], 
            &self.red_checker_list[i + 1], 
            &self.red_checker_list[i + 2]
          ]
        }
      }
      i += 4;
    }

    // Check if found_checker was found.
    let found_checker_length = found_checker.len();
    if (found_checker_length > 0) {
      return false;
    }

    // Check if black checker is in list.
    i = 0;
    while i < black_checker_length {
      if (&self.black_checker_list[i] == &x && &self.black_checker_list[i + 1] == &y) {
        if (should_find_removed_checkers) {
          found_checker = vec![
            &self.black_checker_list[i], 
            &self.black_checker_list[i + 1], 
            &self.black_checker_list[i + 2]
          ]
        } else if (&self.red_checker_list[i + 3] == &1) {
          found_checker = vec![
            &self.black_checker_list[i], 
            &self.black_checker_list[i + 1], 
            &self.black_checker_list[i + 2]
          ]
        }
      }
      i += 4;
    }

    // Check if found_checker was found.
    let found_checker_length = found_checker.len();
    if (found_checker_length > 0) {
      return false;
    }
    
    self.check_if_out_of_bounds(x, y)
  }

  fn get_available_moves(&self, x: isize, y: isize, is_king: isize) -> Vec<Vec<isize>> {
    let move_coordinates;
    if (is_king == 1) {
      move_coordinates = &self.KING_MOVE_COORDINATES;
    }
    else if (self.player_turn == "red") {
      move_coordinates = &self.RED_MOVE_COORDINATES;
    } else {
      move_coordinates = &self.BLACK_MOVE_COORDINATES;
    }
    

    let mut new_move_coordinates = Vec::new();
    for move_coordinate in move_coordinates.iter() {
      let mut new_x = move_coordinate[0] + x;
      let mut new_y = move_coordinate[1] + y;
      let mut found_checker = Vec::new();
      let mut should_find_removed_checkers = true;
      let mut red_checker_length = *&self.red_checker_list.len() as usize;
      let mut black_checker_length = *&self.black_checker_list.len() as usize;
      let mut i: usize = 0;

      if (self.player_turn == "red") {
        // Check if black checker is in list.
        while i < black_checker_length {
          if (&self.black_checker_list[i] == &new_x && &self.black_checker_list[i + 1] == &new_y) {
            if (should_find_removed_checkers) {
              found_checker = vec![
                &self.black_checker_list[i], 
                &self.black_checker_list[i + 1], 
                &self.black_checker_list[i + 2]
              ]
            } else if (&self.red_checker_list[i + 3] == &1) {
              found_checker = vec![
                &self.black_checker_list[i], 
                &self.black_checker_list[i + 1], 
                &self.black_checker_list[i + 2]
              ]
            }
          }
          i += 4;
        }
      } else if (self.player_turn == "black") {
        // Check if red checker is in list.
        while i < red_checker_length {
          if (&self.red_checker_list[i] == &new_x && &self.red_checker_list[i + 1] == &new_y) {
            if (should_find_removed_checkers) {
              found_checker = vec![
                &self.red_checker_list[i], 
                &self.red_checker_list[i + 1], 
                &self.red_checker_list[i + 2]
              ]
            } else if (&self.red_checker_list[i + 3] == &1) {
              found_checker = vec![
                &self.red_checker_list[i], 
                &self.red_checker_list[i + 1], 
                &self.red_checker_list[i + 2]
              ]
            }
          }
          i += 4;
        }
      }

      // Check if found_checker was found.
      let found_checker_length = found_checker.len();
      if (found_checker_length > 0) {
        new_x += move_coordinate[0];
        new_y += move_coordinate[1];
      }

      if (self.determine_if_valid_move(new_x, new_y)) {
        new_move_coordinates.push(vec![new_x, new_y]);
      }
    }
    new_move_coordinates
  }

  pub fn do_move(&mut self, old_coordinates: Vec<isize>, new_coordinates: Vec<isize>, is_checker_king: isize) {
    // Find out if on king position.
    let mut is_king_now: bool = false;
    let king_coordinates;
    let mut i: usize = 0;

    if (self.player_turn == "red") {
      king_coordinates = &self.KINGABLE_RED_CHECKER_LIST;
    } else {
      king_coordinates = &self.KINGABLE_BLACK_CHECKER_LIST;
    }

    let mut king_coordinates_length = *&king_coordinates.len() as usize;

    // Check if checker is in list.
    i = 0;
    while i < king_coordinates_length {
      if (king_coordinates[i][0] == new_coordinates[0] && king_coordinates[i][1] == new_coordinates[1]) {
        is_king_now = true;
      }
      i += 1;
    }

    let action_taken = [
      new_coordinates[0] - old_coordinates[0],
      new_coordinates[1] - old_coordinates[1]
    ];
    let action_direction_row: isize;
    let action_direction_col: isize;

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

    let action_coordinates = vec![action_direction_row, action_direction_col];

    let potential_jumped_coordinate = [
      old_coordinates[0] + action_coordinates[0],
      old_coordinates[1] + action_coordinates[1],
    ];

    potential_jumped_coordinate.to_vec();

    if (self.player_turn == "red") {
      self.player_turn = "black".to_string();
      // remove_red_checker_list()
      i = 0;
      let mut checker_list_length = *&self.red_checker_list.len() as usize;
      let mut removed_checker = vec![];

      println!("self.red_checker_list {:#?}", self.red_checker_list);

      while (i < checker_list_length) {
        if (self.red_checker_list[i] == old_coordinates[0] && self.red_checker_list[i + 1] == old_coordinates[1]) {
          self.red_checker_list[i + 3] = 0;
          removed_checker.push(self.red_checker_list[i]);
          removed_checker.push(self.red_checker_list[i + 1]);
          removed_checker.push(self.red_checker_list[i + 2]);
          removed_checker.push(self.red_checker_list[i + 3]);
          break;
        }
        i += 4;
      }
      println!("removed_checker {:#?}", removed_checker);

      let mut is_new_checker_king: isize = 0;
      if is_king_now == true { 
        is_new_checker_king = 1;
      } else { 
        if (is_checker_king == 1) {
          is_new_checker_king = 1;
        } 
      } 
      let mut new_red_checker = vec![
        new_coordinates[0], 
        new_coordinates[1], 
        is_new_checker_king,
      ];
      self.red_just_completed_move_last_position = removed_checker;
      self.red_just_completed_move = new_red_checker;

      // update_red_checker_list()
      let mut did_update = false;
      i = 0;
      println!("self.red_just_completed_move {:#?}", self.red_just_completed_move);
      println!("self.red_checker_list {:#?}", self.red_checker_list);
      checker_list_length = *&self.red_checker_list.len() as usize;

      while (i < checker_list_length) {
        if (self.red_checker_list[i] == old_coordinates[0] && self.red_checker_list[i + 1] == old_coordinates[1]) {
          self.red_checker_list[i] = self.red_just_completed_move[0];
          self.red_checker_list[i + 1] = self.red_just_completed_move[1];
          self.red_checker_list[i + 2] = self.red_just_completed_move[2];
          self.red_checker_list[i + 3] = 1;
          did_update = true;
          break;
        }
        i += 4;
      }
      if (!did_update) {
        panic!("Didn't update checker in update_checker function");
      }
      println!("self.red_checker_list {:#?}", self.red_checker_list);


      // Remove black checker.
      i = 0;
      let mut checker_list_length = *&self.black_checker_list.len() as usize;
      let mut removed_black_checker = vec![];

      println!("self.red_checker_list {:#?}", self.red_checker_list);

      while (i < checker_list_length) {
        if (self.black_checker_list[i] == potential_jumped_coordinate[0] && self.black_checker_list[i + 1] == potential_jumped_coordinate[1]) {
          self.black_checker_list[i + 3] = 0;
          removed_black_checker.push(self.black_checker_list[i]);
          removed_black_checker.push(self.black_checker_list[i + 1]);
          removed_black_checker.push(self.black_checker_list[i + 2]);
          removed_black_checker.push(self.black_checker_list[i + 3]);
          break;
        }
        i += 4;
      }
      println!("removed_black_checker {:#?}", removed_black_checker);
      if removed_black_checker.len() > 0 {
        self.black_just_deleted_checker = removed_black_checker;
      } else {
        self.black_just_deleted_checker = vec![];
      }
    } else if (self.player_turn == "black") {
      self.player_turn = "red".to_string();
      // remove_red_checker_list()
      i = 0;
      let mut checker_list_length = *&self.black_checker_list.len() as usize;
      let mut removed_checker = vec![];

      println!("self.red_checker_list {:#?}", self.black_checker_list);

      while (i < checker_list_length) {
        if (self.black_checker_list[i] == old_coordinates[0] && self.black_checker_list[i + 1] == old_coordinates[1]) {
          self.black_checker_list[i + 3] = 0;
          removed_checker.push(self.black_checker_list[i]);
          removed_checker.push(self.black_checker_list[i + 1]);
          removed_checker.push(self.black_checker_list[i + 2]);
          removed_checker.push(self.black_checker_list[i + 3]);
          break;
        }
        i += 4;
      }
      println!("removed_checker {:#?}", removed_checker);

      let mut is_new_checker_king: isize = 0;
      if is_king_now == true { 
        is_new_checker_king = 1;
      } else { 
        if (is_checker_king == 1) {
          is_new_checker_king = 1;
        } 
      } 
      let mut new_black_checker = vec![
        new_coordinates[0], 
        new_coordinates[1], 
        is_new_checker_king,
      ];
      self.black_just_completed_move_last_position = removed_checker;
      self.black_just_completed_move = new_black_checker;

      // update_red_checker_list()
      let mut did_update = false;
      i = 0;
      println!("self.black_just_completed_move {:#?}", self.black_just_completed_move);
      println!("self.black_checker_list {:#?}", self.black_checker_list);
      checker_list_length = *&self.black_checker_list.len() as usize;

      while (i < checker_list_length) {
        if (self.black_checker_list[i] == old_coordinates[0] && self.black_checker_list[i + 1] == old_coordinates[1]) {
          self.black_checker_list[i] = self.black_just_completed_move[0];
          self.black_checker_list[i + 1] = self.black_just_completed_move[1];
          self.black_checker_list[i + 2] = self.black_just_completed_move[2];
          self.black_checker_list[i + 3] = 1;
          did_update = true;
          break;
        }
        i += 4;
      }
      if (!did_update) {
        panic!("Didn't update checker in update_checker function");
      }
      println!("self.black_checker_list {:#?}", self.black_checker_list);


      // Remove black checker.
      i = 0;
      let mut checker_list_length = *&self.red_checker_list.len() as usize;
      let mut removed_red_checker = vec![];

      println!("self.red_checker_list {:#?}", self.red_checker_list);

      while (i < checker_list_length) {
        if (self.red_checker_list[i] == potential_jumped_coordinate[0] && self.red_checker_list[i + 1] == potential_jumped_coordinate[1]) {
          self.red_checker_list[i + 3] = 0;
          removed_red_checker.push(self.red_checker_list[i]);
          removed_red_checker.push(self.red_checker_list[i + 1]);
          removed_red_checker.push(self.red_checker_list[i + 2]);
          removed_red_checker.push(self.red_checker_list[i + 3]);
          break;
        }
        i += 4;
      }
      println!("removed_red_checker {:#?}", removed_red_checker);
      if removed_red_checker.len() > 0 {
        self.red_just_deleted_checker = removed_red_checker;
      } else {
        self.red_just_deleted_checker = vec![];
      }


    }

    // TODO: Implement setGameStatus.
    self.set_game_status()
  }

  pub fn undo_move(&mut self, just_completed_move: Vec<isize>, just_completed_move_last_position: Vec<isize>, just_deleted_move: Vec<isize>) {
    if (self.player_turn == "black") {
      let mut did_update = false;
      let mut i: usize = 0;
      println!("self.red_checker_list {:#?}", self.red_checker_list);
      let red_checker_list_length = *&self.red_checker_list.len() as usize;

      while (i < red_checker_list_length) {
        if (self.red_checker_list[i] == just_completed_move[0] && self.red_checker_list[i + 1] == just_completed_move[1]) {
          self.red_checker_list[i] = just_completed_move_last_position[0];
          self.red_checker_list[i + 1] = just_completed_move_last_position[1];
          self.red_checker_list[i + 2] = just_completed_move_last_position[2];
          self.red_checker_list[i + 3] = 1;
          did_update = true;
          break;
        }
        i += 4;
      }
      if (!did_update) {
        panic!("Didn't update checker in update_checker function");
      }

      if (just_deleted_move.len() > 0) {
        let mut did_update = false;
        let mut i: usize = 0;
        println!("self.black_checker_list {:#?}", self.black_checker_list);
        let black_checker_list_length = *&self.black_checker_list.len() as usize;

        while (i < black_checker_list_length) {
          if (self.black_checker_list[i] == just_deleted_move[0] && self.black_checker_list[i + 1] == just_deleted_move[0]) {
            self.black_checker_list[i] = just_deleted_move[0];
            self.black_checker_list[i + 1] = just_deleted_move[1];
            self.black_checker_list[i + 2] = just_deleted_move[2];
            self.black_checker_list[i + 3] = 1;
            did_update = true;
            break;
          }
          i += 4;
        }
        if (!did_update) {
          panic!("Didn't update checker in update_checker function");
        }
      }
    } else if (self.player_turn == "red") {
      let mut did_update = false;
      let mut i: usize = 0;
      println!("self.red_checker_list {:#?}", self.red_checker_list);
      let black_checker_list_length = *&self.black_checker_list.len() as usize;

      while (i < black_checker_list_length) {
        if (self.black_checker_list[i] == just_completed_move[0] && self.black_checker_list[i + 1] == just_completed_move[1]) {
          self.black_checker_list[i] = just_completed_move_last_position[0];
          self.black_checker_list[i + 1] = just_completed_move_last_position[1];
          self.black_checker_list[i + 2] = just_completed_move_last_position[2];
          self.black_checker_list[i + 3] = 1;
          did_update = true;
          break;
        }
        i += 4;
      }
      if (!did_update) {
        panic!("Didn't update checker in update_checker function");
      }

      if (just_deleted_move.len() > 0) {
        let mut did_update = false;
        let mut i: usize = 0;
        println!("self.black_checker_list {:#?}", self.black_checker_list);
        let red_checker_list_length = *&self.red_checker_list.len() as usize;

        while (i < red_checker_list_length) {
          if (self.red_checker_list[i] == just_deleted_move[0] && self.red_checker_list[i + 1] == just_deleted_move[0]) {
            self.red_checker_list[i] = just_deleted_move[0];
            self.red_checker_list[i + 1] = just_deleted_move[1];
            self.red_checker_list[i + 2] = just_deleted_move[2];
            self.red_checker_list[i + 3] = 1;
            did_update = true;
            break;
          }
          i += 4;
        }
        if (!did_update) {
          panic!("Didn't update checker in update_checker function");
        }
      }
    }
    self.player_turn = if self.player_turn == "red" { "black".to_string() } else { "red".to_string() };
    self.set_game_status();
  }

  // uses function getActiveCheckers.
  // TODO: Add randomness to score.
  fn state_evaluation(&self, player: String) -> isize {
    // Count red checkers that are still active.
    let mut red_active_counter: usize = 0;
    let mut i: usize = 0;
    let red_checker_length = *&self.red_checker_list.len() as usize;
    while i < red_checker_length {
      if (self.red_checker_list[i + 3] == 1) {
        red_active_counter += 1;
      }
      i += 4;
    }

    // Count red checkers that are still active.
    let mut black_active_counter: usize = 0;
    let mut i: usize = 0;
    let black_checker_length = *&self.black_checker_list.len() as usize;
    while i < black_checker_length {
      if (self.black_checker_list[i + 3] == 1) {
        black_active_counter += 1;
      }
      i += 4;
    }

    let mut score: isize = 0;
    if (self.winner.to_string() == player.to_string() && self.has_game_ended) {
      score = self.INFINITY;
    } else if (self.has_game_ended) {
      score = self.NEGATIVE_INFINITY;
    } else {
      if (player.to_string() == "red") {
        score += (red_active_counter as isize - black_active_counter as isize) * 100;
        // score += Math.floor(Math.random() * 5) + 1
      } else if (player.to_string() == "black") {
        score += (black_active_counter as isize - red_active_counter as isize) * 100;
        // score += Math.floor(Math.random() * 5) + 1
      } else {
        panic!("crash and burn");
      }
    }

    return score
  }

  fn get_active_checkers(&self, checker_list: Vec<isize>) -> usize {
    let mut active_counter: usize = 0;
    let mut i: usize = 0;
    let checker_length = *&checker_list.len() as usize;
    while i < checker_length {
      if (checker_list[i + 3] == 1) {
        active_counter += 1;
      }
      i += 4;
    }
    active_counter
  }

  fn update_red_checker_list(mut self, old_x: isize, old_y: isize, x: isize, y: isize, is_king: isize, active_status: isize) {
    let mut did_update = false;
    let mut i: usize = 0;
    println!("self.red_checker_list {:#?}", self.red_checker_list);
    let checker_list_length = *&self.red_checker_list.len() as usize;

    while (i < checker_list_length) {
      if (self.red_checker_list[i] == old_x && self.red_checker_list[i + 1] == old_y) {
        self.red_checker_list[i] = x;
        self.red_checker_list[i + 1] = y;
        self.red_checker_list[i + 2] = is_king;
        self.red_checker_list[i + 3] = active_status;
        did_update = true;
        break;
      }
      i += 4;
    }
    if (!did_update) {
      panic!("Didn't update checker in update_checker function");
    }
    println!("self.red_checker_list {:#?}", self.red_checker_list);
  }

  fn update_black_checker_list(mut self, old_x: isize, old_y: isize, x: isize, y: isize, is_king: isize, active_status: isize) {
    let mut did_update = false;
    let mut i: usize = 0;
    println!("self.black_checker_list {:#?}", self.black_checker_list);
    let checker_list_length = *&self.black_checker_list.len() as usize;

    while (i < checker_list_length) {
      if (self.black_checker_list[i] == old_x && self.black_checker_list[i + 1] == old_y) {
        self.black_checker_list[i] = x;
        self.black_checker_list[i + 1] = y;
        self.black_checker_list[i + 2] = is_king;
        self.black_checker_list[i + 3] = active_status;
        did_update = true;
        break;
      }
      i += 4;
    }
    if (!did_update) {
      panic!("Didn't update checker in update_checker function");
    }
    println!("self.black_checker_list {:#?}", self.black_checker_list);
  }

  // NOTE: Haven't tested this as much as I would like.
  fn remove_red_checker_list(mut self, x: isize, y: isize) -> Vec<isize> {
    let mut i: usize = 0;
    let checker_list_length = *&self.red_checker_list.len() as usize;
    let mut removedChecker = vec![];

    println!("self.red_checker_list {:#?}", self.red_checker_list);

    while (i < checker_list_length) {
      if (self.red_checker_list[i] == x && self.red_checker_list[i + 1] == y) {
        self.red_checker_list[i + 3] = 0;
        removedChecker.push(self.black_checker_list[i]);
        removedChecker.push(self.black_checker_list[i + 1]);
        removedChecker.push(self.black_checker_list[i + 2]);
        removedChecker.push(self.black_checker_list[i + 3]);
        break;
      }
      i += 4;
    }
    println!("self.red_checker_list {:#?}", self.red_checker_list);
    removedChecker
  }

  fn remove_black_checker_list(mut self, x: isize, y: isize) -> Vec<isize> {
    let mut i: usize = 0;
    let checker_list_length = *&self.black_checker_list.len() as usize;
    let mut removedChecker = vec![];

    println!("self.black_checker_list {:#?}", self.black_checker_list);

    while (i < checker_list_length) {
      if (self.black_checker_list[i] == x && self.black_checker_list[i + 1] == y) {
        self.black_checker_list[i + 3] = 0;
        removedChecker.push(self.black_checker_list[i]);
        removedChecker.push(self.black_checker_list[i + 1]);
        removedChecker.push(self.black_checker_list[i + 2]);
        removedChecker.push(self.black_checker_list[i + 3]);
        break;
      }
      i += 4;
    }
    println!("self.black_checker_list {:#?}", self.black_checker_list);
    removedChecker
  }
}

#[allow(dead_code, unused_variables)]
#[wasm_bindgen]
#[derive(Clone,Debug)]
pub struct AlphaBeta {
  maxDepth: isize,
  currentMaxDepth: isize, // Maybe unneeded?
  player: String,
  gameState: CheckerGameState,
  tempBestMove: Vec<isize>,
  tempBestMoveSelectedPiece: Vec<isize>,
  // constants
  INFINITY: isize,
  NEGATIVE_INFINITY: isize,
}

#[wasm_bindgen]
impl AlphaBeta {
  #[wasm_bindgen(constructor)]
  pub fn new(maxDepth: isize, player: String) -> AlphaBeta {
    AlphaBeta {
      maxDepth: maxDepth,
      currentMaxDepth: maxDepth, // Maybe unneeded?
      player: player,
      gameState: CheckerGameState::new(),
      tempBestMove: [].to_vec(),
      tempBestMoveSelectedPiece: [].to_vec(),
      // constants
      INFINITY: 1000000,
      NEGATIVE_INFINITY: -1000000,
    }
  }

  pub fn get_gameState(&self) -> CheckerGameState {
    self.gameState.clone()
  }

  pub fn get_tempBestMove(&self) -> Vec<isize> {
    self.tempBestMove.clone()
  }

  pub fn get_tempBestMoveSelectedPiece(&self) -> Vec<isize> {
    self.tempBestMoveSelectedPiece.clone()
  }

  pub fn do_move(&mut self, old_coordinates: Vec<isize>, new_coordinates: Vec<isize>, is_checker_king: isize) {
    self.gameState.do_move(old_coordinates, new_coordinates, is_checker_king);
  }

  pub fn reset(&mut self) {
    // this.gameState = window.UIGameState;
    self.tempBestMove = [].to_vec();
    self.tempBestMoveSelectedPiece = [].to_vec();
  }

  pub fn is_terminal(&mut self, state: CheckerGameState, depth: isize) -> bool {
    if (self.currentMaxDepth > 0 && depth >= self.currentMaxDepth) {
      return true;
    }
    if (state.has_game_ended == true) {
      return true;
    } else {
      return false;
    }
  }

  pub fn getMove(&mut self) -> isize {
    self.reset();
    let alphaBetaValue = self.alpha_beta_algorithm(self.gameState.clone(), 0, self.NEGATIVE_INFINITY, self.INFINITY, true);
    alphaBetaValue
  }

  pub fn alpha_beta_algorithm(&mut self, mut state: CheckerGameState, depth: isize, mut alpha: isize, mut beta: isize, max_player: bool) -> isize {
    // Fake return value for testing.
    if (self.is_terminal(state.clone(), depth)) {
      return state.state_evaluation(self.player.clone());
    }
    if (state.player_turn == "red") {
      let mut i: usize = 0;
      let red_checker_length = *&state.red_checker_list.len() as usize;
      while i < red_checker_length {
        let checker = vec![
          state.red_checker_list[i], 
          state.red_checker_list[i + 1], 
          state.red_checker_list[i + 2]
        ];
        let available_moves = state.get_available_moves(checker[0], checker[1], checker[2]);

        let mut j: usize = 0;
        let available_move_length = *&available_moves.len() as usize;
        while j < available_move_length {
          let availableMove = &available_moves[j];
          state.do_move([checker[0], checker[1]].to_vec(), [availableMove[0], availableMove[1]].to_vec(), checker[2]);
          let red_just_completed_move = state.red_just_completed_move.clone();
          let red_just_completed_move_last_position = state.red_just_completed_move_last_position.clone();
          let black_just_deleted_checker = state.black_just_deleted_checker.clone();
          let value = self.alpha_beta_algorithm(state.clone(), depth + 1, alpha, beta, false);
          state.undo_move(
            red_just_completed_move.clone(),
            red_just_completed_move_last_position.clone(),
            black_just_deleted_checker.clone(),
          );

          if (max_player && value > alpha) {
            if (depth == 0) {
              self.tempBestMove = red_just_completed_move;
              self.tempBestMoveSelectedPiece = red_just_completed_move_last_position;
            }
            alpha = value;
          }
          else if (!max_player && value < beta) {
            beta = value;
          }
          if (alpha >= beta) {
            break;
          }
          j += 1;
        }
        i += 4;
      }
      if (max_player) {
        return alpha;
      } else {
        return beta;
      }
    } else if (state.player_turn == "black") {
      let mut i: usize = 0;
      let black_checker_length = *&state.black_checker_list.len() as usize;
      while i < black_checker_length {
        let checker = vec![
          state.black_checker_list[i], 
          state.black_checker_list[i + 1], 
          state.black_checker_list[i + 2]
        ];
        let available_moves = state.get_available_moves(checker[0], checker[1], checker[2]);

        let mut j: usize = 0;
        let available_move_length = *&available_moves.len() as usize;
        while j < available_move_length {
          let availableMove = &available_moves[j];
          state.do_move([checker[0], checker[1]].to_vec(), [availableMove[0], availableMove[1]].to_vec(), checker[2]);
          let black_just_completed_move = state.black_just_completed_move.clone();
          let black_just_completed_move_last_position = state.black_just_completed_move_last_position.clone();
          let red_just_deleted_checker = state.red_just_deleted_checker.clone();
          let value = self.alpha_beta_algorithm(state.clone(), depth + 1, alpha, beta, false);
          state.undo_move(
            black_just_completed_move.clone(),
            black_just_completed_move_last_position.clone(),
            red_just_deleted_checker.clone(),
          );

          if (max_player && value > alpha) {
            if (depth == 0) {
              self.tempBestMove = black_just_completed_move;
              self.tempBestMoveSelectedPiece = black_just_completed_move_last_position;
            }
            alpha = value;
          }
          else if (!max_player && value < beta) {
            beta = value;
          }
          if (alpha >= beta) {
            break;
          }
          j += 1;
        }
        i += 4;
      }
      if (max_player) {
        return alpha;
      } else {
        return beta;
      }
    } else {
      panic!("state.player_turn is neither red or black");
      return 100;
    }
  }
}
