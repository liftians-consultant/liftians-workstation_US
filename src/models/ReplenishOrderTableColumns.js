export const ReplenishOrderTableColumns = [
  {
    Header: 'Billing ID.',
    accessor: 'replenishBillNo'
  }, {
    Header: 'Source ID',
    accessor: 'sourceID'
  }, {
    Header: 'Receiver',
    accessor: 'receiver'
  }, {
    Header: 'Receive Date',
    accessor: 'replenishDate'
  }, {
    Header: '# of products',
    accessor: 'totalDistinctProduct'
  }, {
    Header: 'Total receive qty.',
    accessor: 'totalReceiveQty'
  }, {
    Header: 'Status',
    accessor: 'processStatus'
  }
]