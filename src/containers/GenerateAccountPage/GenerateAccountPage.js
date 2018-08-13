import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SubPageContainer from 'components/common/SubPageContainer/SubPageContainer';

class GenerateAccountPage extends Component {
  
  constructor() {
    super();

    this.backBtnHandler = this.backBtnHandler.bind(this);
  }

  backBtnHandler = (e) => {
    console.log('back');
    this.props.history.goBack();
  }

  render() {
    return (
      <div className="generate-account-page">
        <SubPageContainer
          title="Create Account"
          onBackBtnClicked={this.backBtnHandler}
        >
          <span>hiiii</span>
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
