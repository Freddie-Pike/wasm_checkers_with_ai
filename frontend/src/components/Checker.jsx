import React, { useState, Fragment } from 'react'
import _ from 'lodash'
import CheckerHighlight from './CheckerHighlight';
import PropTypes from 'prop-types'

import { v4 } from 'uuid'

function Checker(props) {
  const [isHighlighted, setIsHighlighted] = useState(false);

  let style = {
    top: (props.y * 64) + "px",
    left: (props.x * 64) + "px",
  }

  function handleCheckerClick() {
    setIsHighlighted(!isHighlighted);
  }

  if (isHighlighted) {
    let moveCoordinates = [[1, 1], [-1, 1], [-1, -1], [1, -1]]
    let randomCoordinate = [_.sample(moveCoordinates)];
    return (
      <Fragment>
        <div onClick={handleCheckerClick} className={`checker ${props.color}`} style={style}></div>
        {
          randomCoordinate.map((moveCoordinate, i) => {
            return <CheckerHighlight key={v4()} random={true} color={props.color} oldX={props.x} oldY={props.y} x={moveCoordinate[0] + props.x} y={moveCoordinate[1] + props.y} />
          })
        }
      </Fragment>
    )
  } else {
    return (
      <div onClick={handleCheckerClick} className={`checker ${props.color}`} style={style}></div>
    )
  }
}

Checker.propTypes = {
  color: PropTypes.string,
}

export default Checker

