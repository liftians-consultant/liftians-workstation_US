import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';
import { Grid, Dimmer, Loader } from 'semantic-ui-react';
import * as actions from "../../actions/auth";
import MenuButton from '../common/MenuButton/MenuButton';
import { getUserInfoById } from '../../actions/users';
import { activateStation, checkCurrentUnFinishTask } from "../../actions/station";

class HomePage extends Component {
  state = {
    isLoading: true
  }

  constructor(props) {
    super(props);
    this.goToPage = this.goToPage.bind(this);
  }

  componentWillMount() {
    this.props.getUserInfoById(this.props.username).then(() => {
      this.props.activateStation(this.props.stationId, this.props.username);
      this.checkCurrentUnFinishTaskCall();
    });    
  }
  
  goToPage = name => {
    console.log(name);
    this.props.history.push(name);
  }

  checkCurrentUnFinishTaskCall() {
    // TODO: station id
    this.props.checkCurrentUnFinishTask(this.props.stationId).then(res => {
      console.log("currentUnfinishedTask", res);
      this.setState({ isLoading: false });
    })
  }

  render() {
    const { stationInfo } = this.props;
    const stationTaskType = stationInfo ? stationInfo.taskType : null;

    // TODO: add loading
    return (
      <div className="workstation-menu ui container menu-page">
        <Dimmer active={this.state.isLoading}>
          <Loader content='Loading' />
        </Dimmer>

        <Grid columns={3} centered>
          <Grid.Row>
            <Grid.Column>
              <MenuButton title="Replenish" name="replenish" clickHandler={ this.goToPage } isDisabled={ stationTaskType !== 'U' && stationTaskType !== 'R' ? true : false }/>
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Pick" name="pick-task" clickHandler={ this.goToPage } isDisabled={ stationTaskType !== 'U' && stationTaskType !== 'P' ? true : false }/>
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Inventory Check" name="inventory-check" clickHandler={ this.goToPage } isDisabled={ stationTaskType !== 'U' && stationTaskType !== 'C' ? true : false }/>
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <MenuButton title="System Setting" name="system-setting" clickHandler={ this.goToPage } />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Inventory Search" name="inventory-search" clickHandler={ this.goToPage } />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Generate Inventory" name="generate-inventory" clickHandler={ this.goToPage } />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

HomePage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  stationInfo: PropTypes.object,
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.token,
    username: state.user.username,
    stationInfo: state.station.info,
    stationId: state.station.id
  };
}

export default connect(mapStateToProps, {
  logout: actions.logout,
  getUserInfoById,
  activateStation,
  checkCurrentUnFinishTask
})(HomePage);