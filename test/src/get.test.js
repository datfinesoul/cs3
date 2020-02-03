const test = require('ava');
const sinon = require('sinon');
const factory = require('../../src/get');

test.beforeEach(t => {
  t.context = { sandbox: sinon.createSandbox() };
  process.env.NODE_ENV = 'production';
});

test.afterEach(t => {
  t.context.sandbox.restore();
  t.is(process.env.NODE_ENV, 'production');
});

test('get success, s3 & dynamo match', async t => {
  const { sandbox } = t.context;
  const ETag = '"faketag"';
  const s3 = {
    getObject: sandbox.stub()
    .returns({
      promise: () => Promise.resolve({
        AcceptRanges: 'bytes',
        LastModified: Date.parse('2020-01-29T07:08:54.000Z'),
        ContentLength: 20,
        ETag,
        ContentType: 'application/octet-stream',
        Metadata: {},
        Body: Buffer.from('this is a test', 'utf8')
      })
    })
  };
  const dynamodb = {
    getItem: sandbox.stub()
    .returns({
      promise: () => Promise.resolve({
        Item: { ETag }
      })
    })
  };
  const $get = factory(s3, dynamodb);
  const actual = await $get('bucket', 'key');
  t.true(s3.getObject.calledOnce);
  t.snapshot(actual);
});
