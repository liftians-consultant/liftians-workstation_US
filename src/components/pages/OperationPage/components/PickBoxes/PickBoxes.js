import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './PickBoxes.css';

class PickBoxes extends Component {
  state = {
    boxAmount: process.env.REACT_APP_BOX_AMOUNT
  };

  render() {
    const { boxAmount } = this.state;
    const { openedBoxNum } = this.props;
    let boxElements = [];
    _.times(boxAmount, (index) => {
      boxElements.push(
        <div key={'box-' + index} className="box-item-container">
          <div className={"box-item " + ((index + 1 === openedBoxNum) ? 'highlight' : '')}>{index + 1}</div>
        </div>
      )
    })

    return (
      <div className="pick-boxes-container">
        { boxElements }
      </div>
    );
  }
}

PickBoxes.propTypes = {
  openedBoxNum: PropTypes.number.isRequired,
};

export default PickBoxes;