import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './MenuButton.css';

class MenuButton extends Component {

  clickHandler(event) {
    this.props.goTo('/' + this.props.name);
  }

  render() {
    const { title, isDisabled } = this.props;
    const menuClass = classNames({
      'menuBtn': true,
      'btn-disabled': isDisabled
    });
    return (
      <div className={menuClass}
           onClick={ (event) => { this.clickHandler(event) } }>
        <span className="menuBtn-span">{ title }</span>
      </div>
    );
  }
}

MenuButton.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string,
  isDisabled: PropTypes.bool,
  goTo: PropTypes.func
};

export default MenuButton;