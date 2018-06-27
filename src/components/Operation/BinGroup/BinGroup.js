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
    let size = 110;
    if (this.props.size) {
      size = this.props.size;
    }

    const styles = {
      pickBinsContainer: {
        height: size + 'px'
      },
      binItemContainer: {
        height: size + 'px',
        width: size + 'px'
      },
      binItem: {
        lineHeight: size + 'px'
      }
    };


    _.times(binAmount, (index) => {
      binElements.push(
        <div key={'bin-' + index} className="bin-item-container" style={styles.binItem}>
          <div className={"bin-item " + ((index + 1 === openedBinNum) ? 'highlight' : '')} style={styles.binItemContainer}>{index + 1}</div>
        </div>
      )
    })

    return (
      <div className="pick-bins-container" style={styles.pickBinsContainer}>
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
  size: PropTypes.string,
};

export default BinGroup;