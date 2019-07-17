import React from 'react';

function CheckerBoard(props) {
  return (
    <div className="checker-board">
      {props.children}
    </div>
  );
}

export default CheckerBoard;