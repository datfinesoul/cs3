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

test('get success', async t => {
  const { sandbox } = t.context;
  const s3 = {
    getObject: sandbox.stub()
    .returns({
      promise: () => Promise.resolve({ ETag: '"fake"' })
    })
  };
  const $get = factory(s3);
  const actual = await $get('bucket', 'key');
  t.log(actual);
  t.true(s3.getObject.calledOnce);
});
