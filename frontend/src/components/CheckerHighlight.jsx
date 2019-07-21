import React, { useContext } from 'react'
import _ from 'lodash'
import { CheckerContext } from '../context';
import PropTypes from 'prop-types'

function CheckerHighlight(props) {
  let { redCheckerList, setRedCheckerList } = useContext(CheckerContext);
  let style = {
    top: (props.y * 64) + "px",
    left: (props.x * 64) + "px",
  }

  function handleCheckerClick() {
    redCheckerList = redCheckerList.filter((checker) => {
      return !(checker.x === props.oldX & checker.y === props.oldY);
    })
    redCheckerList.push({ x: props.x, y: props.y })
    setRedCheckerList(redCheckerList);
  }

  return (
    <div onClick={handleCheckerClick} className={`checker white`} style={style}></div>
  )
}

CheckerHighlight.propTypes = {
  color: PropTypes.string,
}

export default CheckerHighlight

