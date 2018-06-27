import React from "react";
import { Switch } from 'react-router';
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { ToastContainer } from 'react-toastify';

import GuestRoute from "components/routes/GuestRoute";
import UserRoute from "components/routes/UserRoute";

import HomePage from "components/pages/HomePage";
import LoginPage from "components/pages/LoginPage";
import PickTaskPage from "containers/PickTaskPage/PickTaskPage";
import OperationPage from 'components/pages/OperationPage/OperationPage';
import SystemSettingPage from 'components/pages/SystemSettingPage/SystemSettingPage';
import ReplenishTaskPage from 'components/pages/ReplenishTaskPage/ReplenishTaskPage';
import ReplenishOperationPage from 'components/pages/ReplenishOperationPage/ReplenishOperationPage';
import InventorySearchPage from "components/pages/InventorySearchPage/InventorySearchPage";
import TaskListPage from "containers/TaskListPage/TaskListPage";
import BusinessRulesPage from "components/pages/BusinessRulesPage/BusinessRulesPage";
import ExpireRuleConfigPage from "components/pages/ExpireRuleConfigPage/ExpireRuleConfigPage";
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";

const App = ({ location, isAuthenticated }) => (
  <div className="app-comp-container">
    <ToastContainer position="top-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnVisibilityChange
      draggable
      draggablePercent={60}
      pauseOnHover
    />
    <Switch>
      <UserRoute path="/pick-task" exact component={PickTaskPage} />
      <UserRoute path="/operation" exact component={OperationPage} />
      <UserRoute path="/system-setting" exact component={SystemSettingPage} />
      <UserRoute path="/replenish-task" exact component={ReplenishTaskPage} />
      <UserRoute path="/replenish-operation" exact component={ReplenishOperationPage} />
      <UserRoute path="/inventory-search" exact component={InventorySearchPage} />
      <UserRoute path="/task-list" exact component={TaskListPage} />
      <UserRoute path="/business-rules" exact component={BusinessRulesPage} />
      <UserRoute path="/expire-rule-config" exact component={ExpireRuleConfigPage} />
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
