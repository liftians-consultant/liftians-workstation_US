import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
// import { Route } from "react-router-dom";
// import logo from './logo.svg';
import './App.css';
import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/LoginPage";
import PickTaskPage from "./components/pages/PickTaskPage/PickTaskPage";
import OperationPage from './components/pages/OperationPage/OperationPage';
import GuestRoute from "./components/routes/GuestRoute";
import UserRoute from "./components/routes/UserRoute";
// import TopNavigation from './components/navigation/TopNavigation';

const App = ({ location, isAuthenticated }) => (
  <div className="ui">
    {/* {isAuthenticated && <TopNavigation />} */}
    <UserRoute location={location} path="/" exact component={HomePage} />
    <GuestRoute location={location} path="/login" exact component={LoginPage} />
    <UserRoute location={location} path="/pick-task" exact component={PickTaskPage} />
    <UserRoute location={location} path="/operation" exact component={OperationPage} />
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
