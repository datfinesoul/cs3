'use strict';
(async () => {
  const { promisify } = require('util');
  const { readFile } = require('fs');
  const readFileAsync = promisify(readFile);

  const create = require('../src/put');
  const aws = require('aws-sdk');

  const args = {
    region: process.env.CS3_S3_AWS_REGION,
    accessKeyId: process.env.CS3_S3_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CS3_S3_AWS_SECRET_ACCESS_KEY
  };

  const s3 = new aws.S3(args);

  const bucket = 'dev-glg-epi-screamer';
  const key = 'cs3/test/1234.xml';
  const body = await readFileAsync('./plan.xml', 'utf8');

  const $push = create(s3);
  try {
    const result = await $push(bucket, key, body);
    console.log(result);
  } catch (error) {
    console.log('error', error);
  }
})();
