'use strict';
module.exports = s3 => {
  return {
    get: require('./src/get')(s3),
    put: require('./src/put')(s3),
    list: require('./src/list')(s3)
  };
};
