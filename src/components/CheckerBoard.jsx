import React from 'react';

function CheckerList(props) {
  return (
    <div className="checker-board">
      {props.children}
    </div>
  );
}

export default CheckerList;