import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import { CheckerContext } from '../context';

function WinnerComponent(props) {
  let { hasGameEnded } = useContext(CheckerContext);
  let style = {
    display: "flex",
    color: "gold",
    justifyContent: "center",
    width: "300px",
    marginTop: "1rem",
    marginBottom: "1rem",
  }

  return (
    <div style={style}>
      {hasGameEnded &&
        <span>A winner is {hasGameEnded ? window.UIGameState.winner : ''}</span>
      }
    </div>
  )
}

export default WinnerComponent

