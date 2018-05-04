import React from "react";
import ReactDOM from "react-dom";
import { Route, HashRouter } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import decode from "jwt-decode";
import { composeWithDevTools } from "redux-devtools-extension";

import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import rootReducer from "./rootReducer";
import { userLoggedIn, userLoggedOut } from "./actions/auth";
import setAuthorizationHeader from "./utils/setAuthorizationHeader";
import appConfig from './AppConfig';
import './index.css';

let store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

if (localStorage.liftiansJWT) {
  const payload = decode(localStorage.liftiansJWT); // {sub: "10001", exp: 1519504053}

  // check if expired
  const nowDate = new Date(), tokenDate = new Date(payload.exp);
  if ( nowDate.getTime() < tokenDate.getTime() ) {
    localStorage.removeItem("liftiansJWT");
    setAuthorizationHeader();
    store.dispatch(userLoggedOut());
  } else {
    const user = {
      token: localStorage.liftiansJWT,
      username: payload.sub,
    };
    setAuthorizationHeader(localStorage.liftiansJWT);
    store.dispatch(userLoggedIn(user));
  }
}

if (localStorage.apiHost && localStorage.apiPort) {
  appConfig.setApiUrl(localStorage.apiHost, localStorage.apiPort);
}

if (localStorage.stationId) {
  appConfig.setStationId(localStorage.stationId);
}

ReactDOM.render(
  <HashRouter>
    <Provider store={store}>
      <Route component={App} />
    </Provider>
  </HashRouter>,
  document.getElementById("root")
);
registerServiceWorker();
