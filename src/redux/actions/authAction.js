import { USER_LOGGED_IN, USER_LOGGED_OUT } from "redux/types";
import api from "api";
import setAuthorizationHeader from "utils/setAuthorizationHeader";

export const userLoggedIn = user => ({
  type: USER_LOGGED_IN,
  user
});

export const userLoggedOut = () => ({
  type: USER_LOGGED_OUT
});

export const login = credentials => dispatch =>
  api.user.login(credentials).then(token => {
    localStorage.liftiansJWT = token;
    setAuthorizationHeader(token);
    const user = {
      token: token,
      username: credentials.username
    }
    dispatch(userLoggedIn(user));
  });

export const logout = () => dispatch => 
  new Promise((resolve, reject) => {
    localStorage.removeItem("liftiansJWT");
    setAuthorizationHeader();
    dispatch(userLoggedOut());
    resolve(true);
  });

// export const confirm = token => dispatch =>
//   api.user.confirm(token).then(user => {
//     localStorage.bookwormJWT = user.token;
//     dispatch(userLoggedIn(user));
//   });

// export const resetPasswordRequest = ({ email }) => () =>
//   api.user.resetPasswordRequest(email);

export const validateToken = token => () => api.user.validateToken(token);

// export const resetPassword = data => () => api.user.resetPassword(data);
