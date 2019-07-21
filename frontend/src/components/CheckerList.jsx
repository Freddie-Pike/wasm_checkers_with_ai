import React from 'react'
import PropTypes from 'prop-types'
import Checker from './Checker';
import { v4 } from 'uuid'

function CheckerList(props) {
  return (
    <React.Fragment>
      {
        props.coordinates.map((coordinate, i) => {
          return <Checker key={v4()} color={props.color} x={coordinate.x} y={coordinate.y} />;
        })
      }
    </React.Fragment>
  )
}

CheckerList.propTypes = {

}

export default CheckerList

