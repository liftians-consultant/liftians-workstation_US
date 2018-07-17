import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Input } from 'semantic-ui-react';
import BinGroup from 'components/Operation/BinGroup/BinGroup';
import ETagService from 'services/ETagService';
import './BinSetupModal.css';

class BinSetupModal extends Component {

  constructor() {
    super();

    this.setupInputRef = React.createRef();
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.open !== this.props.open && this.props.open === true) {
      setTimeout(function(){
        this.setupInputRef.current.inputRef.value = '';
        this.setupInputRef.current.focus();
      }.bind(this), 0)
    }

    if (prevProps.location !== this.props.location && this.props.location) {
      setTimeout(function() {
        ETagService.turnEndLightOnById(this.props.location); 
      }.bind(this), 300);
    }
  }

  handleInputChange(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();
      setTimeout(function() {
        this.props.onInputEnter(e.target.value, this.props.location);
        this.setupInputRef.current.inputRef.value = '';
        this.setupInputRef.current.focus();
      }.bind(this), 300)
    }
  }

  render() {
    const { open, location } = this.props;
    return (
      <Modal className="bin-setup-modal-container"
        size="fullscreen"
        open={open}
        onOpen={ this.handleOnOpen }
        style={{ marginTop: '10%', marginLeft: 'auto', marginRight: 'auto' }}
        >
        <Modal.Header>Bin Setup</Modal.Header>
        <Modal.Content>
          <div className="info-text">Please place an empty bin on correspond location and scan the barcode on it.</div>
          <BinGroup openedBinNum={location} highlighColor='orange' size="150" />
          <Input onKeyPress={this.handleInputChange}
                 ref={this.setupInputRef} />
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