import api from 'api';

let ETagService = {
  turnPickLightOnById: (labelId, num) => {
    api.eTag.turnPickLightOnById(labelId, num).then( res => {
      if (res.data) {
        console.log(`[E-TAG] Turn on pick light #${labelId} with ${num}`);
      } else {
        console.log(`[E-TAG] Pick light turn on failed #${labelId} with ${num}`);
      }
    })
  },

  turnPickLightOffById: (labelId) => {
    api.eTag.turnPickLightOffById(labelId).then(res => {
      if (res.data) {
        console.log(`[E-TAG] Turn off pick light #${labelId}`);
      } else {
        console.log(`[E-TAG] Pick light turn off failed #${labelId}`);
      }
    })
  },

  turnEndLightOnById: (labelId) => {
    api.eTag.turnEndLightOnById(labelId).then( res => {
      if (res.data) {
        console.log(`[E-TAG] Turn on End light #${labelId}`);
      } else {
        console.log(`[E-TAG] End light turn on failed #${labelId}`);
      }
    })
  },

  turnEndLightOffById: (labelId) => {
    api.eTag.turnEndLightOffById(labelId).then(res => {
      if (res.data) {
        console.log(`[ELECTRONIC LABEL] Turn off End light #${labelId}`);
      } else {
        console.log(`[ELECTRONIC LABEL] End light turn off failed #${labelId}`);
      }
    })
  },

  checkRespond: (labelId) => {
    return api.eTag.checkRespond(labelId).then(res => {
      if (res.data) {
        return res.data;
      } else {
        return false;
      }
    })
  },

  // turnPickLightOnById: (labelId, num) => {
  //   return Promise.resolve(true);
  // },

  // turnPickLightOffById: (labelId) => {
  //   return Promise.resolve(true);
  // },

  // turnEndLightOnById: (labelId) => {
  //   return Promise.resolve(true);
  // },

  // turnEndLightOffById: (labelId) => {
  //     return Promise.resolve(true);
  // },

  // checkRespond: (labelId) => {
  //   return Promise.resolve(true);
  // }

}

export default ETagService;