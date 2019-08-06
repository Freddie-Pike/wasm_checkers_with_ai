use core::panic::PanicInfo;
use wasm_bindgen::prelude::*;

use core::slice::from_raw_parts_mut;
use core::slice::from_raw_parts;

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
pub fn add(a: u32, b: u32) -> u32 {
    a + b
}

#[wasm_bindgen]
pub fn sub(a: u32, b: u32) -> u32 {
    a - b
}

#[wasm_bindgen]
pub fn multiply(a: u32, b: u32) -> u32 {
    a * b
}

#[wasm_bindgen]
pub struct StreamingStats {
  pub count: u32, 
  sum: f64,
}

#[wasm_bindgen]
impl StreamingStats {
  pub fn add(&mut self, sample: f64) {
    self.count += 1;
    self.sum += sample;
  }

  pub fn mean(&self) -> f64 {
    self.sum / (self.count as f64)
  }

  pub fn get_count(&self) -> u32 {
    self.count
  }

  #[wasm_bindgen(constructor)]
  pub fn new(count: f64) -> StreamingStats {
    StreamingStats {
      count: 0,
      sum: 0.0,
    }
  }
}


#[wasm_bindgen]
pub struct CheckerGameState {
  red_checker_list_offset: *const u8,
  red_checker_list_size: usize, 
  black_checker_list_offset: *const u8, 
  black_checker_list_size: usize, 
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn console_log_str(s: &str);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn console_log_u8(n: u8);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn console_log_many(a: u32, b: &JsValue);
}


#[wasm_bindgen]
impl CheckerGameState {
  pub fn red_checker_list_offset(&self) -> *const u8 {
      self.red_checker_list_offset
  }

  pub fn red_checker_list_size(&self) -> usize {
      self.red_checker_list_size
  }

  pub fn black_checker_list_offset(&self) -> *const u8 {
      self.black_checker_list_offset
  }

  pub fn black_checker_list_size(&self) -> usize {
      self.black_checker_list_size
  }

  pub fn testy_test(&self) {
    // let src_img: &[u32];
    let red_checker_list_workable: &mut [u8];
    let black_checker_list_workable: &mut [u8];
    unsafe { 
      red_checker_list_workable = from_raw_parts_mut::<u8>(
        self.red_checker_list_offset as *mut u8, self.red_checker_list_size
      );
      black_checker_list_workable = from_raw_parts_mut::<u8>(
        self.black_checker_list_offset as *mut u8, self.black_checker_list_size
      );
    }
    console_log_str("setting up red checker list.");
    red_checker_list_workable[0] = 3;
    red_checker_list_workable[1] = 3;
    red_checker_list_workable[2] = 1;
    red_checker_list_workable[3] = 1;

    console_log_str("setting up black checker list.");
    black_checker_list_workable[0] = 2;
    black_checker_list_workable[1] = 2;
    black_checker_list_workable[2] = 1;
    black_checker_list_workable[3] = 1;
  }


  #[wasm_bindgen(constructor)]
  pub fn new(red_checker_list_bytes: &[u8], black_checker_list_bytes: &[u8]) -> CheckerGameState {
    CheckerGameState {
      red_checker_list_offset: red_checker_list_bytes.as_ptr(),
      red_checker_list_size: red_checker_list_bytes.len(),
      black_checker_list_offset: black_checker_list_bytes.as_ptr(),
      black_checker_list_size: black_checker_list_bytes.len(),
    }
  }
}

#[wasm_bindgen]
pub fn renderCheckerGameState() -> CheckerGameState {
  let mut red_checker_list_vector = vec![1, 2, 3, 4];
  let mut black_checker_list_vector = vec![1, 2, 3, 4];
  CheckerGameState::new(&red_checker_list_vector, &black_checker_list_vector)
}

