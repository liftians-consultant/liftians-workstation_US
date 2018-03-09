import { STATION_ACTIVATE_SUCCESS,
  STATION_ACTIVATE_ERROR, 
  STATION_CURRENT_UNFINISH_TASK_FETCHED,
  // AT_STATION_POD_LAYOUT_INFO_FETCHED,
  // COMING_PODS_FETCHED
} from "../types";
import api from '../api';

export const stationActivateSuccess = () => ({
  type: STATION_ACTIVATE_SUCCESS
});

export const stationActivateError = () => ({
  type: STATION_ACTIVATE_ERROR
});

export const activateStation = (stationId) => (dispatch, getState) => {
  const { user } = getState();
  api.station.activateStationWithUser(stationId, user.username).then(res => {
    if (res === 1) {
      dispatch(stationActivateSuccess());
    } else {
      dispatch(stationActivateError());
    }
  }).catch((e) => {
    dispatch(stationActivateError());
  })
}

export const checkCurrentUnFinishTask = (stationId) => (dispatch, getState) => 
  api.station.checkCurrentUnFinishTask(stationId).then(res => {
    let stationInfo = {
      taskType: 'U',
      taskCount: 0
    }
    res.forEach(element => {
      if (element.cnt > 0) {
        stationInfo.taskType = element.taskType;
        stationInfo.taskCount = element.cnt;
      }
    });
    dispatch({type: STATION_CURRENT_UNFINISH_TASK_FETCHED, stationInfo});
    return stationInfo;
  })
