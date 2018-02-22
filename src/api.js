import axios from "axios";

export default {
  user: {
    login: credentials =>
      axios.post("login", { ...credentials }).then(res => { console.log(res); return res.headers.authorization}),
  }
};
