import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Icon } from 'semantic-ui-react';

class WarningModal extends Component {
  render() {
    const { open, onClose, headerText, contentText } = this.props;
    return (
      <Modal open={open}
        onClose={onClose}
        size="tiny"
        style={{ marginTop: '20%', marginLeft: 'auto', marginRight: 'auto' }}>
        <Modal.Header><Icon name='warning circle' size="large" /> { headerText }</Modal.Header>
        <Modal.Content>
          <p>{ contentText }</p>
        </Modal.Content>
      </Modal>
    );
  }
}

WarningModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  headerText: PropTypes.string.isRequired,
  contentText: PropTypes.string.isRequired,
};

export default WarningModal;