import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Grid } from 'semantic-ui-react';
import * as actions from "../../actions/auth";
import MenuButton from '../common/MenuButton/MenuButton';
import TopNavigation from '../navigation/TopNavigation';
import { getUserInfoById } from '../../actions/users';

const workstationMenuCss = {
  paddingTop: '80px'
}

class HomePage extends Component {

  constructor(props) {
    super(props);
    this.props.getUserInfoById('10001');
  }

  render() {
    return (
      <div>
        <TopNavigation></TopNavigation>
        <div className="workstation-menu ui container" style={ workstationMenuCss }>
          <Grid columns={3} centered>
            <Grid.Row>
              <Grid.Column>
                <MenuButton title="入貨" />
              </Grid.Column>
              <Grid.Column>
                <MenuButton title="出貨" />
              </Grid.Column>
              <Grid.Column>
                <MenuButton title="盤點" />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column>
                <MenuButton title="系統設置" />
              </Grid.Column>
              <Grid.Column>
                <MenuButton title="庫存查詢" />
              </Grid.Column>
              <Grid.Column>
                <MenuButton title="生成貨單" />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}

HomePage.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.token
  };
}

export default connect(mapStateToProps, { logout: actions.logout, getUserInfoById })(HomePage);