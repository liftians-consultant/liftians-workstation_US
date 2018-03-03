import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { Grid, Menu, Dropdown, Message, Dimmer, Loader, Accordion, Button } from 'semantic-ui-react';
import TopNavigation from '../navigation/TopNavigation';
import api from '../../api';
import InlineError from '../messages/InlineError';
import { PickOrderTableColumns } from '../../models/PickOrderTableModel';
import './PickTaskPage.css';
import OrderDetailTable from '../common/OrderDetailTable/OrderDetailTable';

const workstationMenuCss = {
  paddingTop: '100px'
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

// const taskOptions = [
//   { key: 1, text: '配送出貨', index: 1, value: '11' },
//   { key: 2, text: '短缺退貨', index: 2, value: '99' },
//   { key: 3, text: '拆包出庫', index: 3, value: '12' },
//   { key: 4, text: '調整出庫', index: 4, value: '4' },
// ];

// const processOptions = [
//   [
//     { key: 0, text: '尚未處理', index: 0, value: 0 },
//     { key: 1, text: '等待執行', index: 1, value: 101 },
//     { key: 2, text: '正在執行', index: 2, value: 100 },
//     { key: 3, text: '已完成', index: 3, value: 1 },
//     { key: 4, text: '取消訂單', index: 4, value: -1 },
//   ],
//   // value is wrong
//   [
//     { key: 0, text: '尚未處理', index: 0, value: 0 },
//     { key: 1, text: '已完成', index: 1, value: 101 },
//     { key: 2, text: '已取消', index: 2, value: 100 },
//   ],
// ];


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
    this.startStationOperationCall(this.retrievePickOrderReocrds);
  }

  startStationOperationCall(callback) {
    this.setState({loading: true});
    api.station.startStationOperation(1, this.props.username, 'P').then(res => {
      // return 1 if success, 0 if failed
      if (!res.data) {
        this.setState({ errors: { station: 'Cannot start station. Please contact your system admin'}, loading: false })
      } else {
        this.setState({ loading: false});
      }

      if (callback) {
        callback();
      }
    }).catch((e) => {
      this.setState({ errors: { station: 'Server Error. Please contact your system admin'}, loading: false })
      console.error(e);
    })
    
  }

  retrievePickOrderReocrds = () => {
    this.setState({loading: true});
    api.pick.retrievePickOrderReocrdsByTypeAndState(1, this.state.activeTask, this.state.activeProcess).then( res => {
      console.log('order', res.data);
      this.setState({ ordersList: res.data, loading: false });
    })
  }

  handleTaskChange = (e, { value }) => {
    this.setState({ activeTask: value, activeProcess: 0 });
    this.retrievePickOrderReocrds();
  }

  handleProcessChange = (e, { index }) => {
    this.setState({ activeProcess: index })
    this.retrievePickOrderReocrds();
  };

  render() {
    const { activeTask, activeProcess, loading, errors, ordersList } = this.state;
    
    console.log(activeTask);
    const processList = activeTask === 4 ? processOptions[1] : processOptions[0];
    const processMenuItems = processList.map((option, i) => 
      <Menu.Item key={i}
        index={i}
        active={ activeProcess === i }
        content={ option.text }
        onClick={ this.handleProcessChange }></Menu.Item>
    );

    // const panels = ordersList.forEach(element => {
    //   return {
    //     title: {
    //       content: <
    //     }
    //   }
    // });

    return (
      <div>
        <TopNavigation></TopNavigation>
        {errors.station && <InlineError></InlineError> }
        <div className="ui container workstation-menu" style={ workstationMenuCss }>
          <Grid columns={2} divided>
            <Grid.Row>
              <Grid.Column width={4}>
                <Menu vertical>
                  <Menu.Item name="taskType">
                  <Dropdown placeholder='Select Task' 
                    value={ activeTask } 
                    fluid
                    selection
                    options={ taskOptions }
                    onChange={ this.handleTaskChange }  
                  />
                  </Menu.Item>
                </Menu>
                <Menu vertical>
                  { processMenuItems }
                </Menu>
              </Grid.Column>
              <Grid.Column width={12}>
                <Grid.Row>
                  {/* <Dimmer > */}
                    <Loader inverted active={loading} size="large">Loading</Loader>
                  {/* </Dimmer> */}
                  <div className="orderlist-table">
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
                    className="-striped -highlight"
                  />
                  </div>
                </Grid.Row>
                <Grid.Row>
                  <div className="order-list-btn-group">
                    <Button primary>Start Picking</Button>
                    <Button secondary>Pause</Button>
                    <Button secondary>Print</Button>
                  </div>
                </Grid.Row>
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
};

function mapStateToProps(state) {
  return {
    username: state.user.username
  };
}

export default connect(mapStateToProps, {})(PickTaskPage);