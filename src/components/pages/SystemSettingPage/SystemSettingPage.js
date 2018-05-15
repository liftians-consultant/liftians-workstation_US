import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Grid, Message } from 'semantic-ui-react';
// import {BrowserHistory} from 'react-router';
import MenuButton from '../../common/MenuButton/MenuButton';
import api from '../../../api';
import ConfirmDialogModal from '../../common/ConfirmDialogModal/ConfirmDialogModal';
class SystemSettingPage extends Component {
  state = {
    openSystemResetModal: false,
    successMessage: ''
  }

  constructor(props) {
    super(props);

    this.resetSystemBtnHandler = this.resetSystemBtnHandler.bind(this);
    this.resetSystemModalCloseHandler = this.resetSystemModalCloseHandler.bind(this);
  }

  goToPage = name => {
    console.log(name);
    this.props.history.push(name);
  }
  resetSystemBtnHandler() {
    this.setState({ openSystemResetModal: true });
  }

  resetSystemModalCloseHandler(confirm) {
    this.setState({ openSystemResetModal: false });
    if (confirm) {
      api.pick.resetTestData(this.props.stationId).then(res => {
        if (res.data) { // server return boolean value
          console.log('Reset Success');
          this.setState({ successMessage: 'You have successfully reset test data!'});
        }
      }).catch((e) => {
        console.error('Reset Failed');
      })
    }
  }

  backBtnHandler = (e) => {
    console.log('back');
    this.props.history.goBack();
  }

  render() {
    const { successMessage } = this.state;

    return (
      <div className="ui container system-setting-page-container menu-page">
        {/* <Button onClick={ () => this.backBtnHandler() }>Go Back</Button> */}
        { successMessage && <Message header="Reset Success" success
          content={ successMessage } /> }
        <Grid columns={3} >
          <Grid.Row>
            <Grid.Column>
              <MenuButton title="Reset System" name="reset-system" clickHandler={ this.resetSystemBtnHandler }/>
            </Grid.Column>
            <Grid.Column>
              <MenuButton title="Business Rules" name="business-rules" clickHandler={ this.goToPage } />
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
            <Grid.Column>
              <MenuButton title="Task List" name="task-list" clickHandler={ this.goToPage }/>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        { this.state.openSystemResetModal && <ConfirmDialogModal size={'mini'} 
          open={ this.state.openSystemResetModal }
          close={ this.resetSystemModalCloseHandler }
          header={ 'Reset System' }
          content={ 'Are you sure you want to reset the system?' }
           /> }
      </div>
    );
  }
}


SystemSettingPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    stationId: state.station.id
  }
}

export default connect(mapStateToProps, {} )(SystemSettingPage);