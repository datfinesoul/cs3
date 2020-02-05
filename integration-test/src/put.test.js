const test = require('ava');
const aws = require('aws-sdk');
const loget = require('lodash.get');
const { generateId } = require('../../src/generators');
const $put = require('../../src/put');
const $get = require('../../src/get');

test.before(t => {
  t.context.config = {
    s3: {
      region: process.env.CS3_S3_AWS_REGION,
      accessKeyId: process.env.CS3_S3_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.CS3_S3_AWS_SECRET_ACCESS_KEY
    },
    dynamodb: {
      region: process.env.CS3_DYNAMODB_AWS_REGION,
      accessKeyId: process.env.CS3_DYNAMODB_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.CS3_DYNAMODB_AWS_SECRET_ACCESS_KEY,
      httpOptions: {
        timeout: 10000,
        connectTimeout: 10000
      },
      maxRetries: 0
    },
    bucket: process.env.CS3_BUCKET
  };
  t.truthy(t.context.config.s3.region, 'missing env vars?');
  t.truthy(t.context.config.s3.accessKeyId);
  t.truthy(t.context.config.s3.secretAccessKey);
  t.truthy(t.context.config.dynamodb.region);
  t.truthy(t.context.config.dynamodb.accessKeyId);
  t.truthy(t.context.config.dynamodb.secretAccessKey);
  t.truthy(t.context.config.bucket);
});

test.beforeEach(t => {
  // Since it's an integration test, simulate prod type settings
  process.env.NODE_ENV = 'production';
  t.context.s3 = new aws.S3(t.context.config.s3);
  t.context.dynamodb = new aws.DynamoDB(t.context.config.dynamodb);
});

test.afterEach(t => {
  t.is(process.env.NODE_ENV, 'production');
});

test.serial('put new item', async t => {
  const put = $put(t.context.s3, t.context.dynamodb);
  const get = $get(t.context.s3, t.context.dynamodb);
  const bucket = process.env.CS3_BUCKET;

  // random folder with random file
  const key = `cs3/${await generateId(5)}/${await generateId(10)}.txt`;

  // random content
  const content = await generateId(20);

  // basic validation to see the item was inserted
  const newItem = await put(bucket, key, content);
  t.log(bucket, key, newItem);
  t.truthy(newItem);
  t.truthy(newItem.ETag);

  // validate that the S3 results contain a S3 formatted ETag
  t.regex(newItem.ETag, /(^"|"$)/);

  // validate that fetching the item gets us the expected item
  const checkItem = await get(bucket, key);
  t.truthy(checkItem);
  t.deepEqual(loget(checkItem, 'response.ETag'), newItem.ETag);
});

test.serial('put existing item', async t => {
  const put = $put(t.context.s3, t.context.dynamodb);
  const bucket = process.env.CS3_BUCKET;
  const key = 'cs3/folder/same.txt';

  // random content
  const content = await generateId(20);

  // update the item twice
  await put(bucket, key, content);
  const newItem = await put(bucket, key, content);
  t.log(bucket, key, newItem);
  t.truthy(newItem);
  t.truthy(newItem.ETag);
  // validate that the S3 results contain a S3 formatted ETag
  t.regex(newItem.ETag, /(^"|"$)/);
});

test.serial('simulate upload sync failure', async t => {
  const put = $put(t.context.s3, t.context.dynamodb);
  const get = $get(t.context.s3, t.context.dynamodb);
  const bucket = process.env.CS3_BUCKET;
  const key = `cs3/${await generateId(5)}/${await generateId(10)}.txt`;

  // random larger content
  const { promisify } = require('util');
  const readFile = promisify(require('fs').readFile);
  const content = await readFile('./integration-test/src/fixtures/5mb.txt');

  // put with no await
  put(bucket, key, content);
  // sleep 500ms
  // eslint-disable-next-line no-unused-vars
  await new Promise((resolve, reject) => setTimeout(resolve, 500));
  const item = await get(bucket, key);
  t.log(item);
});
