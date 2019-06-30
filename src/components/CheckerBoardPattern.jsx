import React from 'react'
import PropTypes from 'prop-types'
import Tile from './Tile';

function CheckerBoardPattern() {
  function generatePattern() {
    let list = [];
    let i = 0;
    let j = 0;
    let color = "red"

    for (i = 0; i < 8; i++) {
      color = color === "red" ? "black" : "red";
      for (j = 0; j < 8; j++) {
        list.push(<Tile color={color} />)
        color = color === "red" ? "black" : "red";
      }
    }
    return list;
  }

  return (
    <React.Fragment>
      {generatePattern()}
    </React.Fragment>
  )
}

CheckerBoardPattern.propTypes = {

}

export default CheckerBoardPattern

