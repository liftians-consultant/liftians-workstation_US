import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { Grid, Menu, Dropdown, Loader, Button, Dimmer, Input } from 'semantic-ui-react';
import ReactTable from "react-table";
import checkboxHOC from 'react-table/lib/hoc/selectTable';
import api from '../../../api';
import InlineError from '../../messages/InlineError';
import OrderListTable from '../../common/OrderListTable/OrderListTable';
import { ReplenishOrderTableColumns } from '../../../models/ReplenishOrderTableColumns';
import OrderDetailTable from '../../common/OrderDetailTable/OrderDetailTable';

import './ReplenishTaskPage.css';

const CheckboxTable = checkboxHOC(ReactTable);

const testListData = [
  {
    billNo: '139492',
    receiver: 'Kevin Hong',
    receiveDate: '12345324',
    numberOfProducts: 1,
    totalReceiveQuantity: 20,
    statusNameInChn: 'In process'
  }
]
class ReplenishTaskPage extends Component {
  state = {
    activeBillType: '01',
    activeProcessType: 0,
    ordersList: [],
    loading: false,
    errors: {},
    selection: [], // select react table
    selectAll: false, // select react table
    searchedList: []
  }

  // Dummy data, will retrieve from server
  billTypeOptions = [
    { key: 1, text: 'Regular Replenish', index: 1, value: '01' },
    { key: 2, text: 'Return Replenish', index: 2, value: '11' },
    // { key: 3, text: 'Adjustment Replenish', index: 3, value: '4' },
  ];

  // Dummy data, will retrieve from server
  processOptions = [
    [
      { key: 0, text: 'Unprocessed', index: 0, value: 0 },
      { key: 1, text: 'Processing', index: 1, value: 100 },
      { key: 2, text: 'Finished', index: 2, value: 1 },
      { key: 3, text: 'Canceled', index: 3, value: -1 },
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

  getBillTypeName() {
    api.menu.getBillTypeName('R').then(res => {
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
    api.menu.getProcessStatusName('R').then(res => {
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

  retrieveReplenishRecords = () => {
    this.setState({loading: true});
    console.log('task:', this.state.activeBillType, 'process:', this.state.activeProcessType);
    api.replenish.retrieveReplenishRecords(this.props.stationId, this.state.activeBillType, this.state.activeProcessType).then( res => {
      // res.data = testListData;
      this.setState({ ordersList: res.data, loading: false }, this.filterOrderListBySourceId);
    })
  }

  handleTaskChange = (e, { value }) => {
    this.setState({ activeBillType: value, activeProcessType: 0 }, this.retrieveReplenishRecords);
  }

  handleProcessChange = (e, { value }) => {
    this.setState({ activeProcessType: value }, this.retrieveReplenishRecords);
  };

  handleSearchChange = (e, { value }) => {
    this.filterOrderListBySourceId(value)
  };

  filterOrderListBySourceId(keyword = '') {
    const  filteredList = this.state.ordersList.filter((order) => {
      return String(order.sourceID).indexOf(keyword) !== -1
    });

    this.setState({ searchedList: filteredList });
  }


  startStationOperationCall() {
    this.setState({loading: true});
    api.station.startStationOperation(this.props.stationId, this.props.username, 'R').then(res => {
      // return 1 if success, 0 if failed
      let newState = { loading: false };
      if (!res.data) {
        newState = Object.assign(newState, { errors: { station: 'Cannot start station. Please contact your system admin'}});
      }
      this.setState(newState, this.retrieveReplenishRecords);
    }).catch((e) => {
      this.setState({ errors: { station: 'Server Error. Please contact your system admin'}, loading: false })
      console.error(e);
    })
  }

  // For Select React Table
  toggleSelection = (key, shift, row) => {
    // start off with the existing state
    let selection = [
      ...this.state.selection
    ];
    const keyIndex = selection.indexOf(key);
    // check to see if the key exists
    if (keyIndex >= 0) {
      // it does exist so we will remove it using destructing
      selection = [
        ...selection.slice(0, keyIndex),
        ...selection.slice(keyIndex + 1)
      ]
    } else {
      // it does not exist so add it
      selection.push(key);
    }
    // update the state
    this.setState({ selection });
  }

  // For Select React Table
  toggleAll = () => {
    const selectAll = this.state.selectAll ? false : true;
    const selection = [];
    if (selectAll) {
      // we need to get at the internals of ReactTable
      const wrappedInstance = this.checkboxTable.getWrappedInstance();
      // the 'sortedData' property contains the currently accessible records based on the filter and sort
      const currentRecords = wrappedInstance.getResolvedState().sortedData;
      // we just push all the IDs onto the selection array
      currentRecords.forEach((item) => {
        selection.push(item._original._id);
      })
    }
    this.setState({ selectAll, selection })
  }

  // For Select React Table
  isSelected = (key) => {
    return this.state.selection.includes(key);
  }


  render() {
    const { toggleSelection, toggleAll, isSelected, logSelection } = this;
    const { activeBillType, activeProcessType, loading, errors, ordersList, selectAll, searchedList } = this.state;
    
    const processList = activeBillType === 4 ? this.processOptions[1] : this.processOptions[0]; // If billType is Adjustment then use special process list
    const processMenuItems = processList.map((option, i) => 
      <Menu.Item key={i}
        index={i}
        active={ activeProcessType === option.value }
        content={ option.text }
        value={ option.value }
        onClick={ this.handleProcessChange }></Menu.Item>
    );

    const checkboxProps = {
      selectAll,
      isSelected,
      toggleSelection,
      toggleAll,
      selectType: 'checkbox',
      keyField: 'sourceID'
    };

    return (
      <div className="ui replenish-task-page-container">
        <Loader content='Loading' active={ this.state.loading } />

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
              <CheckboxTable
                ref={ (r) => this.checkboxTable = r }
                data={ searchedList }
                columns={ ReplenishOrderTableColumns }
                className="-striped -highlight replenish-task-table"
                SubComponent={ (row) => <OrderDetailTable taskType="R" recordId={ row.original.sourceID } /> }
                defaultPageSize={ 15 }
                manual
                resizable={false}
                filterable={false}
                {...checkboxProps}
              />
                {/* <OrderListTable listData={ ordersList } loading={ loading } columns={ ReplenishOrderTableColumns } /> */}
              </div>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={16}>
              <div className="search-input-group">
                <Input onChange={ this.handleSearchChange }
                size="big"
                icon='search'
                iconPosition='left'
                placeholder='Enter Source ID...' />
              </div>
              <div className="order-list-btn-group">
                <Button size="huge" primary onClick={() => this.handleStartBtn() }>Request POD</Button>
                {/* <Button size="huge" secondary>Pause</Button> */}
              </div>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}


ReplenishTaskPage.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  username: PropTypes.string.isRequired,
  stationId: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    username: state.user.username,
    stationId: state.station.id
  }
}

export default connect(mapStateToProps, {} )(ReplenishTaskPage);