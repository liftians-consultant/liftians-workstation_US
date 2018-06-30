import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Grid, Image, Segment } from 'semantic-ui-react'

import LoginForm from 'components/forms/LoginForm';
import ServerSettingModal from "components/common/ServerSettingModal/ServerSettingModal";
import { login } from "redux/actions/authAction";

import logo from 'assets/images/assembly_logo_trans.png';

class LoginPage extends Component {

  constructor() {
    super();
    this.handleSettingBtnClick = this.handleSettingBtnClick.bind(this);
  }

  submit = data =>
    this.props.login(data).then(() => this.props.history.push("/"));

  handleSettingBtnClick() {

  }

  render() {
    return (
      <div className="login-page">
        <style>{`
        
        body div.login-page {
          height: 100%;
        }
        .login-page {
          // padding-top: 10%;
        }
        .setting-btn {
          position: absolute;
          left: 30px;
          bottom: 30px;
        }
        `}</style>
        <Grid
          textAlign='center'
          style={{ height: '100%' }}
          verticalAlign='middle'>
          <Grid.Column style={{ maxWidth: 450 }}>
            <Image src={logo} size='huge' centered />
            <Segment>
              <LoginForm submit={this.submit}></LoginForm>
            </Segment>
          </Grid.Column>
        </Grid>
        <ServerSettingModal />
      </div>
    );
  }
}

LoginPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  login: PropTypes.func.isRequired
};

export default connect(null, { login })(LoginPage);
