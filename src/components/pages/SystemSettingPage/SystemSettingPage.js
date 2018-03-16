import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Grid, Button } from 'semantic-ui-react';
// import {BrowserHistory} from 'react-router';
import MenuButton from '../../common/MenuButton/MenuButton';

class SystemSettingPage extends Component {
  state = {  }


  goToPage = data =>
    this.props.history.push('/pick-task');

  backBtnHandler = (e) => {
    console.log('back');
    this.props.history.goBack();
  }

  render() {
    return (
      <div className=" ui container system-setting-page-container menu-page">
        {/* <Button onClick={ () => this.backBtnHandler() }>Go Back</Button> */}
        <Grid columns={3} >
          <Grid.Row>
            <Grid.Column>
              <MenuButton title="System Auth" name="system-auth" />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Business Rule" name="business-rule" />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Log Search" name="log-search" />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column>
              <MenuButton title="Volumne Change" name="volume-change" />
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="User" name="user-profile" />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}


SystemSettingPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    
  }
}

export default connect(mapStateToProps, {} )(SystemSettingPage);