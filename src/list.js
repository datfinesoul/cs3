const aws = require('aws-sdk');

module.exports = s3 => {
  const $s3 = s3 || new aws.S3();
  return function list(bucket) {
    $s3.listObjectsV2({
      Bucket: bucket
    }).promise();
  };
};
