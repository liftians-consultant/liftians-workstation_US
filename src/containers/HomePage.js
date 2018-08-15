import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Dimmer, Loader } from 'semantic-ui-react';

import * as log4js from 'log4js2';
import { AjaxAppenderProvider } from '@norauto/log4js2-ajax-appender';
import appConfig from 'services/AppConfig';
import ETagService from 'services/ETagService';
import MenuButton from 'components/common/MenuButton/MenuButton';
import * as actions from 'redux/actions/authAction';
import { getUserInfoById } from 'redux/actions/userAction';
import { activateStation, checkCurrentUnFinishTask } from 'redux/actions/stationAction';
class HomePage extends Component {
  state = {
    isLoading: true,
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

    ETagService.turnEndLightOffById(0);

    log4js.addAppender(AjaxAppenderProvider({
      method: 'POST',
      url: `${appConfig.getApiUrl()}/logs`,
      headers: {
        'Content-Type': 'text/plain',
      },
    }));

    log4js.configure({
      layout: '%d{yyyy-MM-dd HH:mm:ss} [%level] %logger - %message',
      appenders: ['ajaxAppender'],
      loggers: [{
        logLevel: log4js.LogLevel.ERROR,
      }],
      allowAppenderInjection: true,
    });
  }

  goToPage = (name) => {
    console.log(name);
    this.props.history.push(name);
  }

  checkCurrentUnFinishTaskCall() {
    this.props.checkCurrentUnFinishTask(this.props.stationId).then((res) => {
      console.log('currentUnfinishedTask', res);
      this.setState({ isLoading: false });
    });
  }

  render() {
    const { stationInfo } = this.props;
    const stationTaskType = stationInfo ? stationInfo.taskType : null;

    return (
      <div className="workstation-menu ui container menu-page">
        <Dimmer active={this.state.isLoading}>
          <Loader content="Loading" />
        </Dimmer>

        <Grid columns={3} centered>
          <Grid.Row>
            <Grid.Column>
              <MenuButton title="Replenish" name="replenish-task" clickHandler={this.goToPage} isDisabled={stationTaskType !== 'U' && stationTaskType !== 'R' ? true : false} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Pick" name="pick-task" clickHandler={this.goToPage} isDisabled={stationTaskType !== 'U' && stationTaskType !== 'P' ? true : false} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Inventory Check" name="" clickHandler={this.goToPage} isDisabled={stationTaskType !== 'U' && stationTaskType !== 'C' ? true : false} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <MenuButton title="System Setting" name="system-setting" clickHandler={this.goToPage} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Inventory Search" name="inventory-search" clickHandler={this.goToPage} />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Generate Data" name="generate-data" clickHandler={this.goToPage} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

HomePage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  stationInfo: PropTypes.object,
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.token,
    username: state.user.username,
    stationInfo: state.station.info,
    stationId: state.station.id,
  };
}

export default connect(mapStateToProps, {
  logout: actions.logout,
  getUserInfoById,
  activateStation,
  checkCurrentUnFinishTask,
})(HomePage);
