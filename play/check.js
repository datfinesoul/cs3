'use strict';
(async () => {
  const create = require('../src/list');
  const aws = require('aws-sdk');

  const args = {
    region: process.env.CS3_S3_AWS_REGION,
    accessKeyId: process.env.CS3_S3_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CS3_S3_AWS_SECRET_ACCESS_KEY
  };

  const s3 = new aws.S3(args);

  const bucket = 'dev-glg-epi-screamer';
  const prefix = 'cs3/test/';

  const $list = create(s3);

  try {
    const { response } = await $list(bucket, prefix);
    console.log(response.Contents.map(v => v.ETag));
  } catch (error) {
    console.error('error', error);
  }
})();
