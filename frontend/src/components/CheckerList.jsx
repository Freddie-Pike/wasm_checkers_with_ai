import React from 'react'
import PropTypes from 'prop-types'
import Checker from './Checker';
import { v4 } from 'uuid'

// Random index is: Math.random() * props.coordinates.length)
function CheckerList(props) {
  function generateCheckersList() {
    let checkersToRender = [];
    for (let i = 0; i < props.coordinates.length; i++) {
      let checker = props.coordinates[i];
      checkersToRender.push(
        <Checker
          key={v4()}
          color={props.color}
          x={checker.x}
          y={checker.y}
          isKing={checker.isKing}
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

CheckerList.propTypes = {

}

export default CheckerList

