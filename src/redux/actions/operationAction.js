import {
  DEVICE_LIST_FETCHED,
  SET_HOLDER_SETUP_WAITLIST,
  ADD_BIN_TO_HOLDER,
  UNASSIGN_BIN_FROM_HOLDER
} from "redux/types";
import api from 'api';

function addBinInfoToHolder(holderId, binInfo) {
  return {
    type: ADD_BIN_TO_HOLDER,
    holderId,
    binInfo
  }
}

function setHolderSetupWaitlist(holderSetupWaitlist, currentSetupHolder) {
  return {
    type: SET_HOLDER_SETUP_WAITLIST,
    holderSetupWaitlist,
    currentSetupHolder
  }
}

function removeBinFromHolder(holderId) {
  return {
    type: UNASSIGN_BIN_FROM_HOLDER,
    holderId
  }
}

export const getStationDeviceList = (stationId) => (dispatch, getState) => {
  return api.station.getStationDeviceList(stationId).then(res => {
    const deviceList = res.data.map(device => { return { 
      deviceId: device.deviceID,
      deviceIndex: device.holderSequence,
      bin: {} 
    }});
    dispatch({ type: DEVICE_LIST_FETCHED, deviceList });
    return deviceList;
  })
};

export const addHoldersToSetupWaitlist = (holderSetupWaitlist) => (dispatch, getState) => {
  const holderId = holderSetupWaitlist.shift();
  const deviceList = getState().operation.deviceList;
  let currentSetupHolder = getState().operation.currentSetupHolder;
  if (deviceList.length > 0) {
    currentSetupHolder = deviceList.find(device => device.deviceId === holderId);
  }
  dispatch(setHolderSetupWaitlist(holderSetupWaitlist, currentSetupHolder));
};

export const addBinToHolder = (binBarcode, holderId) => (dispatch, getState) => {
  return api.pick.linkBinToHolder(binBarcode, holderId).then(res => {
    if (res.data) {
      api.eTag.turnEndLightOffById(getState().operation.currentSetupHolder.deviceIndex);
      return api.pick.getBinInfoAfterHolderTag(binBarcode, holderId);
    } else {
      return false;
    }
  }).then(res => {
    if (!res) return false;
    if (res.data) {
      dispatch(addBinInfoToHolder(holderId, res.data));
      return true;
    } else {
      return false;
    }
  
  }).then(res => {
    const holderSetupWaitlist = getState().operation.holderSetupWaitlist;

    if (!res) return false;

    if (holderSetupWaitlist.length > 0) {
      const holderId = holderSetupWaitlist.shift();
      const currentSetupHolder = getState().operation.deviceList.find(device => device.deviceId === holderId);
      dispatch(setHolderSetupWaitlist(holderSetupWaitlist, currentSetupHolder));
    } else {
      dispatch(setHolderSetupWaitlist([], {deviceIndex: 0}));
    }

    return Promise.resolve(true);
  });
}

export const unassignBinFromHolder = (holderId, orderId) => (dispatch, getState) => {
  return api.pick.unassignBinFromHolder(holderId, orderId).then(res => {
    dispatch(removeBinFromHolder(holderId));
    return Promise.resolve(true);
  })
}
  
