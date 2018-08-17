import axios from 'axios';
import appConfig from 'services/AppConfig';
import moment from 'moment';

/**
 * All ERP API call.
 */

const info = {
  getReceiveType: () => axios.get(`${appConfig.getErpUrl()}/v1/info/receiveType`),
};

const account = {
  getAccount: accountNo => axios.get(`${appConfig.getErpUrl()}/v1/accounts/${accountNo}`)
    .then(res => ({ success: true, account: res.data }))
    .catch(() => ({ success: false })),

  createAccount: data => axios.post(`${appConfig.getErpUrl()}/v1/accounts`, [{
    ...data,
    createDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
    modifyDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
  }]),

  getAccountList: () => axios.get(`${appConfig.getErpUrl()}/v1/accounts`),
};

const product = {
  getProduct: productSku => axios.get(`${appConfig.getErpUrl()}/v1/products/${productSku}`)
    .then(res => ({ success: true, product: res.data }))
    .catch(() => ({ success: false })),

  createProduct: data => axios.post(`${appConfig.getErpUrl()}/v1/products`, [{
    ...data,
    createDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
    modifyDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
  }]),

  getProductList: () => axios.get(`${appConfig.getErpUrl()}/v1/products`),

  getProductListByAccount: accountNo => axios.get(`${appConfig.getErpUrl()}/v1/products?accountNo=${accountNo}`),
};

const replenish = {
  getReplenish: requestNo => axios.get(`${appConfig.getErpUrl()}/v1/replenishments/${requestNo}`)
    .then(res => ({ success: true, product: res.data }))
    .catch(() => ({ success: false })),

  createReplenish: data => axios.post(`${appConfig.getErpUrl()}/v1/replenishments`, [{
    ...data,
    createDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
    modifyDate: moment().format(moment.HTML5_FMT.DATETIME_LOCAL_MS),
  }]),

  getReplenishList: () => axios.get(`${appConfig.getErpUrl()}/v1/replenishments`),
};

export default {
  info,
  account,
  product,
  replenish,
};
