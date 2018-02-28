import axios from 'axios';

export default {
  user: {
    login: credentials =>
      axios.post('login', { ...credentials }).then(res => res.headers.authorization),
    logout: () => 
      axios.post('logout').then(res => res),
    getInfoById: (empId) => 
      axios.post('Login', { type: 'select', name: 'V_Empolyees_FindByID', parameter: [empId] }).then(res => res.data),
    
  },
  // TODO
  station: {
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
    atStationPodLayoutInfo: () =>
      axios.post('Login'),
    showComingPods: (stationId, mode) => 
      axios.post('Login', {})
  }
};
