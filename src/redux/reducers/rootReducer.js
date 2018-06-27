import { combineReducers } from "redux";

import user from "./user";
import station from './station';
export default combineReducers({
  user,
  station
});
