import React, { useState, useContext, Fragment } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { v4 } from 'uuid'

import { CheckerContext } from '../context';
import { checkIfOutOfBounds, checkIfMoveIsInCheckerList } from '../helpers';
import CheckerHighlight from './CheckerHighlight';
import { KING_MOVE_COORDINATES, RED_MOVE_COORDINATES, BLACK_MOVE_COORDINATES } from '../config';

function Checker(props) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  let { redCheckerList, blackCheckerList, playerTurn, getAvailableMoves } = useContext(CheckerContext);

  let style = {
    top: (props.y * 64) + "px",
    left: (props.x * 64) + "px",
  }

  function handleCheckerClick() {
    setIsHighlighted(!isHighlighted);
  }

  function addKingStyling() {
    if (props.isKing) {
      return 'king-class';
    }
    return '';
  }


  if (isHighlighted || (props.random && playerTurn === props.color)) {
    let moveCoordinates = getAvailableMoves(props.x, props.y, props.isKing);

    return (
      <Fragment>
        <div onClick={handleCheckerClick} className={`checker ${props.color} ${addKingStyling()}`} style={style}></div>
        {
          moveCoordinates.map((moveCoordinate, i) => {
            return <CheckerHighlight
              key={v4()}
              color={props.color}
              oldX={props.x}
              oldY={props.y}
              x={moveCoordinate[0]}
              y={moveCoordinate[1]}
              isKing={props.isKing}
              random={props.random}
            />
          })
        }
      </Fragment>
    )
  } else {
    return (
      <div
        onClick={playerTurn === props.color ? handleCheckerClick : null}
        className={`checker ${props.color} ${addKingStyling()}`}
        style={style}>
      </div>
    )
  }
}

Checker.propTypes = {
  color: PropTypes.string,
}

export default Checker

