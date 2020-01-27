const test = require('ava');
const sinon = require('sinon');
const factory = require('../../src/put');

test.beforeEach(t => {
  t.context = { sandbox: sinon.createSandbox() };
  process.env.NODE_ENV = 'production';
});

test.afterEach(t => {
  t.context.sandbox.restore();
  t.is(process.env.NODE_ENV, 'production');
});

test('put success', async t => {
  const { sandbox } = t.context;
  const s3 = {
    putObject: sandbox.stub()
    .returns({
      promise: () => Promise.resolve({ ETag: '"fake"' })
    })
  };
  const $put = factory(s3);
  const actual = await $put('bucket', 'key', 'body');
  t.log(actual);
  t.true(s3.putObject.calledOnce);
});
