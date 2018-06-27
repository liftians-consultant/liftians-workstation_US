import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Input } from 'semantic-ui-react';
import BinGroup from '../BinGroup/BinGroup';
import './OrderFinishModal.css';

class OrderFinishModal extends Component {


  constructor() {
    super();

    this.inputRef = React.createRef();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOnOpen = this.handleOnOpen.bind(this);
  }

  handleOnOpen() {
    this.inputRef.current.focus();
  }

  handleInputChange(e) {
    if (e.key === 'Enter' && e.target.value) {
      e.persist();
      setTimeout(() => {
        this.props.modalClose(e.target.value, this.props.data.binNum);
        this.inputRef.current.inputRef.value = '';
        this.inputRef.current.focus();
      }, 500)
    }
  }

  render() {
    const { data, modalOpen, modalClose } = this.props;

    return (
      <Modal open={ modalOpen }
        size="small" basic
        onOpen={this.handleOnOpen}
        style={{ marginTop: '1rem', marginLeft: 'auto', marginRight: 'auto' }} 
        className="order-finish-modal-container"
      >
        <Modal.Header><h1 className="modal-header">Order #{ data.orderNo } completed</h1></Modal.Header>
        <Modal.Content scrolling>
          <BinGroup openedBinNum={ data.binNum } highlightColor={ 'lightgreen' }></BinGroup>
          <h2>Please replaced the highlighed bin with an empty bin</h2>
          <h2>Please scan the bin</h2>
          <Input onKeyPress={this.handleInputChange}
                ref={this.inputRef} />
        </Modal.Content>
        {/* <Modal.Actions>
          <Button primary size="huge"
            onClick={ modalClose }>
            Ok
          </Button>
        </Modal.Actions> */}
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