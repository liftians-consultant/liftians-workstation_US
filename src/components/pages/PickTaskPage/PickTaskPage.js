import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Grid, Menu, Dropdown, Loader, Button } from 'semantic-ui-react';
import SideNavigation from '../../navigation/SideNavigation';
import api from '../../../api';
import InlineError from '../../messages/InlineError';
import { PickOrderTableColumns } from '../../../models/PickOrderTableModel';
import OrderDetailTable from '../../common/OrderDetailTable/OrderDetailTable';
import './PickTaskPage.css';


const workstationMenuCss = {
  paddingTop: '10%'
}

const taskOptions = [
  { key: 1, text: 'Regular Picking', index: 1, value: '11' },
  { key: 2, text: 'Shortage Picking', index: 2, value: '99' },
  { key: 3, text: 'Seperate Picking', index: 3, value: '12' },
  { key: 4, text: 'Adjustment Picking', index: 4, value: '4' },
];

// save it in translate file, use fetch to get it.
const processOptions = [
  [
    { key: 0, text: 'Unprocessed', index: 0, value: 0 },
    { key: 1, text: 'Queuing', index: 1, value: 101 },
    { key: 2, text: 'Processing', index: 2, value: 100 },
    { key: 3, text: 'Finished', index: 3, value: 1 },
    { key: 4, text: 'Canceled', index: 4, value: -1 },
  ],
  // value is wrong
  [
    { key: 0, text: 'Unprocessed', index: 0, value: 0 },
    { key: 1, text: 'Finished', index: 1, value: 101 },
    { key: 2, text: 'Canceled', index: 2, value: 100 },
  ],
];

class PickTaskPage extends Component {

  state = {
    activeTask: '11',
    activeProcess: 0,

    ordersList: [],
    loading: false,
    errors: {}
  }

  constructor(props) {
    super(props);
    
  }

  componentWillMount() {
    this.startStationOperationCall();
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

  retrievePickOrderReocrds = () => {
    this.setState({loading: true});
    console.log('task:', this.state.activeTask, 'process:', this.state.activeProcess);
    api.pick.retrievePickOrderReocrdsByTypeAndState(1, this.state.activeTask, this.state.activeProcess).then( res => {
      this.setState({ ordersList: res.data, loading: false });
    })
  }

  handleTaskChange = (e, { value }) => {
    this.setState({ activeTask: value, activeProcess: 0 }, this.retrievePickOrderReocrds);
  }

  handleProcessChange = (e, { value }) => {
    this.setState({ activeProcess: value }, this.retrievePickOrderReocrds);
  };

  handleStartBtn = (e) => {
    api.pick.callServerGeneratePickTask(this.props.stationId).then( res => {
      this.props.history.push('/operation');
    }).catch(error => {
      this.setState({ errors: { station: 'Error while server generate pick task. Please contact system admin.'}});
    })
    
  }

  render() {
    const { activeTask, activeProcess, loading, errors, ordersList } = this.state;
    
    const processList = activeTask === 4 ? processOptions[1] : processOptions[0];
    const processMenuItems = processList.map((option, i) => 
      <Menu.Item key={i}
        index={i}
        active={ activeProcess === option.value }
        content={ option.text }
        value={ option.value }
        onClick={ this.handleProcessChange }></Menu.Item>
    );

    return (
      <div>
        {/* <SideNavigation></SideNavigation> */}
        {errors.station && <InlineError></InlineError> }
        <div className="ui workstation-menu" style={ workstationMenuCss }>
          <Grid>
            <Grid.Row>
              <Grid.Column width={16}>
                <Menu>
                  <Menu.Item name="taskType">
                  <Dropdown placeholder='Select Task' 
                    value={ activeTask } 
                    fluid
                    selection
                    options={ taskOptions }
                    onChange={ this.handleTaskChange }  
                  />
                  </Menu.Item>
                  { processMenuItems }
                </Menu>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <Loader inverted active={loading} size="large">Loading</Loader>
                <div className="orderlist-table-container">
                  <ReactTable
                    columns={PickOrderTableColumns}
                    data={ordersList}
                    defaultPageSize={15}
                    SubComponent={(row) => <OrderDetailTable orderId={row.original.order_No} /> }
                    loading={loading}
                    manual
                    resizable={false}
                    filterable={false}
                    showPageJump={false}
                    showPagination={false}
                    className="-striped -highlight orderlist-table"
                  />
                </div>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                <div className="order-list-btn-group">
                  <Button primary onClick={() => this.handleStartBtn() }>Start</Button>
                  <Button secondary>Pause</Button>
                  <Button secondary>Print</Button>
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}

PickTaskPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired
  }).isRequired,
  username: PropTypes.string.isRequired,
  stationId: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id
  };
}

export default connect(mapStateToProps, {})(PickTaskPage);