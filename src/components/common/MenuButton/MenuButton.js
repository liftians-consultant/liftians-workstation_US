import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import './MenuButton.css';

class MenuButton extends Component {

  clickHandler(event) {
    this.props.clickHandler('/' + this.props.name);
  }

  render() {
    const { title, name, isDisabled } = this.props;
    const menuClass = classNames({
      'menuBtn': true,
      'btn-disabled': isDisabled
    });

    return (
      <div className={ menuClass } onClick={ () => this.clickHandler() }>
        <span className="menuBtn-span">{ title }</span>
      </div>
    );
  }
}

MenuButton.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
  clickHandler: PropTypes.func
};

export default MenuButton;