import React, { Component } from 'react';
import PropTypes from 'prop-types';

const menuBtnStyle = {
  width: '150px',
  height: '150px',
  backgroundColor: 'darkblue',
  textAlign: 'center',
  lineHeight: '150px',
  marginLeft: 'auto',
  marginRight: 'auto'
}

const spanStyle = {
  color: 'white'
}

class MenuButton extends Component {

  clickHandler(event) {
    console.log("clicked", event.target);
  }

  render() {
    const { title } = this.props;
    return (
      <div style={ menuBtnStyle } onClick={ (event) => { this.clickHandler(event) } }>
        <span style={ spanStyle }>{ title }</span>
      </div>
    );
  }
}

MenuButton.propTypes = {
  title: PropTypes.string.isRequired,
};

export default MenuButton;