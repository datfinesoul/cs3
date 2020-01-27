const { promisify } = require('util');
const crypto = require('crypto');
const aws = require('aws-sdk');
const randomFill = promisify(crypto.randomFill);

function dec2hex(dec) {
  return ('0' + dec.toString(16)).slice(-2);
}

exports.generateId = async function generateId(len) {
  const allocLength = Math.round((len || 40) / 2);
  const arr = new Uint8Array(allocLength);
  await randomFill(arr);
  return [...arr].map(dec2hex).join('').slice(0, len);
};

exports.hashBase64Md5 = function hashBase64Md5(input) {
  return crypto.createHash('md5').update(input).digest('base64');
};

exports.md5 = function md5(input) {
  return aws.util.crypto.md5(input, 'base64');
};
