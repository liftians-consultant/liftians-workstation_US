import { STATION_ACTIVATE_SUCCESS,
         STATION_ACTIVATE_ERROR, 
         STATION_CURRENT_UNFINISH_TASK_FETCHED,
         AT_STATION_POD_LAYOUT_INFO_FETCHED,
         COMING_PODS_FETCHED
} from "../types";

export default function user(state = {}, action = {}) {
  switch (action.type) {
    case STATION_ACTIVATE_SUCCESS:
      return { ...state, stationActivated: true}
    case STATION_ACTIVATE_ERROR:
      return { ...state, stationActivated: false}
    case STATION_CURRENT_UNFINISH_TASK_FETCHED:
      return { ...state, info: action.stationInfo};
    case AT_STATION_POD_LAYOUT_INFO_FETCHED:
      return { ...state, ...action};
    case COMING_PODS_FETCHED: 
      return { ...state, ...action.pods };
    default:
      return state;
  }
}
