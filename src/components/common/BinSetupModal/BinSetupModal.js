import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input } from 'semantic-ui-react';
import BinGroup from '../../pages/OperationPage/components/BinGroup/BinGroup';
import './BinSetupModal.css';

class BinSetupModal extends Component {

  constructor() {
    super();

    this.inputRef = React.createRef();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOnOpen = this.handleOnOpen.bind(this);
  }

  handleOnOpen(e) {
    this.inputRef.current.focus();
  }

  handleInputChange(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();
      setTimeout(() => {
        this.props.onInputEnter(e.target.value, this.props.location);
        this.inputRef.current.inputRef.value = '';
        this.inputRef.current.focus();
      }, 500)
    }
  }

  render() {
    const { open, location } = this.props;
    return (
      <Modal className="bin-setup-modal-container"
        size="fullscreen"
        open={open}
        onOpen={ this.handleOnOpen }
        style={{ marginTop: '15%', marginLeft: 'auto', marginRight: 'auto' }}
        >
        <Modal.Header>Bin Setup</Modal.Header>
        <Modal.Content>
          <div className="info-text">Please place an empty bin on correspond location and scan the barcode on it.</div>
          <BinGroup openedBinNum={location} highlighColor='orange' size="150" />
          <Input onKeyPress={this.handleInputChange}
                 ref={this.inputRef} />
        </Modal.Content>
      </Modal>
    );
  }
}

BinSetupModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onInputEnter: PropTypes.func.isRequired,
  location: PropTypes.number.isRequired,
};


// bin position
// input box 
// on close function

export default BinSetupModal;