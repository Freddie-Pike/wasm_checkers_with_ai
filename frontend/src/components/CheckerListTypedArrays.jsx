import React from 'react'
import PropTypes from 'prop-types'
import Checker from './Checker';
import { v4 } from 'uuid'

// Random index is: Math.random() * props.coordinates.length)
function CheckerListTypedArrays(props) {
  function generateCheckersList() {
    let checkersToRender = [];
    console.log('typed!');
    for (let i = 0; i < props.coordinates.length; i += 4) {
      if (props.coordinates[i + 3] === 0) {
        continue;
      }
      checkersToRender.push(
        <Checker
          key={v4()}
          color={props.color}
          x={props.coordinates[i]}
          y={props.coordinates[i + 1]}
          isKing={props.coordinates[i + 2]}
        />
      )
    }
    return checkersToRender;
  }

  return (
    <React.Fragment>
      {generateCheckersList()}
    </React.Fragment>
  )
}

CheckerListTypedArrays.propTypes = {

}

export default CheckerListTypedArrays

