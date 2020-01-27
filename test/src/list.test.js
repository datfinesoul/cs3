const test = require('ava');
const aws = require('aws-sdk');

test.before(t => {
  t.context.config = {
    s3: {
      region: process.env.CS3_S3_AWS_REGION,
      accessKeyId: process.env.CS3_S3_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.CS3_S3_AWS_SECRET_ACCESS_KEY
    },
    dynamoDb: {
      region: process.env.CS3_DYNAMODB_AWS_REGION,
      accessKeyId: process.env.CS3_DYNAMODB_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.CS3_DYNAMODB_AWS_SECRET_ACCESS_KEY,
      httpOptions: {
        timeout: 10000,
        connectTimeout: 10000
      },
      maxRetries: 0
    }
  };
});

test.beforeEach(t => {
  process.env.NODE_ENV = 'production';
  t.context.s3 = new aws.S3(t.context.config.s3);
  t.context.dynamoDb = new aws.DynamoDB(t.context.config.dynamoDb);

  t.truthy(t.context.config.s3.region);
  t.truthy(t.context.config.s3.accessKeyId);
  t.truthy(t.context.config.s3.secretAccessKey);
  t.truthy(t.context.config.dynamoDb.region);
  t.truthy(t.context.config.dynamoDb.accessKeyId);
  t.truthy(t.context.config.dynamoDb.secretAccessKey);

  // T.log(t.context.s3);
  // t.log(t.context.dynamoDb);
});

test.afterEach(t => {
  t.is(process.env.NODE_ENV, 'production');
});

test('test', t => {
  t.pass();
});
