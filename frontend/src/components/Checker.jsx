import React, { useState, useContext, Fragment } from 'react'
import _ from 'lodash'

import { CheckerContext } from '../context';
import CheckerHighlight from './CheckerHighlight';
import PropTypes from 'prop-types'

import { v4 } from 'uuid'

function Checker(props) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  let { redCheckerList, blackCheckerList } = useContext(CheckerContext);

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
          moveCoordinates.map((moveCoordinate, i) => {
            let newX = moveCoordinate[0] + props.x;
            let newY = moveCoordinate[1] + props.y;
            let jumpedCheckerList;

            if (props.color === 'red') {
              jumpedCheckerList = blackCheckerList.filter((checker) => {
                return checker.x === newX & checker.y === newY;
              });
            } else if (props.color === 'black') {
              jumpedCheckerList = redCheckerList.filter((checker) => {
                return checker.x === newX & checker.y === newY;
              });
            }

            let jumpedChecker = jumpedCheckerList.pop()
            let jumpedCheckerX = null;
            let jumpedCheckerY = null;
            if (jumpedChecker !== undefined) {
              jumpedCheckerX = newX;
              jumpedCheckerY = newY;
              newX += moveCoordinate[0];
              newY += moveCoordinate[1];
            }

            return <CheckerHighlight
              key={v4()}
              random={false}
              color={props.color}
              oldX={props.x}
              oldY={props.y}
              x={newX}
              y={newY}
              jumpedCheckerX={jumpedCheckerX}
              jumpedCheckerY={jumpedCheckerY}
            />
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

