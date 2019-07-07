import React from 'react'
import PropTypes from 'prop-types'

function Checker(props) {
  let style = {
    top: (props.y * 64) + "px",
    left: (props.x * 64) + "px",
  }

  function handleCheckerClick() {
    alert(`x: ${props.x}, y: ${props.y}`);
    console.log('hey');
    alert(`2 + 2 = ${window.add(props.x, props.y)}`);
  }

  return (
    <div onClick={handleCheckerClick} className={`checker ${props.color}`} style={style}>

    </div>
  )
}

Checker.propTypes = {
  color: PropTypes.string,
}

export default Checker

