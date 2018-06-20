import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connet } from 'react-redux';

class BinInitPage extends Component {

  

  render() {
    return (
      <div>
        
      </div>
    );
  }
}

BinInitPage.propTypes = {

};

function mapStateToProps(state) {
  return {
    stationId: state.station.id
  }
}
export default connect(mapStateToProps, null)(BinInitPage);