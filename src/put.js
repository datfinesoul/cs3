const aws = require('aws-sdk');
const { md5 } = require('./generators');

module.exports = s3 => {
  const $s3 = s3 || new aws.S3();
  return function put(bucket, key, body) {
    const digest = md5(body);
    return $s3.putObject({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentMD5: digest
    }).promise();
  };
};
