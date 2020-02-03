'use strict';
(async () => {
  const factory = require('../src/get');
  const aws = require('aws-sdk');

  const s3 = new aws.S3({
    region: process.env.CS3_S3_AWS_REGION,
    accessKeyId: process.env.CS3_S3_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CS3_S3_AWS_SECRET_ACCESS_KEY
  });

  const dynamodb = new aws.DynamoDB({
    region: process.env.CS3_DYNAMODB_AWS_REGION,
    accessKeyId: process.env.CS3_DYNAMODB_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CS3_DYNAMODB_AWS_SECRET_ACCESS_KEY,
    httpOptions: {
      timeout: 10000,
      connectTimeout: 10000
    },
    maxRetries: 0
  });
  const bucket = 'dev-glg-epi-screamer';
  const keys = [
    'cs3/fc6b3/12aad3a1d7.txt',
    'cs3/test/doesnotexist.xml'
  ];

  const $get = factory(s3, dynamodb);

  try {
    const promises = keys.map(key =>
      $get(bucket, key)
    );
    await Promise.allSettled(promises)
    .then(result => {
      result.forEach(v => console.log(v));
    });
  } catch (error) {
    console.error('error', error);
  }
})();
