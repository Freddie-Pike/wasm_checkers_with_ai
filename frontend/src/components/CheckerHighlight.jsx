import React, { useContext } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'

import { CheckerContext } from '../context';
import { KINGABLE_RED_CHECKER_LIST, KINGABLE_BLACK_CHECKER_LIST } from '../config';


function CheckerHighlight(props) {
  let { redCheckerList, setRedCheckerList, blackCheckerList, setBlackCheckerList, playerTurn, setPlayerTurn, setHasGameEnded } = useContext(CheckerContext);

  let style = {
    top: (props.y * 64) + "px",
    left: (props.x * 64) + "px",
  }

  function checkIfWonGame() {
    if (redCheckerList.length === 0 || blackCheckerList.length === 0) {
      setPlayerTurn(props.color === 'red' ? 'black' : 'red');
      setHasGameEnded(true);
    }
  }

  function handleCheckerClick() {
    console.log('~~~CheckerHighlight.jsx');
    if (playerTurn === 'red') {
      setPlayerTurn('black');
      redCheckerList = redCheckerList.filter((checker) => {
        return !(checker.x === props.oldX & checker.y === props.oldY);
      })
      let isOnKingPosition = KINGABLE_RED_CHECKER_LIST.filter((checker) => {
        return checker.x === props.x & checker.y === props.y;
      })

      let isKing;
      if (isOnKingPosition.length === 0) {
        isKing = props.isKing;
      } else {
        isKing = true;
      }
      redCheckerList.push({
        x: props.x,
        y: props.y,
        isKing: isKing,
      });
      setRedCheckerList(redCheckerList);

      if (props.jumpedCheckerX !== null && props.jumpedCheckerY !== null) {
        blackCheckerList = blackCheckerList.filter((checker) => {
          return !(checker.x === props.jumpedCheckerX & checker.y === props.jumpedCheckerY);
        })
        setBlackCheckerList(blackCheckerList);
      }
      checkIfWonGame();
    } else if (playerTurn === 'black') {
      setPlayerTurn('red');
      blackCheckerList = blackCheckerList.filter((checker) => {
        return !(checker.x === props.oldX & checker.y === props.oldY);
      });
      let isOnKingPosition = KINGABLE_BLACK_CHECKER_LIST.filter((checker) => {
        return checker.x === props.x & checker.y === props.y;
      })

      let isKing;
      if (isOnKingPosition.length === 0) {
        isKing = props.isKing;
      } else {
        isKing = true;
      }
      blackCheckerList.push({
        x: props.x,
        y: props.y,
        isKing: isKing,
      });
      setBlackCheckerList(blackCheckerList);

      console.log(`jumpedCheckerX: ${props.jumpedCheckerX}`);
      console.log(`jumpedCheckerY: ${props.jumpedCheckerY}`);
      if (props.jumpedCheckerX !== null && props.jumpedCheckerY !== null) {
        redCheckerList = redCheckerList.filter((checker) => {
          return !(checker.x === props.jumpedCheckerX & checker.y === props.jumpedCheckerY);
        })

        setRedCheckerList(redCheckerList);
      }
      checkIfWonGame();
    } else {
      throw `props.color is invalid colour, should be red or black. Got ${props.color} instead`
    }
  }

  if (props.random) {
    handleCheckerClick();
    return null;
  } else {
    return (
      <div onClick={handleCheckerClick} className={`checker white`} style={style}></div>
    )
  }
}

CheckerHighlight.propTypes = {
  color: PropTypes.string,
  random: PropTypes.bool,
  oldX: PropTypes.number,
  oldY: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  jumpedCheckerX: PropTypes.number,
  jumpedCheckerY: PropTypes.number,
  king: PropTypes.bool,
}

export default CheckerHighlight

