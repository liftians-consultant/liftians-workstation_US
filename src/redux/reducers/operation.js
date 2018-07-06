import {
  DEVICE_LIST_FETCHED,
  SET_HOLDER_SETUP_WAITLIST,
  ADD_BIN_TO_HOLDER,
  UNASSIGN_BIN_FROM_HOLDER,
  SHOW_CHANGE_BIN_MODAL
} from "../types";

const operationDefaultState = {
  currentSetupHolder: {
    deviceIndex: 0,
    deviceId: -1
  },
  holderSetupWaitlist: [],
  deviceList: [],
  openChangeBinModal: false
}

export default function operation(state = operationDefaultState, action = {}) {
  switch (action.type) {
    case DEVICE_LIST_FETCHED:
      return { ...state, 
        deviceList: action.deviceList,  
      }
    case ADD_BIN_TO_HOLDER:
      return { ...state,
        deviceList: state.deviceList.map(device =>
          (device.deviceId === action.holderId)
          ? { ...device, bin: action.binInfo } : device)
      }
    case SET_HOLDER_SETUP_WAITLIST:
      return { ...state, 
        holderSetupWaitlist: action.holderSetupWaitlist,
        currentSetupHolder: action.currentSetupHolder
      }
    case UNASSIGN_BIN_FROM_HOLDER:

      return {
        ...state,
        deviceList: state.deviceList.map(device => 
          (device.deviceId === action.holderId)
          ? { ...device, bin: {} } : device)
      }
    case SHOW_CHANGE_BIN_MODAL:
      return {
        ...state,
        openChangeBinModal: action.showChangeBinModal
      }
    default:
      return state;
  }

}
