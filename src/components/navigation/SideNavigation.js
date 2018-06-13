import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { toast } from "react-toastify";
import api from '../../api';
import * as actions from '../../actions/auth';
import appConfig from '../../AppConfig';
import './SideNavigation.css';
import { checkCurrentUnFinishTask } from "../../actions/station";

class SideNavigation extends Component {

  stationId = appConfig.getStationId()

  constructor() {
    super();

    this.handleLogoutBtnClicked = this.handleLogoutBtnClicked.bind(this);
    this.onUnload = this.onUnload.bind(this);
  }

  onUnload(event) { // the method that will be used for both add and remove event
    console.log("[WINDOW CLOSE EVENT] Triggered");
    
    if (this.props.stationInfo.taskType !== 'U' && this.props.stationInfo.taskCount > 0) {
      toast.error('Please finish all the tasks first! Please go to menu to refresh if you think you finished all tasks');
      event.returnValue = false;
      return false;
    } else {
        this.props.logout();
    }
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.onUnload);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.onUnload);
  }

  handleLogoutBtnClicked() {
    api.station.checkCurrentUnFinishTask(this.stationId).then(res => {
      if (res) {
        const unfinishedTask = res.filter((o) => o.cnt > 0);
        if (unfinishedTask.length > 0) {
          toast.error('Unable to log out, please finish all the task first!');

          // stop pick operation
          api.station.stopStationOperation(this.stationId, this.props.username, 'P').then(res => {
            if (res.data) {
              console.log('[STOP STATION OPERATION] SUCCESS');
            } else {
              toast.error('Error while stopping pick operation');
            }
          })
        } else {
          api.station.deactivateStationWithUser(this.stationId, this.props.username).then(res => {
            console.log('[DEACTIVATE STATION] Station Deactivated');
            this.props.logout().then((res) => {
              if (res) {
                toast.success('Successfully logged out');
              }
            });
          }).catch(err => {
            toast.error('Error while deactivating station');
            console.log('[ERROR] error while deactivating station');
          })
        }
      }
    });
  }

  render() {
    const { taskType } = this.props;
    const operationUrl = taskType === 'R' ? '/replenish-operation' : '/operation';
    const taskListUrl = taskType === 'R' ? '/replenish-task' : '/pick-task';
    console.log('refresh');
    return (
      <div className="side-navigation">
        <div className="nav-top">
          <div className="nav-item-container nav-station-container">
            <span>Station #{this.stationId}</span>
          </div>
          <div className="nav-item-container">
            <Link to="/"><Button className="nav-btn">Menu</Button></Link>
          </div>
          <div className="nav-item-container">
            <Link to={ operationUrl }><Button className="nav-btn">Operation</Button></Link>
          </div>
          <div className="nav-item-container">
            <Link to={ taskListUrl }><Button className="nav-btn">{ taskType === 'R' ? 'Replenishment List' : 'Picking List'}</Button></Link>
          </div>
        </div>
        <div className="nav-buffer"></div>
        <div className="nav-item-container nav-bottom">
          <Button className="nav-btn" onClick={ this.handleLogoutBtnClicked }>Logout</Button>
        </div> 
      </div>
    );
  }
};

SideNavigation.propTypes = {
  logout: PropTypes.func.isRequired,
  stationId: PropTypes.string.isRequired,
  operationType: PropTypes.oneOf(['R', 'P', 'U'])
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id,
    taskType: state.station.info.taskType,
  };
}

export default connect(mapStateToProps, {
  logout: actions.logout,
  checkCurrentUnFinishTask
})(SideNavigation);