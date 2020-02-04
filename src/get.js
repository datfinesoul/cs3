const loget = require('lodash.get');

function fetchETag(dynamodb, bucket, key) {
  const args = {
    TableName: 'cs3',
    Key: {
      bucket: { S: bucket },
      key: { S: key }
    },
    ProjectionExpression: 'ETag',
    ConsistentRead: true,
    ReturnConsumedCapacity: 'TOTAL'
  };
  return dynamodb.getItem(args).promise();
}

function getS3(s3, bucket, key) {
  return s3.getObject({
    Bucket: bucket,
    Key: key
  }).promise()
  .then(response => {
    return {
      response
    };
  })
  .catch(error => {
    return {
      response: null,
      error
    };
  });
}

module.exports = (s3, dynamodb) => {
  return async function get(bucket, key) {
    const promises = [
      fetchETag(dynamodb, bucket, key),
      getS3(s3, bucket, key)
    ];
    const [dbres, s3res] = await Promise.all(promises);
    const dbETag = loget(dbres, 'Item.ETag.S', null);
    const s3ETag = loget(s3res, 'response.ETag', null);
    console.log(dbETag, s3ETag);
    if (dbETag !== s3ETag) {
      throw new Error('etag_mismatch');
    }
    return s3res;
  };
};
