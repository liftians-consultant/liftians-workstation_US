import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import api from '../../../api';
import { OrderDetailsTableColumn } from "../../../models/OrderDetailsTableColumn";
import { ReplenishDetailTableColumns } from "../../../models/ReplenishDetailTableColumns";
import './OrderDetailTable.css';

class OrderDetailTable extends Component {

  state = {
    recordDetails: [],
    loading: false
  }

  componentWillMount() {
    this.getRecords();
  }

  getRecords() {
    this.setState({ loading: true });

    if (this.props.taskType === 'P') {
      api.pick.retrievePickOrderItems(this.props.recordId).then(res => {
        console.log('order detail', res.data);
        this.setState({ recordDetails: res.data, loading: false});
      })
    } else if (this.props.taskType === 'R') {
      api.replenish.getReplenishDetailBySourceId(this.props.recordId).then(res => {
        this.setState({ recordDetails: res.data, loading: false });
      })
    }
  }

  render() {
    const { loading, recordDetails } = this.state;
    let columns = this.props.taskType === 'P' ? OrderDetailsTableColumn : ReplenishDetailTableColumns;
    return (
      <div className="orderDetailTableContainer">
        <ReactTable
          columns={columns}
          data={recordDetails}
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
  recordId: PropTypes.number.isRequired,
  taskType: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
};

export default OrderDetailTable;