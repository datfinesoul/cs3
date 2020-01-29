const test = require('ava');
const sinon = require('sinon');
const factory = require('../../src/list');

test.beforeEach(t => {
  t.context = { sandbox: sinon.createSandbox() };
  process.env.NODE_ENV = 'production';
});

test.afterEach(t => {
  t.context.sandbox.restore();
  t.is(process.env.NODE_ENV, 'production');
});

test('list success', async t => {
  const { sandbox } = t.context;
  const s3 = {
    listObjectsV2: sandbox.stub()
    .returns({
      promise: () => Promise.resolve()
    })
  };
  const $list = factory(s3);
  const actual = await $list('bucket', 'prefix');
  t.log(actual);
  t.true(s3.listObjectsV2.calledOnce);
});
