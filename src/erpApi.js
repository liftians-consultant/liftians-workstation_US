import axios from 'axios';
import appConfig from 'services/AppConfig';
import moment from 'moment';

/**
 * All ERP API call.
 */

const account = {
  getAccount: accountNo => axios.get(`${appConfig.getErpUrl()}/v1/accounts/${accountNo}`)
    .then(res => ({ success: true, account: res.data }))
    .catch(() => ({ success: false })),

  createAccount: data => axios.post(`${appConfig.getErpUrl()}/v1/accounts`, [{
    ...data,
    createDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
    modifyDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
  }]),
};

export default {
  account,
};
