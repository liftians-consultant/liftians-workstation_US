import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Button } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import api from 'api';
import * as actions from 'redux/actions/authAction';
import appConfig from 'services/AppConfig';
import { checkCurrentUnFinishTask } from 'redux/actions/stationAction';
import { showChangeBinModal } from 'redux/actions/operationAction';
import './SideNavigation.css';

class SideNavigation extends Component {

  stationId = appConfig.getStationId()

  constructor() {
    super();

    this.handleLogoutBtnClicked = this.handleLogoutBtnClicked.bind(this);
    this.handleChangeBinBtnClicked = this.handleChangeBinBtnClicked.bind(this);
    this.onUnload = this.onUnload.bind(this);
  }

  onUnload(event) { // the method that will be used for both add and remove event
    console.log('[WINDOW CLOSE EVENT] Triggered');

    if (this.props.taskType !== 'U' && this.props.taskCount > 0) {
      toast.error('Please finish all the tasks first! \nPlease go to menu to refresh if you think you finished all tasks');
      event.returnValue = false;
      return false;
    } else {
      this.props.logout();
    }
    return false;
  }

  componentDidMount() {
    window.addEventListener('beforeunload', this.onUnload);
  }

  componentWillUnmount() {
    window.removeEventListener('beforeunload', this.onUnload);
  }

  handleLogoutBtnClicked() {
    api.station.checkCurrentUnFinishTask(this.stationId).then((res) => {
      if (res) {
        const unfinishedTask = res.filter((o) => o.cnt > 0);
        if (unfinishedTask.length > 0) {
          toast.error('Unable to log out, please finish all the task first!');

          // stop pick operation
          api.station.stopStationOperation(this.stationId, this.props.username, 'P').then((res) => {
            if (res.data) {
              console.log('[STOP STATION OPERATION] SUCCESS');
            } else {
              toast.error('Error while stopping pick operation');
            }
          });
        } else {
          api.station.deactivateStationWithUser(this.stationId, this.props.username).then((res) => {
            console.log('[DEACTIVATE STATION] Station Deactivated');
            this.props.logout().then((res) => {
              if (res) {
                toast.success('Successfully logged out');
              }
            });
          }).catch((err) => {
            toast.error('Error while deactivating station');
            console.log('[ERROR] error while deactivating station');
          });
        }
      }
    });
  }

  handleChangeBinBtnClicked() {
    this.props.showChangeBinModal();
  }

  renderChangeBinBtn() {
    if (this.props.location.pathname === '/operation') {
      return (
        <Button className="nav-btn" onClick={this.handleChangeBinBtnClicked}>
          Change Bin
        </Button>
      );
    }

    return;
  }

  render() {
    const { taskType, location } = this.props;
    const operationUrl = taskType === 'R' ? '/replenish-operation' : '/operation';
    const taskListUrl = taskType === 'R' ? '/replenish-task' : '/pick-task';


    return (
      <div className="side-navigation">
        <div className="nav-top">
          <div className="nav-item-container nav-station-container">
            <span>Station #{this.stationId}</span>
          </div>
          <div className="nav-item-container">
            <Link to="/">
              <Button className="nav-btn">
                Menu
              </Button>
            </Link>
          </div>
          <div className="nav-item-container">
            <Link to={operationUrl}>
              <Button className="nav-btn">
                Operation
              </Button>
            </Link>
          </div>
          <div className="nav-item-container">
            <Link to={taskListUrl}>
              <Button className="nav-btn">
                {taskType === 'R' ? 'Replenishment List' : 'Picking List'}
              </Button>
            </Link>
          </div>
        </div>
        <div className="nav-buffer" />
        <div className="nav-item-container nav-bottom">
          { this.renderChangeBinBtn() }
          <Button className="nav-btn" onClick={this.handleLogoutBtnClicked}>
            Logout
          </Button>
        </div>
      </div>
    );
  }
};

SideNavigation.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  logout: PropTypes.func.isRequired,
  stationId: PropTypes.string.isRequired,
  taskType: PropTypes.oneOf(['R', 'P', 'U']),
  location: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id,
    taskType: state.station.info.taskType,
    taskCount: state.station.info.taskCount,
  };
}

export default withRouter(connect(mapStateToProps, {
  logout: actions.logout,
  checkCurrentUnFinishTask,
  showChangeBinModal,
})(SideNavigation));
