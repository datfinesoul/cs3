'use strict';
const loget = require('lodash.get');
const loisstring = require('lodash.isstring');
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
async function saveETag(dynamodb, bucket, key, newETag) {
  if (![bucket, key, newETag].every(loisstring)) {
    throw new TypeError('bucket, key and newETag must be strings');
  }
  const args = {
    TableName: 'cs3',
    Key: {
      bucket: { S: bucket },
      key: { S: key }
    },
    UpdateExpression: 'set ETag = :newETag',
    ExpressionAttributeValues: {
      ':newETag': { S: newETag }
    },
    ReturnValues: 'ALL_OLD'
  };
  // Update or create the entry in DynamoDB
  const result = await dynamodb.updateItem(args).promise();
  // Save the previous ETag if it existed
  const origETag = loget(result, 'Attributes.ETag', '');
  return { origETag, newETag };
}

/*
 * Change the ETag to newETag if the current stored ETag === origETag
 *
 * Info: Assuming that 2+ putObject calls are happening concurrently
 * for the same bucket/key, the final one should always win and
 * therefore even in case of error never interrupt the latter request
 */
async function revertETag(dynamodb, bucket, key, origETag, newETag) {
  const args = {
    TableName: 'cs3',
    Key: {
      bucket: { S: bucket },
      key: { S: key }
    },
    UpdateExpression: 'set ETag = :origETag',
    ExpressionAttributeValues: {
      ':origETag': { S: origETag },
      ':newETag': { S: newETag }
    },
    ConditionExpression: 'ETag = :newETag',

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
    const { ETag: newETag } = md5(body);
    // Place new ETag into DynamoDB and fetch the prev ETag
    const { origETag } =
      await saveETag(dynamodb, bucket, key, `"${newETag}"`);
    // Place the body into S3.  If this fails, restore the previous
    // ETag to DynamoDB
    try {
      // TODO: Needs to only happen if ETags differ
      return await putS3(s3, bucket, key, body);
    } catch (error) {
      await revertETag(dynamodb, bucket, key, origETag, newETag);
      throw error;
    }
  };
};
