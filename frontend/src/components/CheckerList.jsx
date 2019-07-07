import React from 'react'
import PropTypes from 'prop-types'
import Checker from './Checker';

function CheckerList(props) {
  return (
    <React.Fragment>
      {
        props.coordinates.map((coordinate, i) => {
          return <Checker key={i} color={props.color} x={coordinate.y} y={coordinate.x} />;
        })
      }
    </React.Fragment>
  )
}

CheckerList.propTypes = {

}

export default CheckerList

