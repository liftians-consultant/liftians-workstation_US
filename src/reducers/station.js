import { STATION_ACTIVATED, 
         STATION_CURRENT_UNFINISH_TASK_FETCHED,
         AT_STATION_POD_LAYOUT_INFO_FETCHED,
         COMING_PODS_FETCHED } from "../types";

export default function user(state = {}, action = {}) {
  switch (action.type) {
    case STATION_ACTIVATED:
      return { ...state, ...action.activated};
      break;
    case STATION_CURRENT_UNFINISH_TASK_FETCHED:
      return { ...state, ...action.task};
      break;
    case AT_STATION_POD_LAYOUT_INFO_FETCHED:
      return { ...state, ...action.userInfo};
      break;
    case COMING_PODS_FETCHED: 
      return { ...state, ...action.pods };
      break
    default:
      return state;
  }
}
