import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import LoginPage from "./components/pages/LoginPage";

const App = ({ location, isAuthenticated }) => (
  <div className="ui container">
  <h1>test</h1>
    {/* {isAuthenticated && <TopNavigation />} */}
    <Route location={location} path="/" exact component={LoginPage} />
  </div>
);

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  // isAuthenticated: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
  return {
    // isAuthenticated: !!state.user.email
  };
}

export default connect(mapStateToProps)(App);
