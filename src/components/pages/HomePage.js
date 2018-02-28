import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Grid } from 'semantic-ui-react';
import * as actions from "../../actions/auth";
import MenuButton from '../common/MenuButton/MenuButton';
import TopNavigation from '../navigation/TopNavigation';
import { getUserInfoById } from '../../actions/users';
import { activateStation, checkCurrentUnFinishTask } from "../../actions/station";

const workstationMenuCss = {
  paddingTop: '100px'
}

class HomePage extends Component {

  constructor(props) {
    super(props);
    this.props.getUserInfoById(this.props.username).then(() => {
      // TODO: stationId
      this.props.activateStation(1, this.props.username);
      this.checkCurrentUnFinishTaskCall();
    });

  }

  checkCurrentUnFinishTaskCall() {
    // TODO: station id
    this.props.checkCurrentUnFinishTask(1).then(res => {
      console.log("test", res);
    })
  }

  render() {
    const { stationInfo } = this.props;
    const stationTaskType = stationInfo ? stationInfo.taskType : null;

    // TODO: add loading
    return (
      <div>
        <TopNavigation></TopNavigation>
        <div className="workstation-menu ui container" style={ workstationMenuCss }>
          <Grid columns={3} centered>
            <Grid.Row>
              <Grid.Column>
                <MenuButton title="入貨" isDisabled={ stationTaskType !== 'U' && stationTaskType !== 'R' ? true : false }/>
              </Grid.Column>
              <Grid.Column>
                <MenuButton title="出貨" isDisabled={ stationTaskType !== 'U' && stationTaskType !== 'P' ? true : false }/>
              </Grid.Column>
              <Grid.Column>
                <MenuButton title="盤點" isDisabled={ stationTaskType !== 'U' && stationTaskType !== 'C' ? true : false }/>
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
    isAuthenticated: !!state.user.token,
    username: state.user.username,
    stationInfo: state.station.info
  };
}

export default connect(mapStateToProps, {
  logout: actions.logout,
  getUserInfoById,
  activateStation,
  checkCurrentUnFinishTask
})(HomePage);