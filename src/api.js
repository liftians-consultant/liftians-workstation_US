import axios from 'axios';

/**
 * All API call.
 */

const user = {
  login: credentials =>
    axios.post('login', { ...credentials }).then(res => res.headers.authorization),
  logout: () => 
    axios.post('logout').then(res => res),
  getInfoById: (empId) => 
    axios.post('Login', { type: 'select', name: 'V_Empolyees_FindByID', parameter: [empId] }).then(res => res.data),
};

const menu = {
  getBillTypeName: (operationType) => 
    axios.post('Common', {
      type: 'select',
      name: 'BillType',
      parameter: [operationType]
    }),
  getProcessStatusName: (operationType) => 
    axios.post('Common', {
      type: 'select',
      name: 'ProcessStatus',
      parameter: [operationType]
    }),
}

const station = {
  activateStationWithUser: (stationId, empId) => 
    axios.post('Login', {
      type: 'procedures',
      name: 'P_ActivateStationOperation',
      parameter: [String(stationId), empId, '4']
    }
  ).then(res => res.data),

  checkCurrentUnFinishTask: stationId => 
    axios.post('Login', {
      type: 'procedures',
      name: 'P_CheckCurrentUnFinishTask',
      parameter: [stationId] 
    }).then(res => res.data),

  atStationPodLayoutInfo: stationId =>
    axios.post('Temp', {
      type: 'procedures',
      name: 'P_AtStationPodLayoutInfo',
      parameter: [stationId]
    }),

  atStationTask: (stationId) => 
    axios.post('Temp', {
      type: 'procedures',
      name: 'AtStationTask',
      parameter: [String(stationId)]
    }),

  startStationOperation: (stationId, empId, operationType) =>
    axios.post('Pick', {
      type: 'procedures',
      name: 'P_StartStationOperation',
      parameter: [stationId, empId, operationType]
    }),

  stopStationOperation: (stationId, empId, taskType) => 
    axios.post('Temp', {
      type: 'procedures',
      name: 'P_StopStationOperation',
      parameter: [stationId, empId, taskType]
    })
};

const pick = {
  retrievePickOrderReocrdsByTypeAndState: (stationId, taskId, processId) => 
    axios.post('Pick', {
      type: 'procedures',
      name: 'P_DisplayPickMenu',
      parameter: [stationId, taskId, processId]
    }),

  retrievePickOrderItems: (orderId) => 
    axios.post('Temp', {
      type: 'procedures',
      name: 'P_DisplayPickOrderDetail',
      parameter: [orderId]
    }),

  callServerGeneratePickTask: (stationId) => 
    axios.post('Temp', {
      type: 'procedures',
      name: 'P_GenPickTask',
      parameter: [stationId]
    }),

  stopPickOperation: (stationId, empId) => 
    station.stopStationOperation(stationId, empId, 'P'),

  atStationBoxLocation: (stationId) => 
    axios.post('Temp', {
      type: 'procedures',
      name: 'AtStationPickInfo',
      parameter: [stationId]
    }),
    
  atStationAfterPickProduct: (data) =>
    axios.post('Temp', {
      type: 'procedures',
      name: 'P_AtStationAfterPickProduct',
      parameter: [
        data.stationId,
        data.shelfId,
        data.boxId,
        data.orderNo,
        data.sourceLinesId,
        data.productId,
        data.lotNo,
        data.packageBarcode,
        String(data.pickQuantity),
        data.taskSubtype,
        String(data.shortQty)
      ]
    }),
  getProductSerialNum: (data) => 
    axios.post('Pick', {
      type: 'procedures',
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
      type: 'procedures',
      name: 'P_AtHolderAfterPickProduct',
      parameter: [
        data.holderId,
        data.orderNo,
        data.sourceLinesId,
        data.productId,
        data.lotNo,
        data.taskSubtype,
        String(data.pickQuantity),
      ]
    }),
  checkIsOrderFinished: (orderNum) => 
    axios.post('Temp', {
      type: 'function',
      name: 'F_IsOrderFinished',
      parameter: [ orderNum ]
    })
};

export default {
  user,
  menu,
  station,
  pick
};
