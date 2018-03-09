import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import * as actions from '../../actions/auth';
// import leftLogo from '../../assets/images/logo@2x.png';
import './SideNavigation.css';


const SideNavigation = ({ logout }) => ({

  render() {
    const { stationId } = this.props;

    return (
      <div className="side-navigation">
        <div className="nav-top">
          <div className="nav-item-container nav-station-container">
            <span>Station #{stationId}</span>
          </div>
          <div className="nav-item-container">
          <Link to="/"><Button className="nav-btn">Menu</Button></Link>
          </div>
          <div className="nav-item-container">
          <Link to="/operation"><Button className="nav-btn">Operation</Button></Link>
          </div>
        </div>
        <div className="nav-buffer"></div>
        <div className="nav-item-container nav-bottom">
          <Button className="nav-btn" onClick={() => logout() }>Logout</Button>
        </div> 
      </div>
    );
  }
});

SideNavigation.propTypes = {
  logout: PropTypes.func.isRequired
};

function mapStateToProps(state) {
  return {
    stationId: state.station.id
  };
}

export default connect(mapStateToProps, { logout: actions.logout })(SideNavigation);