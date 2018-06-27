import axios from 'axios';
import appConfig from 'utils/AppConfig';

/**
 * All API call.
 */
const user = {
  login: credentials =>
    axios.post(appConfig.getApiUrl() + '/login', { ...credentials }, {timeout: 6000}).then(res => res.headers.authorization),
  logout: () =>
    axios.post(appConfig.getApiUrl() + '/logout').then(res => res),
  getInfoById: (empId) =>
    axios.post(appConfig.getApiUrl() + '/Setup', { name: 'EmpolyeesFindByID', parameter: [empId] }).then(res => res.data),
};

const menu = {
  getBillTypeName: (operationType) =>
    axios.post(appConfig.getApiUrl() + '/Common', {
      name: 'BillType',
      parameter: [operationType]
    }),
  getProcessStatusName: (operationType) =>
    axios.post(appConfig.getApiUrl() + '/Common', {
      name: 'ProcessStatus',
      parameter: [operationType]
    }),
}

const station = {
  activateStationWithUser: (stationId, empId) =>
    axios.post(appConfig.getApiUrl() + '/Setup', {
      name: 'ActivateStationOperation',
      parameter: [String(stationId), empId, '4']
    }
  ).then(res => res.data),

  deactivateStationWithUser: (stationId, empId) =>
    axios.post(appConfig.getApiUrl() + '/Setup', {
      name: 'DeactivateStationOperation',
      parameter: [String(stationId), empId]
    }
  ).then(res => res.data),

  checkCurrentUnFinishTask: stationId =>
    axios.post(appConfig.getApiUrl() + '/Setup', {
      name: 'CheckCurrentUnFinishTask',
      parameter: [stationId]
    }).then(res => res.data),

  atStationPodLayoutInfo: (stationId) =>
    axios.post(appConfig.getApiUrl() + '/Common', {
      name: 'AtStationPodLayoutInfo',
      parameter: [
        String(stationId),
      ]
    }),

  atStationTask: (stationId) =>
    axios.get(appConfig.getApiUrl() + '/atStation/CurrentTask?stationID=' + stationId),

  startStationOperation: (stationId, empId, operationType) =>
    axios.post(appConfig.getApiUrl() + '/Pick', {
      name: 'StartStationOperation',
      parameter: [stationId, empId, operationType]
    }),

  stopStationOperation: (stationId, empId, taskType) =>
    axios.post(appConfig.getApiUrl() + '/Setup', {
      name: 'StopStationOperation',
      parameter: [stationId, empId, taskType]
    }),

  forcePodToLeaveStationByTaskId: (stationId, taskId) =>
    axios.post(appConfig.getApiUrl() + '/Common', {
      name: 'ForcePod2LeaveStationByTaskID',
      parameter: [
        String(stationId),
        String(taskId)
      ]
    }),

  genStationTask: (stationId) =>
    axios.post(appConfig.getApiUrl() + '/Common', {
      name: 'GenStationTask',
      parameter: [
        String(stationId),
      ]
    }),

  getStationDeviceList: (stationId) =>
    axios.post(appConfig.getApiUrl() + '/Pick', {
      name: 'GetDeviceListByStationId',
      parameter: [
        String(stationId),
      ]
    }),
  
  linkBinToOrder: (binId, deviceId, userId) =>
    axios.post(appConfig.getApiUrl() + '/Common', {
      name: 'LinkBinToOrder',
      parameter: [
        String(binId),
        String(deviceId),
        String(userId),
      ]
    }),
};

const pick = {
  resetTestData: (stationId) =>
    axios.post(appConfig.getApiUrl() + '/Pick', {
      name: 'ResetTestData',
      parameter: [stationId]
    }),
  retrievePickOrderReocrdsByTypeAndState: (stationId, billTypeId, processId) =>
    axios.post(appConfig.getApiUrl() + '/Pick', {
      name: 'DisplayPickMenu',
      parameter: [
        stationId,
        String(billTypeId),
        String(processId)
      ]
    }),

  retrievePickOrderItems: (orderId) =>
    axios.post(appConfig.getApiUrl() + '/Pick', {
      name: 'DisplayPickOrderDetail',
      parameter: [orderId]
    }),

  callServerGeneratePickTask: (stationId) =>
    axios.post(appConfig.getApiUrl() + '/Pick', {
      name: 'GenPickTask',
      parameter: [stationId]
    }),

  stopPickOperation: (stationId, empId) =>
    station.stopStationOperation(stationId, empId, 'P'),

  getPickInfoByTaskId: (taskId) =>
    axios.post(appConfig.getApiUrl() + '/Pick', {
      name: 'GetPickInfoByTaskID',
      parameter: [String(taskId)]
    }),

  atStationAfterPickProduct: (data) =>
    axios.post(appConfig.getApiUrl() + '/Pick', {
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
    axios.post(appConfig.getApiUrl() + '/Pick', {
      name: 'GetProductByInvLocation',
      parameter: [
        String(data.podId),
        String(data.podSide),
        String(data.shelfId),
        String(data.boxId)
      ]
    }),

  atHolderAfterPickProduct: (data) =>
    axios.post(appConfig.getApiUrl() + '/Pick', {
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
    axios.post(appConfig.getApiUrl() + '/Pick', {
      name: 'IsOrderFinished',
      parameter: [ orderNum ]
    }),

  getInventoryByProductBarcode: (barcode, podId, podSide) =>
    axios.post(appConfig.getApiUrl() + '/Pick', {
      name: 'GetInventoryByProductBarcode',
      parameter: [
        String(barcode),
        String(podId || 0),
        String(podSide || 0)
      ]
    })
};

const replenish = {
  retrieveReplenishRecords: (stationId, billTypeId, processId) =>
    axios.post(appConfig.getApiUrl() + '/Replenish', {
      name: 'DisplayReplenish',
      parameter: [
        String(stationId),
        String(billTypeId),
        String(processId)
      ]
    }),

  getReplenishDetailBySourceId: (sourceId) =>
    axios.post(appConfig.getApiUrl() + '/Replenish', {
      name: 'GetReplenishDetailBySourceID',
      parameter: [ String(sourceId) ]
    }),

  replenishBySourceId: (stationId, userId, sourceIdList, jobPriority) =>
    axios.post(appConfig.getApiUrl() + '/Replenish', {
      name: 'ReplenishBySourceID',
      parameter: [
        String(stationId),
        String(userId),
        String(sourceIdList),
        String(jobPriority)
      ]
    }),
  getReplenishInfoByTaskId: (taskId) =>
    axios.post(appConfig.getApiUrl() + '/Replenish', {
      name: 'GetReplenishInfoByTaskID',
      parameter: [ String(taskId) ]
    }),

  atStationSubmitReplenishProduct: (data) =>
    axios.post(appConfig.getApiUrl() + '/Replenish', {
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
    axios.post(appConfig.getApiUrl() + '/Replenish', {
      name: 'GetProductInfoByReplenishBillProduct',
      parameter: [
        String(billNo),
        String(productId)
      ]
    }),

  getProductInfoByTaskId: (taskId, sourceLinesId, productId, processStatusId) =>
    axios.post(appConfig.getApiUrl() + '/Replenish', {
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
    axios.post(appConfig.getApiUrl() + '/Inventory', {
      name: 'GetProductCategory',
      parameter: []
    }),

  getProductType: () =>
    axios.post(appConfig.getApiUrl() + '/Inventory', {
      name: 'GetProductType',
      parameter: []
    }),

  getExpirationMonthRange: () =>
    axios.post(appConfig.getApiUrl() + '/Inventory', {
      name: 'GetExpirationMonthRange',
      parameter: []
    }),

  getInventorySummaryByProduct: (data) =>
    axios.post(appConfig.getApiUrl() + '/Inventory', {
      name: 'GetInventorySumByProduct',
      parameter: [
        String(data.type),
        String(data.category),
        String(data.productId),
        String(data.productName),
        String(data.expireDate)
      ]
    }),
};

const system = {
  // /Info/getTaskInfo?taskID=${taskID}&podID=${podID}&botID=${botID}
  getTaskList: () =>
    axios.get(appConfig.getApiUrl() + '/Info/GetTaskInfo'),

  getExpirationRule: () =>
    axios.post(appConfig.getApiUrl() + '/Common', {
      name: 'GetExpirationRule',
      parameter: [
      ]
    }),

  setExpirationRule: (empId, taskType, numDays) =>
    axios.post(appConfig.getApiUrl() + '/Common', {
      name: 'SetExpirationRule',
      parameter: [
        String(empId),
        String(taskType),
        String(numDays),
      ]
    }),
};

const eLabel = {
  turnOnById: (labelId, pickNum) =>
    axios.post(appConfig.getApiUrl() + '/eLabel/turnOnById', {
      labelId,
      pickNum
    }),
  turnOffById: (labelId) =>
    axios.post(appConfig.getApiUrl() + '/eLabel/turnOffById', {
      labelId
    })
}

export default {
  user,
  menu,
  station,
  pick,
  replenish,
  inventory,
  system,
  eLabel
};
