const test = require('ava');

test.beforeEach(() => {
  process.env.NODE_ENV = 'production';
});

test.afterEach(t => {
  t.is(process.env.NODE_ENV, 'production');
});

test('test', t => {
  t.is(true, true);
});
