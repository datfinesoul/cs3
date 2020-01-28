function getS3(s3, bucket, key) {
  return s3.getObject({
    Bucket: bucket,
    Key: key
  }).promise();
}

/*
 *function getDynamoDb(bucket, key) {
 *}
 */

module.exports = s3 => {
  return function get(bucket, key) {
    return getS3(s3, bucket, key);
  };
};
