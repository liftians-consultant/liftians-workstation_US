import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './BinGroup.css';

class BinGroup extends Component {
  state = {
    binAmount: process.env.REACT_APP_BOX_AMOUNT
  };

  render() {
    const { binAmount } = this.state;
    const { openedBinNum, highlightColor } = this.props;
    let color = highlightColor || 'red'
    let binElements = [];

    _.times(binAmount, (index) => {
      binElements.push(
        <div key={'bin-' + index} className="bin-item-container">
          <div className={"bin-item " + ((index + 1 === openedBinNum) ? 'highlight' : '')}>{index + 1}</div>
        </div>
      )
    })

    return (
      <div className="pick-bins-container">
        <style>{`
          .highlight {
            background: ` + color + `;
          }
        `}</style>
        { binElements }
      </div>
    );
  }
}

BinGroup.propTypes = {
  openedBinNum: PropTypes.number.isRequired,
  highlightColor: PropTypes.string,
};

export default BinGroup;