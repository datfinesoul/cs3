# **C**onsistent**S3**

CS3 aims to provide synchronized S3.putObject and S3.getObject operations.
This is meant to address issues around AWS S3's
[Consistency Model](https://docs.aws.amazon.com/AmazonS3/latest/dev/Introduction.html#ConsistencyModel).

By default, S3.getObject does not see the new or updated objects from successful S3.putObject calls,
until S3 has replicated the object to the specific bucket in all regions.  This can yield unexpected results,
when the object has technically been uploaded, but is still not available.

The CS3 put operation first sends the updated ETag of the bucket/file to a DynamoDB table, and CS3 get
operations check this bucket to validate that the getRequest fetches the truly most recent version of the file.

## Supported

Currently the library has only basic put/get operation support and does not support S3 versioning or
multipart uploads.

## Not Supported

- No rename support

## Notes

### single file
- clear etag in dynamo
- push to s3
- set etag

### batch
- clear all etags in batch
- push to s3
- set etags

```sh
npm install --dry-run 2>&1 | \
  grep -e 'WARN [^ ]\+ .*requires a peer ' | \
  cut -d' ' -f8 | \
  cut -d'@' -f1 | \
  sort | \
  uniq | \
  xargs -I{} npm i -D {}
```

## TODO:

- Allow passing a cb for when the operation fails
	- this is allow logging or whatever is desired by the client
- Worth implementing retry?
	- If so, make it so that the max retry period is provided
- Custom exception for when the operation fails due to a sync issue
