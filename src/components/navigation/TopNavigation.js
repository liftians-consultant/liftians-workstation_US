import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Menu, Container, Segment, Image } from 'semantic-ui-react';
import * as actions from '../../actions/auth';
import leftLogo from '../../assets/images/logo@2x.png';

const menuStyle = {
  // backgroundColor: '#fff',
  // border: '1px solid #ddd',
  // boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
}

const TopNavigation = ({ logout }) => ({
  render() {
    const fixed = false;

    return (
      <div>
        <Menu style={ menuStyle } inverted>
          <Container>
            <Menu.Item as='a' header>
              <Image src={ leftLogo } size="medium" />
            </Menu.Item>
            <Menu.Item position='right'>
              <Button as='a' onClick={() => logout() }>Menu</Button>
            </Menu.Item>
            <Menu.Item position='right'>
              <Button as='a' onClick={() => {}}>Logout</Button>
            </Menu.Item>
            <Menu.Item position='right'>
              <Button as='a' onClick={() => {}}>Operation</Button>
            </Menu.Item>
          </Container>
        </Menu>
      </div>
    );
  }
});

TopNavigation.propTypes = {
  logout: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {

  };
}

export default connect(mapStateToProps, { logout: actions.logout })(TopNavigation);