import React, { Component } from 'react';
import erpApi from 'erpApi';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import SubPageContainer from 'components/common/SubPageContainer/SubPageContainer';
import CreateAccountForm from 'components/forms/CreateAccountForm';

class GenerateAccountPage extends Component {
  constructor() {
    super();

    this.backBtnHandler = this.backBtnHandler.bind(this);
    this.submit = this.submit.bind(this);
  }

  backBtnHandler = () => {
    console.log('back');
    this.props.history.goBack();
  }

  submit = data => erpApi.account.getAccount(data.accountNo).then((res) => {
    if (res.success) {
      console.log('account found', res.account);
      return false;
    }

    return erpApi.account.createAccount(data).then((response) => {
      if (response.data && response.data.success) {
        toast.success('Account Created');
        return true;
      }
      return false;
    });
  });

  render() {
    return (
      <div className="generate-account-page">
        <SubPageContainer
          title="Create Account"
          onBackBtnClicked={this.backBtnHandler}
        >
          <CreateAccountForm onSubmit={this.submit} />
        </SubPageContainer>
      </div>
    );
  }
}

GenerateAccountPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default GenerateAccountPage;
