const { md5 } = require('./generators');

function putS3(s3, bucket, key, body) {
  const { ContentMD5 } = md5(body);
  return s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentMD5
  }).promise();
}

/*
 *function putDynamoDb(bucket, key, body) {
 *}
 */

module.exports = s3 => {
  return function put(bucket, key, body) {
    return putS3(s3, bucket, key, body);
  };
};
