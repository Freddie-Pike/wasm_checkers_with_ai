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
    console.log(props.oldX)

    console.log('handleCheckerClick');
    console.table(`redCheckerList is ${JSON.stringify(redCheckerList)}`);
    console.log(`props is ${JSON.stringify(props)}`)
    redCheckerList = redCheckerList.filter((checker) => {
      return checker.x === props.oldX & checker.y === props.oldY;
    })

    // _.reject(redCheckerList, (checker) => {
    //   console.log(`checker.x: ${checker.x}`);
    //   console.log(`checker.y: ${checker.y}`);
    //   if (checker.x === props.oldX && checker.y === props.oldY) {
    //     console.log('this be true');
    //   }
    //   return checker.x === 5 & checker.y === 7;
    // })
    console.table(redCheckerList)
    // redCheckerList.push({ x: 0, y: 0 })

    // redCheckerList = [
    //   {
    //     x: 2,
    //     y: 2,
    //   },
    // ]
    // console.table(`redCheckerList is ${JSON.stringify(redCheckerList)}`);
    setRedCheckerList(redCheckerList)
    // alert('we going here?!?!?!');
  }

  return (
    <div onClick={handleCheckerClick} className={`checker white`} style={style}></div>
  )
}

CheckerHighlight.propTypes = {
  color: PropTypes.string,
}

export default CheckerHighlight

