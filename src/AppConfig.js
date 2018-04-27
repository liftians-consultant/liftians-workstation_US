let appConfig = {
  apiHost: 'http://localhost',
  apiPort: '3000',
  apiUrl: 'http://localhost:3000',
  stationId: '1',


  getApiHost() {
    return this.apiHost
  },

  setApiHost(host) {
    this.apiHost = host;
  },

  getApiPort() {
    return this.apiPort;
  },

  getApiUrl() {
    return this.apiUrl;
  },

  setApiUrl(host, port) {
    this.apiHost = host;
    this.apiPort = port;
    this.apiUrl = generateApiUrl(host, port);
    localStorage.apiHost = host;
    localStorage.apiPort = port;
  },

  getStationId() {
    return this.stationId;
  },

  setStationId(id) {
    this.stationId = id;
    localStorage.stationId = id;
  }
}

function generateApiUrl() {
  let url = '';
  url += appConfig.apiHost;
  if (appConfig.apiPort) {
    url = url + ':' + appConfig.apiPort;
  }
  return url;
}

export default appConfig;
