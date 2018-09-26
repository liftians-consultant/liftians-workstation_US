import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from 'semantic-ui-react';
// import { Link } from 'react-router-dom';
import './MenuButton.css';

class MenuButton extends Component {

  clickHandler(event) {
    this.props.clickHandler('/' + this.props.name);
  }

  render() {
    const { title, isDisabled, iconName } = this.props;
    const menuClass = classNames({
      'menuBtn': true,
      'btn-disabled': isDisabled
    });

    return (
      <div className={ menuClass } onClick={ () => this.clickHandler() }>
        { iconName && (
          <div className="menuBtn-icon">
            <Icon name={iconName} size="huge" inverted />
          </div>
        )}
        <span className={ iconName ? "menuBtn-span" : "menuBtn-span withoutIcon"}>{ title }</span>
      </div>
    );
  }
}

MenuButton.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  iconName: PropTypes.string,
  isDisabled: PropTypes.bool,
  clickHandler: PropTypes.func,
};

export default MenuButton;
