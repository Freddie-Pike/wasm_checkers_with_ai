import React from 'react'
import PropTypes from 'prop-types'

function Tile(props) {
  return (
    <div className={`tile ${props.color}`}>

    </div>
  )
}

Tile.propTypes = {
  color: PropTypes.string,
}

export default Tile

