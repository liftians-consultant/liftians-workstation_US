import React from "react";
import { Switch } from 'react-router';
import { connect } from "react-redux";
import PropTypes from "prop-types";
import './App.css';
import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/LoginPage";
import PickTaskPage from "./components/pages/PickTaskPage/PickTaskPage";
import OperationPage from './components/pages/OperationPage/OperationPage';
import SystemSettingPage from './components/pages/SystemSettingPage/SystemSettingPage';
import GuestRoute from "./components/routes/GuestRoute";
import UserRoute from "./components/routes/UserRoute";
import ReplenishTaskPage from './components/pages/ReplenishTaskPage/ReplenishTaskPage';
import ReplenishOperationPage from './components/pages/ReplenishOperationPage/ReplenishOperationPage';
import InventorySearchPage from "./components/pages/InventorySearchPage/InventorySearchPage";
import "./App.css";

const App = ({ location, isAuthenticated }) => (
  <div className="app-comp-container">
    <Switch>
      <UserRoute path="/pick-task" exact component={PickTaskPage} />
      <UserRoute path="/operation" exact component={OperationPage} />
      <UserRoute path="/system-setting" exact component={SystemSettingPage} />
      <UserRoute path="/replenish-task" exact component={ReplenishTaskPage} />
      <UserRoute path="/replenish-operation" exact component={ReplenishOperationPage} />
      <UserRoute path="/inventory-search" exact component={InventorySearchPage} />
      <GuestRoute path="/login" component={LoginPage} />
      <UserRoute path="/" exact component={HomePage} />
    </Switch>
  </div>
);

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  isAuthenticated: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
  return {
    isAuthenticated: !!state.user.username
  };
}

export default connect(mapStateToProps)(App);
