const test = require('ava');
const sinon = require('sinon');
const factory = require('../../src/put');

test.beforeEach(t => {
  t.context = { sandbox: sinon.createSandbox() };
});

test.afterEach(t => {
  t.context.sandbox.restore();
});

test('put success', async t => {
  const { sandbox } = t.context;
  const ETag = '"newETag"';
  const prevETag = '"prevETag"';
  const s3 = {
    putObject: sandbox.stub()
    .returns({
      promise: () => Promise.resolve({ ETag })
    })
  };
  const dynamodb = {
    updateItem: sandbox.stub()
    .returns({
      promise: () => Promise.resolve({
        Attributes: { ETag: prevETag }
      })
    })
  };
  const $put = factory(s3, dynamodb);
  const actual = await $put('bucket', 'key', 'body');
  t.log(actual);
  t.true(s3.putObject.calledOnce);
  t.true(dynamodb.updateItem.calledOnce);
  t.deepEqual(actual, { ETag });
});

test('s3 putObject problem', async t => {
  const { sandbox } = t.context;
  const prevETag = '"prevETag"';
  sandbox.stub(console, 'error'); // silence error messages
  const s3 = {
    putObject: sandbox.stub().returns({
      promise: sandbox.stub().rejects()
    })
  };
  const dynamodb = {
    updateItem: sandbox.stub()
    .returns({
      promise: () => Promise.resolve({
        Attributes: { ETag: prevETag }
      })
    })
  };
  const $put = factory(s3, dynamodb);
  const error = await t.throwsAsync(async () => {
    await $put('bucket', 'key', 'body');
  });
  t.log(error);
  t.true(s3.putObject.calledOnce);
  t.true(dynamodb.updateItem.calledTwice);
});
