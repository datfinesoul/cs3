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
  const keys = [
    'cs3/test/1mb.txt',
    'cs3/test/5mb.txt',
    'cs3/test/10mb.txt',
    'cs3/test/plan.xml',
    'cs3/test/context.json',
    'cs3/test/rawTemplate',
    'cs3/test/renderedTemplate.xml'
  ];

  const $get = create(s3);

  try {
    const promises = keys.map(key =>
      $get(bucket, key)
    );
    await Promise.all(promises)
    .then(result => {
      const parsed = result.map(({ response, error }) => {
        if (response && response.ETag) {
          return response.ETag;
        }
        if (response) {
          return response;
        }
        if (error && error.code) {
          return error.code;
        }
        return error;
      });
      console.log(parsed);
    });
  } catch (error) {
    console.error('error', error);
  }
})();
