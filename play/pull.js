'use strict';
(async () => {
  const create = require('../src/get');
  const aws = require('aws-sdk');

  const args = {
    region: process.env.CS3_S3_AWS_REGION,
    accessKeyId: process.env.CS3_S3_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CS3_S3_AWS_SECRET_ACCESS_KEY
  };

  const s3 = new aws.S3(args);

  const bucket = 'dev-glg-epi-screamer';
  const key = 'cs3/test/1234.xml';

  const $get = create(s3);

  try {
    const result = await $get(bucket, key);
    console.log(result);
  } catch (error) {
    console.error('error', error);
  }
})();
