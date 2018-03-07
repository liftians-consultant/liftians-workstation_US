import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Menu, Container, Image } from 'semantic-ui-react';
import * as actions from '../../actions/auth';
import leftLogo from '../../assets/images/logo@2x.png';



const TopNavigation = ({ logout }) => ({

  
  render() {

    return (
      <div>
        <Menu inverted>
          <Container>
            <Menu.Item as='a' header>
              <Image src={ leftLogo } size="medium" />
            </Menu.Item>
            <Menu.Item position='right'>
              <Button><Link to="/">Menu</Link></Button>
            </Menu.Item>
            <Menu.Item position='right'>
              <Button as='a' onClick={() => logout() }>Logout</Button>
            </Menu.Item>
            <Menu.Item position='right'>
              <Button><Link to="/operation">Operation</Link></Button>
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