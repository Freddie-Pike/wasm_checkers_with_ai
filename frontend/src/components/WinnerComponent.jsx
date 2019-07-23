import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { CheckerContext } from '../context';

function WinnerComponent(props) {
  let { hasGameEnded, playerTurn } = useContext(CheckerContext);


  let style = {
    display: "flex",
    justifyContent: "center",
    width: "300px",
    marginTop: "1rem",
  }

  let winningPlayer;
  if (playerTurn === 'red') {
    winningPlayer = 'black'
  } else if (playerTurn === 'black') {
    winningPlayer = 'red'
  } else {
    throw `Invalid playerTurn of ${playerTurn} in WinnerComponent`
  }
  return (
    <div style={style}>
      {hasGameEnded &&
        <span>A winner is {hasGameEnded ? winningPlayer : ''}</span>
      }
    </div>
  )
}

export default WinnerComponent

