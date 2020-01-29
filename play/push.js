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
  const files = [
    ['cs3/test/1mb.txt', await readFileAsync('./1mb.txt', 'utf8')],
    ['cs3/test/5mb.txt', await readFileAsync('./5mb.txt', 'utf8')],
    ['cs3/test/10mb.txt', await readFileAsync('./10mb.txt', 'utf8')],
    ['cs3/test/plan.xml', await readFileAsync('./plan.xml', 'utf8')],
    ['cs3/test/context.json', await readFileAsync('context.json', 'utf8')],
    ['cs3/test/rawTemplate', await readFileAsync('./rawTemplate', 'utf8')],
    ['cs3/test/renderedTemplate.xml', await readFileAsync('./renderedTemplate', 'utf8')]
  ];

  const $push = create(s3);
  try {
    const promises = files.map(([key, body]) =>
      $push(bucket, key, `${body}\n${Date.now()}`)
    );
    await Promise.all(promises)
    .then(result => {
      console.log(result);
    });
  } catch (error) {
    console.log('error', error);
  }
})();
