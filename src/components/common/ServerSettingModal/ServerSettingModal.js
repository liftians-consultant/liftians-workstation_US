import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Icon, Button, Form, Input } from 'semantic-ui-react';
import axios from 'axios';

class ServerSettingModal extends Component {
  state = {
    host: '',
    port: '',
    open: false
  };

  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    // this.open = this.open.bind(this);
    // this.handleClose = this.handleClose.bind(this);
  }

  componentWillMount() {
    const host = localStorage.serverHost || 'http://localhost';
    const port = localStorage.serverPort || '8060';
    this.setState({host, port});
  }

  open = () => this.setState({ open: true })
  close = () => this.setState({ open: false })

  handleChange(e, { name, value }) {
    let newState = {};
    newState[name] = value;
    this.setState(newState);
  }

  saveConfig() {
    localStorage.serverHost = this.state.host;
    localStorage.serverPort = this.state.port;
    axios.defaults.baseURL = `${localStorage.serverHost}:${localStorage.serverPort}`;
    this.setState({open: false});
    console.log('NEW SERVER CONFIG SAVED!');
  }

  render() {
    const { host, port, open } = this.state;
    return (
      <Modal trigger={<Button className="setting-btn" icon="cogs" size="massive" />}
        size="tiny"
        open={open}
        onOpen={this.open}
        onClose={this.close}
        style={{ marginTop: '10%', marginLeft: 'auto', marginRight: 'auto' }}>
        <Modal.Header><Icon name='cogs' size="large" /> Server URL Setting</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field control={Input} label="Host" name="host" value={host} onChange={this.handleChange} />
            <Form.Field control={Input} label="Port" name="port" value={port} onChange={this.handleChange} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button positive icon="check" content="Save" onClick={() => this.saveConfig()} />
        </Modal.Actions>
      </Modal>
    );
  }
}

ServerSettingModal.propTypes = {

};

export default ServerSettingModal;