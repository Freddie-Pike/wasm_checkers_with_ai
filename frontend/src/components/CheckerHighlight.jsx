import React, { useContext } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'

import { CheckerContext } from '../context';


function CheckerHighlight(props) {
  let { doMove } = useContext(CheckerContext);

  let style = {
    top: (props.y * 64) + "px",
    left: (props.x * 64) + "px",
  }

  function handleCheckerClick() {
    doMove([props.oldX, props.oldY], [props.x, props.y], props.isKing);
  }

  if (props.random) {
    handleCheckerClick();
    return null;
  } else {
    return (
      <div onClick={handleCheckerClick} className={`checker white`} style={style}></div>
    )
  }
}

CheckerHighlight.propTypes = {
  color: PropTypes.string,
  random: PropTypes.bool,
  oldX: PropTypes.number,
  oldY: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  jumpedCheckerX: PropTypes.number,
  jumpedCheckerY: PropTypes.number,
  king: PropTypes.bool,
}

export default CheckerHighlight

