import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Icon, Button } from 'semantic-ui-react';

class WarningModal extends Component {
  render() {
    const { triggerText, headerText, contentText } = this.props;
    return (
      <Modal trigger={<Button size="tiny">{ triggerText}</Button>}
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
  triggerText: PropTypes.string.isRequired,
  headerText: PropTypes.string.isRequired,
  contentText: PropTypes.string.isRequired,
};

export default WarningModal;