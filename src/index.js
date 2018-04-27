import React from "react";
import ReactDOM from "react-dom";
import { Route, HashRouter } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import decode from "jwt-decode";
import { composeWithDevTools } from "redux-devtools-extension";
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react'
import storage from 'redux-persist/lib/storage';
import { Loader } from 'semantic-ui-react';
import axios from 'axios';

import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import rootReducer from "./rootReducer";
import { userLoggedIn, userLoggedOut } from "./actions/auth";
import setAuthorizationHeader from "./utils/setAuthorizationHeader";
import appConfig from './AppConfig';
import './index.css';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['station']
};

// const persistedReducer = persistReducer(persistConfig, rootReducer);

let store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(thunk))
);

// let persistor = persistStore(store)

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
      {/* <PersistGate loading={<Loader />} persistor={persistor}> */}
        <Route component={App} />
      {/* </PersistGate> */}
    </Provider>
  </HashRouter>,
  document.getElementById("root")
);
registerServiceWorker();
