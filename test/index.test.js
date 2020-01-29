const test = require('ava');

test('init core', t => {
  const $lib = require('..');
  t.true(typeof $lib === 'function');
  const lib = $lib();
  t.true(typeof lib.get === 'function');
  t.true(typeof lib.put === 'function');
  t.true(typeof lib.list === 'function');
});
