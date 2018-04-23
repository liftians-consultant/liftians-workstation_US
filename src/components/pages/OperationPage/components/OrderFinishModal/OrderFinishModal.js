import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'semantic-ui-react';
import BinGroup from '../BinGroup/BinGroup';

class OrderFinishModal extends Component {

  render() {
    const { data, modalOpen, modalClose } = this.props;

    return (
      <Modal open={ modalOpen }
        size="small" basic
        style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto' }} 
      >
        <Modal.Header><h1>Order #{ data.orderNo } completed</h1></Modal.Header>
        <Modal.Content scrolling>
          <Modal.Description>
            <BinGroup openedBinNum={ data.binNum } highlightColor={ 'lightgreen' }></BinGroup>
            <h2>Please remove the hightlighted bin</h2>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button primary size="huge"
            onClick={ modalClose }>
            Ok
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

OrderFinishModal.propTypes = {
  data: PropTypes.shape({
    binNum: PropTypes.number,
    orderNo: PropTypes.string,
  }).isRequired,
  modalOpen: PropTypes.bool.isRequired,
  modalClose: PropTypes.func.isRequired,
};

export default OrderFinishModal;