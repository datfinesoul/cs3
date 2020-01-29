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

async function saveETag(dynamodb, bucket, key, ETag) {
  const args = {
    TableName: 'cs3',
    Key: {
      bucket: {
        S: bucket
      },
      key: {
        S: key
      }
    },
    UpdateExpression: 'set ETag = :etag',
    ExpressionAttributeValues: {
      ':etag': { S: ETag }
    },
    ReturnValues: 'ALL_OLD'
  };
  const result = await dynamodb.updateItem(args).promise();
  const prevETag = (result &&
    result.Attributes &&
    result.Attributes.ETag) ||
    '';
  return { prevETag, ETag };
}

module.exports = (s3, dynamodb) => {
  return async function put(bucket, key, body) {
    // If this fails, we need to abort
    const { ETag } = md5(body);
    const { prevETag } =
      await saveETag(dynamodb, bucket, key, ETag);
    // TODO: If this fails, we need to rollback
    try {
      return await putS3(s3, bucket, key, body);
    } catch (error) {
      console.error('error', error);
      await saveETag(dynamodb, bucket, key, prevETag);
      throw error;
    }
  };
};
