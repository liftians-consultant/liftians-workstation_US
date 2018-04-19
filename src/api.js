import axios from 'axios';

/**
 * All API call.
 */
if (process.env.REACT_APP_ENV === 'PRODUCTION') {
  axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;
}

const user = {
  login: credentials =>
    axios.post('login', { ...credentials }).then(res => res.headers.authorization),
  logout: () =>
    axios.post('logout').then(res => res),
  getInfoById: (empId) =>
    axios.post('Login', { name: 'EmpolyeesFindByID', parameter: [empId] }).then(res => res.data),
};

const menu = {
  getBillTypeName: (operationType) =>
    axios.post('Common', {
      name: 'BillType',
      parameter: [operationType]
    }),
  getProcessStatusName: (operationType) =>
    axios.post('Common', {
      name: 'ProcessStatus',
      parameter: [operationType]
    }),
}

const station = {
  activateStationWithUser: (stationId, empId) =>
    axios.post('Login', {
      name: 'ActivateStationOperation',
      parameter: [String(stationId), empId, '4']
    }
  ).then(res => res.data),

  checkCurrentUnFinishTask: stationId =>
    axios.post('Login', {
      name: 'CheckCurrentUnFinishTask',
      parameter: [stationId]
    }).then(res => res.data),

  atStationPodLayoutInfo: (podId, podSide) =>
    axios.post('Common', {
      name: 'GetPodLayout',
      parameter: [
        String(podId),
        String(podSide)
      ]
    }),

  atStationTask: (stationId) =>
    axios.get('atStation/CurrentTask?stationID=' + stationId),

  startStationOperation: (stationId, empId, operationType) =>
    axios.post('Pick', {
      name: 'StartStationOperation',
      parameter: [stationId, empId, operationType]
    }),

  stopStationOperation: (stationId, empId, taskType) =>
    axios.post('Temp', {
      name: 'StopStationOperation',
      parameter: [stationId, empId, taskType]
    }),

  forcePodToLeaveStationByTaskId: (stationId, taskId) =>
    axios.post('Common', {
      name: 'ForcePod2LeaveStationByTaskID',
      parameter: [
        String(stationId),
        String(taskId)
      ]
    }),
};

const pick = {
  resetTestData: (stationId) =>
    axios.post('Pick', {
      name: 'ResetTestData',
      parameter: [stationId]
    }),
  retrievePickOrderReocrdsByTypeAndState: (stationId, billTypeId, processId) =>
    axios.post('Pick', {
      name: 'DisplayPickMenu',
      parameter: [
        stationId,
        String(billTypeId),
        String(processId)
      ]
    }),

  retrievePickOrderItems: (orderId) =>
    axios.post('Temp', {
      name: 'DisplayPickOrderDetail',
      parameter: [orderId]
    }),

  callServerGeneratePickTask: (stationId) =>
    axios.post('Temp', {
      name: 'GenPickTask',
      parameter: [stationId]
    }),

  stopPickOperation: (stationId, empId) =>
    station.stopStationOperation(stationId, empId, 'P'),

  getPickInfoByTaskId: (taskId) =>
    axios.post('Pick', {
      name: 'GetPickInfoByTaskID',
      parameter: [String(taskId)]
    }),

  atStationAfterPickProduct: (data) =>
    axios.post('Temp', {
      name: 'AtStationAfterPickProduct',
      parameter: [
        String(data.stationId),
        String(data.shelfId),
        String(data.boxId),
        String(data.orderNo),
        String(data.sourceLinesId),
        String(data.productId),
        String(data.lotNo),
        String(data.packageBarcode),
        String(data.pickQuantity),
        String(data.taskSubtype),
        String(data.shortQty)
      ]
    }),
  getProductSerialNum: (data) =>
    axios.post('Pick', {
      name: 'GetProductByInvLocation',
      parameter: [
        String(data.podId),
        String(data.podSide),
        String(data.shelfId),
        String(data.boxId)
      ]
    }),

  atHolderAfterPickProduct: (data) =>
    axios.post('Temp', {
      name: 'AtHolderAfterPickProduct',
      parameter: [
        String(data.holderId),
        String(data.orderNo),
        String(data.sourceLinesId),
        String(data.productId),
        String(data.lotNo),
        String(data.taskSubtype),
        String(data.pickQuantity),
      ]
    }),

  checkIsOrderFinished: (orderNum) =>
    axios.post('Temp', {
      name: 'IsOrderFinished',
      parameter: [ orderNum ]
    }),

  getInventoryByProductBarcode: (productId, podId, podSide) =>
    axios.post('Pick', {
      name: 'GetInventoryByProductBarcode',
      parameter: [
        productId,
        String(podId || 0),
        String(podSide || 0)
      ]
    })
};

const replenish = {
  genReplenishTask: (stationId) =>
    axios.post('Temp', {
      name: 'GenReplenishTask',
      parameter: [ stationId ]
    }),

  retrieveReplenishRecords: (stationId, billTypeId, processId) =>
    axios.post('Replenish', {
      name: 'DisplayReplenish',
      parameter: [
        String(stationId),
        String(billTypeId),
        String(processId)
      ]
    }),

  getReplenishDetailBySourceId: (sourceId) =>
    axios.post('Replenish', {
      name: 'GetReplenishDetailBySourceID',
      parameter: [ String(sourceId) ]
    }),
  replenishBySourceId: (stationId, userId, sourceIdList, jobPriority) =>
    axios.post('Replenish', {
      name: 'ReplenishBySourceID',
      parameter: [
        String(stationId),
        String(userId),
        String(sourceIdList),
        String(jobPriority)
      ]
    }),
  getReplenishInfoByTaskId: (taskId) =>
    axios.post('Replenish', {
      name: 'GetReplenishInfoByTaskID',
      parameter: [ String(taskId) ]
    }),

  atStationSubmitReplenishProduct: (data) =>
    axios.post('Replenish', {
      name: 'AtStationSubmitReplenishProduct',
      parameter: [
        String(data.taskId),
        String(data.boxBarcode),
        String(data.sourceLinesId),
        String(data.productId),
        String(data.productBarcodeList),
        String(data.replenishQty),
        String(data.locateActType),
      ]
    }),

  getProductInfoByReplenishBillProduct: (billNo, productId) =>
    axios.post('Replenish', {
      name: 'GetProductInfoByReplenishBillProduct',
      parameter: [
        String(billNo),
        String(productId)
      ]
    }),

  getProductInfoByTaskId: (taskId, sourceLinesId, productId, processStatusId) =>
    axios.post('Replenish', {
      name: 'GetProductInfoByTaskID',
      parameter: [
        String(taskId),
        String(sourceLinesId),
        String(productId),
        String(processStatusId),
      ]
    }),
};

const inventory = {
  getProductCategory: () =>
    axios.post('Inventory', {
      name: 'GetProductCategory',
      parameter: []
    }),

  getProductType: () =>
    axios.post('Inventory', {
      name: 'GetProductType',
      parameter: []
    }),

  getExpirationMonthRange: () =>
    axios.post('Inventory', {
      name: 'GetExpirationMonthRange',
      parameter: []
    }),

  getInventorySummaryByProduct: () =>
    axios.post('Inventory', {
      name: 'GetInventorySumByProduct',
      parameter: []
    }),

}

export default {
  user,
  menu,
  station,
  pick,
  replenish,
  inventory
};
