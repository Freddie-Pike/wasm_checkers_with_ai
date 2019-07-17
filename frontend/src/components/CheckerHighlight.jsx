import React from 'react'
import PropTypes from 'prop-types'

function CheckerHighlight(props) {
  let style = {
    top: (props.y * 64) + "px",
    left: (props.x * 64) + "px",
  }

  function handleCheckerClick() {
    alert('we going here?!?!?!');
  }

  return (
    <div onClick={handleCheckerClick} className={`checker white`} style={style}></div>
  )
}

CheckerHighlight.propTypes = {
  color: PropTypes.string,
}

export default CheckerHighlight

