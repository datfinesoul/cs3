'use strict';
const loget = require('lodash.get');

/*
 * Using a consistent read, fetch the latest ETag
 */
function fetchETag(dynamodb, bucket, key) {
  const args = {
    TableName: 'cs3',
    Key: {
      bucket: { S: bucket },
      key: { S: key }
    },
    ProjectionExpression: 'ETag',
    ConsistentRead: true
  };
  return dynamodb
  .getItem(args)
  .promise();
}

/*
 * Fetch the object from S3
 */
function getS3(s3, bucket, key) {
  return s3
  .getObject({ Bucket: bucket, Key: key })
  .promise()
  .then(response => ({ response }))
  .catch(error => ({ response: null, error }));
}

/*
 * Module should be instantiated with an S3 and DynamoDB object
 * eg. const $get = require('./get')(awsS3Obj, awsDynamoDBObj);
 */
module.exports = (s3, dynamodb) =>
  async function get(bucket, key) {
    const promises = [
      fetchETag(dynamodb, bucket, key),
      getS3(s3, bucket, key)
    ];
    const [dbres, s3res] = await Promise.all(promises);
    const dbETag = loget(dbres, 'Item.ETag.S', null);
    const s3ETag = loget(s3res, 'response.ETag', null);
    // TODO: Not done with all the checks
    if (dbETag !== s3ETag) {
      throw new Error(`etag_mismatch: dbETag=${dbETag} s3ETag=${s3ETag}`);
    }
    return s3res;
  };
