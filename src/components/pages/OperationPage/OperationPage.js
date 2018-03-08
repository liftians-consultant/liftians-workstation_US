import React, { Component } from 'react';
import { connect } from "react-redux";
import PropTypes from 'prop-types';
import { Segment, Grid, Menu, Dropdown, Loader, Button } from 'semantic-ui-react';
import SideNavigation from '../../navigation/SideNavigation';
import './OperationPage.css';

class OperationPage extends Component {
  render() {
    return (
      <div>
        {/* <SideNavigation></SideNavigation> */}
        <div className="operationPage">
          <Grid>
            <Grid.Row>
              <Grid.Column width={4}>
                <Segment.Group>
                  <Segment>
                    <div className="shelf-object">
                    </div>
                  </Segment>
                </Segment.Group>
              </Grid.Column>
            </Grid.Row>
          </Grid>
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