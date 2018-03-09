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

// TODO
const station = {
  activateStationWithUser: (stationId, empId) => 
    axios.post('Login', {
      type: 'procedures',
      name: 'P_ActivateStationOperation',
      parameter: [stationId, empId, '4']
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

  showComingPods: (stationId, mode) => 
    axios.post('Login', {}),

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
      name: 'P_AtStationBoxLocation_Pick',
      parameter: [stationId]
    }),
  atStationAfterPickProduct: (data) =>
    axios.post('Temp', {
      type: 'procedures',
      name: 'P_AtStationAfterPickProduct',
      parameters: [
        data.stationId,
        data.shelfId,
        data.boxId,
        data.orderNo,
        data.sourceLinesId,
        data.productId,
        data.lotNo,
        data.packageBarcode,
        data.pickQuantity,
        data.taskSubtype,
        data.shortQty
      ]
    })
};

export default {
  user,
  station,
  pick
};
