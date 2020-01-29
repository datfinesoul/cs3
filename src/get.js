function getS3(s3, bucket, key) {
  return s3.getObject({
    Bucket: bucket,
    Key: key
  }).promise()
  .then(response => {
    // XXX: This is likely where we'll return an additional status
    // XXX: This needs a lot more unit tests
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

/*
 *function getDynamoDb(bucket, key) {
 *}
 */

module.exports = s3 => {
  return function get(bucket, key) {
    return getS3(s3, bucket, key);
  };
};
