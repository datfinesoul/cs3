/*
 * list/listS3 is not yet implemented with the dynamoDb checks
*/

function listS3(s3, bucket, prefix) {
  return s3.listObjectsV2({
    Bucket: bucket,
    Prefix: prefix
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

module.exports = s3 => {
  return function list(bucket, key) {
    return listS3(s3, bucket, key);
  };
};
