var crypt = require('./lib/crypt');
// var htmlEscape = require('./lib/html-escape');
var sjisconv = require('./lib/sjisconv');

var SALT_TABLE = '.............................................../0123456789A'
  + 'BCDEFGABCDEFGHIJKLMNOPQRSTUVWXYZabcdefabcdefghijklmnopqrstuvwxyz..........'
  + '..........................................................................'
  + '.................................................';

function sjis(str) {
  var encoded = '';
  var index = -1;
  var length = str.length;
  while (++index < length) {
    var character = sjisconv[str.charAt(index)];
    if (character) encoded += character;
  }
  return encoded;
}

module.exports = function(key) {
  key = sjis(key);
  // don't use htmlEscape for 2channel compatibility
  // key = htmlEscape(key);

  if (!key.length) return '';

  var salt = '';
  var index = 0;
  while (index++ < 2) {
    salt += SALT_TABLE[(key + 'H.').charCodeAt(index) % 256];
  }

  return crypt(key, salt).substring(3);
};
