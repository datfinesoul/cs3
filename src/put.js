const { md5 } = require('./generators');

/*
 * Place body into S3 and perform MD5 hash verification of upload
 */
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
 * Update an ETag for a bucket/key combo in DynamoDB
 */
async function saveETag(dynamodb, bucket, key, ETag) {
  const args = {
    TableName: 'cs3',
    Key: {
      bucket: { S: bucket },
      key: { S: key }
    },
    UpdateExpression: 'set ETag = :etag',
    ExpressionAttributeValues: {
      ':etag': { S: ETag }
    },
    ReturnValues: 'ALL_OLD'
  };
  // Update or create the entry in DynamoDB
  const result = await dynamodb.updateItem(args).promise();
  // Save the previous ETag if it existed
  const prevETag = (result &&
    result.Attributes &&
    result.Attributes.ETag) ||
    '';
  return { prevETag, ETag };
}

async function revertETag(dynamodb, bucket, key, origETag, curETag) {
  const args = {
    TableName: 'cs3',
    Key: {
      bucket: { S: bucket },
      key: { S: key }
    },
    UpdateExpression: 'set ETag = :origETag',
    ExpressionAttributeValues: {
      ':origETag': { S: origETag },
      ':curETag': { S: curETag }
    },
    ReturnValues: 'ALL_OLD'
  };
  // Update or create the entry in DynamoDB
  const result = await dynamodb.updateItem(args).promise();
  return result;
}

/*
 * Module should be instantiated with an S3 and DynamoDB object
 * eg. const $put = require('./put')(awsS3Obj, awsDynamoDBObj);
 */
module.exports = (s3, dynamodb) => {
  /*
   * Returns a method which can be used to put an object into S3
   * eg. const { ETag } = await $put(bucket, key, body);
   */
  return async function put(bucket, key, body) {
    // Compute ETag for the body
    const { ETag } = md5(body);
    // Place new ETag into DynamoDB and fetch the prev ETag
    const { prevETag } =
      await saveETag(dynamodb, bucket, key, `"${ETag}"`);
    // Place the body into S3.  If this fails, restore the previous
    // ETag to DynamoDB
    try {
      return await putS3(s3, bucket, key, body);
    } catch (error) {
      console.error('error', error);
      await revertETag(dynamodb, bucket, key, prevETag, ETag);
      throw error;
    }
  };
};
