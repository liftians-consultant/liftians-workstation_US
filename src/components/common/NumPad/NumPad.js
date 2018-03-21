import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import './NumPad.css';

class NumPad extends Component {

  clickHandler(number) {
    this.props.callback(number)
  }

  render() {
    const { highlightAmount } = this.props;

    return (
      <div className="numpad-container">
        <div className="num-group">
          <Button size="massive" disabled={ highlightAmount < 1 } primary={ highlightAmount >= 1 } onClick={ () => this.clickHandler(1) }>1</Button>
          <Button size="massive" disabled={ highlightAmount < 2 } primary={ highlightAmount >= 2 } onClick={ () => this.clickHandler(2) }>2</Button>
          <Button size="massive" disabled={ highlightAmount < 3 } primary={ highlightAmount >= 3 } onClick={ () => this.clickHandler(3) }>3</Button>
        </div>
        <div className="num-group">
          <Button size="massive" disabled={ highlightAmount < 4 } primary={ highlightAmount >= 4 } onClick={ () => this.clickHandler(4) }>4</Button>
          <Button size="massive" disabled={ highlightAmount < 5 } primary={ highlightAmount >= 5 } onClick={ () => this.clickHandler(5) }>5</Button>
          <Button size="massive" disabled={ highlightAmount < 6 } primary={ highlightAmount >= 6 } onClick={ () => this.clickHandler(6) }>6</Button>
        </div>
        <div className="num-group">
          <Button size="massive" disabled={ highlightAmount < 7 } primary={ highlightAmount >= 7 } onClick={ () => this.clickHandler(7) }>7</Button>
          <Button size="massive" disabled={ highlightAmount < 8 } primary={ highlightAmount >= 8 } onClick={ () => this.clickHandler(8) }>8</Button>
          <Button size="massive" disabled={ highlightAmount < 9 } primary={ highlightAmount >= 9 } onClick={ () => this.clickHandler(9) }>9</Button>
        </div>
      </div>
    );
  }
}

NumPad.propTypes = {
  highlightAmount: PropTypes.number.isRequired,
  callback: PropTypes.func,
};

export default NumPad;