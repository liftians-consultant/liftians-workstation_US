import { combineReducers } from "redux";

import user from "./reducers/user";
import station from './reducers/station';
export default combineReducers({
  user,
  station
});
