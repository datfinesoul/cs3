const test = require('ava');

test.beforeEach(() => {
  process.env.NODE_ENV = 'production';
});

test.afterEach(t => {
  t.is(process.env.NODE_ENV, 'production');
});

test('init core', t => {
  const lib = require('..');
  t.true(typeof lib.put === 'function');
  t.true(typeof lib.list === 'function');
});
