import React, { Component } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import TopNavigation from '../../navigation/TopNavigation';

class OperationPage extends Component {
  render() {
    return (
      <div>
        <TopNavigation></TopNavigation>
        <div className="operationPage">
          <h1>hi</h1>
        </div>
      </div>
    );
  }
}

OperationPage.propTypes = {

};

function mapStateToProps() {
  return {

  }
}
export default connect(mapStateToProps, {})(OperationPage);