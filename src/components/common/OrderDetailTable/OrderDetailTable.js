import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import api from '../../../api';
import { OrderDetailsTableColumn } from "../../../models/OrderDetailsTableColumn";
import './OrderDetailTable.css';

class OrderDetailTable extends Component {

  state = {
    orderDetails: [],
    loading: false
  }

  componentWillMount() {
    console.log("MOUNTTTT", this.props.orderId);
    this.getPickOrderRecord();
  }

  getPickOrderRecord() {
    this.setState({ loading: true });
    api.pick.retrievePickOrderItems(this.props.orderId).then(res => {
      console.log('order detail', res.data);
      this.setState({ orderDetails: res.data, loading: false})
    })
  }

  render() {
    const { loading, orderDetails } = this.state;
    
    return (
      <div className="orderDetailTableContainer">
        <ReactTable
          columns={OrderDetailsTableColumn}
          data={orderDetails}
          loading={loading}
          manual
          defaultPageSize={5}
          resizable={false}
          filterable={false}
          showPageJump={false}
          showPagination={false}
          className="-striped -highlight"
        />
      </div>
    );
  }
}

OrderDetailTable.propTypes = {
  orderId: PropTypes.string.isRequired,
};

export default OrderDetailTable;