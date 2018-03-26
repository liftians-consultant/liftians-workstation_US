import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
// import ReactTable from 'react-table';
// import 'react-table/react-table.css';
import { Grid, Menu, Dropdown, Loader, Button } from 'semantic-ui-react';
import api from '../../../api';
import InlineError from '../../messages/InlineError';
import OrderListTable from '../../common/OrderListTable/OrderListTable';
import { PickOrderTableColumns } from '../../../models/PickOrderTableModel';
import './PickTaskPage.css';

class PickTaskPage extends Component {

  state = {
    activeBillType: '11',
    activeProcessType: 0,
    ordersList: [],
    loading: false,
    errors: {}
  }

  // Dummy data, will retrieve from server
  billTypeOptions = [
    { key: 1, text: 'Regular Picking', index: 1, value: '11' },
    { key: 2, text: 'Shortage Picking', index: 2, value: '99' },
    { key: 3, text: 'Seperate Picking', index: 3, value: '12' },
    { key: 4, text: 'Adjustment Picking', index: 4, value: '4' },
  ];

  // Dummy data, will retrieve from server
  processOptions = [
    [
      { key: 0, text: 'Unprocessed', index: 0, value: 0 },
      { key: 1, text: 'Queuing', index: 1, value: 101 },
      { key: 2, text: 'Processing', index: 2, value: 100 },
      { key: 3, text: 'Finished', index: 3, value: 1 },
      { key: 4, text: 'Canceled', index: 4, value: -1 },
    ],
    // The following is the speciel case for Adjustment Process
    [
      { key: 0, text: 'Unprocessed', index: 0, value: 0 },
      { key: 1, text: 'Finished', index: 1, value: 101 },
      { key: 2, text: 'Canceled', index: 2, value: 100 },
    ],
  ];

  componentWillMount() {
    this.startStationOperationCall();
    this.getBillTypeName();
    this.getProcessStatusName();
  }

  startStationOperationCall() {
    this.setState({loading: true});
    api.station.startStationOperation(this.props.stationId, this.props.username, 'P').then(res => {
      // return 1 if success, 0 if failed
      let newState = { loading: false };
      if (!res.data) {
        newState = Object.assign(newState, { errors: { station: 'Cannot start station. Please contact your system admin'}});
      }
      this.setState(newState, this.retrievePickOrderReocrds);
    }).catch((e) => {
      this.setState({ errors: { station: 'Server Error. Please contact your system admin'}, loading: false })
      console.error(e);
    })
  }

  getBillTypeName() {
    api.menu.getBillTypeName('P').then(res => {
      if (res.data && res.data.length) {
        this.billTypeOptions = res.data.map((billType, index) => {
          return {
            key: index + 1,
            text: billType.billTypeName,
            index: index + 1,
            value: billType.billType
          }
        })
      }
    })
  }

  getProcessStatusName() {
    api.menu.getProcessStatusName('P').then(res => {
      if (res.data && res.data.length) {
        this.processOptions[0] = res.data.map((processType, index) => {
          return {
            key: index,
            text: processType.processStatus,
            index: index,
            value: processType.processStatusID
          }
        })
      }
    })
  }

  retrievePickOrderReocrds = () => {
    this.setState({loading: true});
    console.log('task:', this.state.activeBillType, 'process:', this.state.activeProcessType);
    api.pick.retrievePickOrderReocrdsByTypeAndState(1, this.state.activeBillType, this.state.activeProcessType).then( res => {
      this.setState({ ordersList: res.data, loading: false });
    })
  }

  handleTaskChange = (e, { value }) => {
    this.setState({ activeBillType: value, activeProcessType: 0 }, this.retrievePickOrderReocrds);
  }

  handleProcessChange = (e, { value }) => {
    this.setState({ activeProcessType: value }, this.retrievePickOrderReocrds);
  };

  handleStartBtn = (e) => {
    api.pick.callServerGeneratePickTask(this.props.stationId).then( res => {
      this.props.history.push('/operation');
    }).catch(error => {
      this.setState({ errors: { station: 'Error while server generate pick task. Please contact system admin.'}});
    })
    
  }

  render() {
    const { activeBillType, activeProcessType, loading, errors, ordersList } = this.state;
    
    const processList = activeBillType === 4 ? this.processOptions[1] : this.processOptions[0]; // If billType is Adjustment then use special process list
    const processMenuItems = processList.map((option, i) => 
      <Menu.Item key={i}
        index={i}
        active={ activeProcessType === option.value }
        content={ option.text }
        value={ option.value }
        onClick={ this.handleProcessChange }></Menu.Item>
    );

    return (
      <div className="ui pick-task-page-container">
        {/* <Dimmer active={this.state.loading}> */}
          <Loader content='Loading' active={this.state.loading} />
        {/* </Dimmer> */}
        { errors.station && <InlineError></InlineError> }
        <Grid>
          <Grid.Row>
            <Grid.Column width={16}>
              <Menu>
                <Menu.Item name="taskType">
                <Dropdown placeholder='Select Task' 
                  value={ activeBillType } 
                  fluid
                  selection
                  options={ this.billTypeOptions }
                  onChange={ this.handleTaskChange }  
                />
                </Menu.Item>
                { processMenuItems }
              </Menu>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <div className="orderlist-table-container">
                <OrderListTable listData={ ordersList } loading={ loading } columns={ PickOrderTableColumns } />
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <div className="order-list-btn-group">
                <Button size="huge" primary onClick={() => this.handleStartBtn() }>Start</Button>
                <Button size="huge" secondary>Pause</Button>
                <Button size="huge" secondary>Print</Button>
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

PickTaskPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  username: PropTypes.string.isRequired,
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id
  };
}

export default connect(mapStateToProps, {})(PickTaskPage);