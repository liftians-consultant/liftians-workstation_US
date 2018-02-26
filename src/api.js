import axios from "axios";

export default {
  user: {
    login: credentials =>
      axios.post("login", { ...credentials }).then(res => res.headers.authorization),
    logout: () => 
      axios.post("logout").then(res => res),
    getInfoById: (empId) => 
      axios.post("Login", { type: 'select', name: 'V_Empolyees_FindByID', parameter: [empId] }).then(res => console.log(res)),
    
  },
  // TODO
  station: {
    activateStationWithUser: data => 
      axios.post("Login", { type: 'select'}),
    checkCurrentUnFinishTask: stationId => 
      axios.post("Login"),
    atStationPodLayoutInfo: () =>
      axios.post("Login"),
    showComingPods: (stationId, mode) => 
      axios.post("Login", {})
  }
};
