import React, { useContext } from 'react'
import _ from 'lodash'
import { CheckerContext } from '../context';
import PropTypes from 'prop-types'

function CheckerHighlight(props) {
  let { redCheckerList, setRedCheckerList, blackCheckerList, setBlackCheckerList } = useContext(CheckerContext);

  let style = {
    top: (props.y * 64) + "px",
    left: (props.x * 64) + "px",
  }

  function handleCheckerClick() {
    if (props.color === 'red') {
      redCheckerList = redCheckerList.filter((checker) => {
        return !(checker.x === props.oldX & checker.y === props.oldY);
      })
      redCheckerList.push({ x: props.x, y: props.y })
      setRedCheckerList(redCheckerList);
    } else if (props.color === 'black') {
      blackCheckerList = blackCheckerList.filter((checker) => {
        return !(checker.x === props.oldX & checker.y === props.oldY);
      })
      blackCheckerList.push({ x: props.x, y: props.y })
      setBlackCheckerList(blackCheckerList);
    } else {
      throw `props.color is invalid colour, should be red or black. Got ${props.color} instead`
    }
  }

  return (
    <div onClick={handleCheckerClick} className={`checker white`} style={style}></div>
  )
}

CheckerHighlight.propTypes = {
  color: PropTypes.string,
}

export default CheckerHighlight

