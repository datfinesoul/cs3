const test = require('ava');
const lib = require('../../src/generators');

test('generateId function', t => {
  t.true(typeof lib.generateId === 'function');
});

test('generateId length:5', async t => {
  const id = await lib.generateId(5);
  t.log(id);
  t.true(typeof id === 'string');
  t.is(id.length, 5);
});

test('generateId length:20', async t => {
  const id = await lib.generateId(20);
  t.log(id);
  t.true(typeof id === 'string');
  t.is(id.length, 20);
});

test('hashBase64Md5 function', t => {
  t.true(typeof lib.hashBase64Md5 === 'function');
});

test('hashBase64Md5 from string', t => {
  const hash = lib.hashBase64Md5('Hello World');
  t.log(hash);
  t.snapshot(hash);
});

test('md5 function', t => {
  t.true(typeof lib.md5 === 'function');
});

test('md5 from string', t => {
  const hash = lib.md5('Hello World');
  t.log(hash);
  t.snapshot(hash);
});
