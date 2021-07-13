var forEach = require('lodash.foreach');
var utf8 = require('utf8');
var test = require('tape');

var tripcode = require('../');

var generateTripList = require('./generate-trip-list');

test('huge list of tripcodes (19233 assertions)', function(t) {
  generateTripList(function(error, tripcodes) {
    if (error) throw error;

    t.plan(1);

    var failed = [];
    forEach(tripcodes, function(trip) {
      var actual = tripcode(trip[0]);
      var expected = trip[1];
      failed = [actual, expected];
      return actual === expected;
    });

    t.equal(failed[0], failed[1]);
  });
});

test('anything not alphanumeric', function(t) {
  var SYMBOLS = [
    ['!', 'KNs1o0VDv6'],
    ['@', 'z0MWdctOjE'],

    // How?
    ['#', 'u2YjtUz8MU'],

    ['$', 'yflOPYrGcY'],
    ['%', '1t98deumW.'],
    ['^', 'gBeeWo4hQg'],
    ['&', '2r2Ga7GHRc'],
    ['*', 'o8gKYE6H8A'],
    ['(', 'SGn2Wwr9CY'],
    [')', 'E9k1wjKgHI'],
    ['-', 'tHbGiobWdM'],
    ['_', 'm3eoQIlU/U'],
    ['=', 'wmxP/NHJxA'],
    ['+', 'IHLbs/YhoA'],
    ['[', '7h2f0/nQ3w'],
    [']', 'rjM99frkZs'],
    ['{', 'odBt7a7lv6'],
    ['}', 'ATNP9hXHcg'],
    [';', 'zglc7ct1Ls'],
    [':', '.BmRMKOub2'],
    ['\'', '8/08awL.AE'],
    ['"', '4eqVTkonjE'],
    ['<', '7VUOmXKYm6'],
    ['>', '6W2qXe4d8s'],
    [',', 'YeQQgdCJE6'],
    ['.', 'XONm83jaIU'],
    ['\\', '9xUxYS2dlM'],
    ['?', 'cPUZU5OGFs'],
    [' ', 'wqLZLRuzPQ']
  ];

  t.plan(SYMBOLS.length);

  forEach(SYMBOLS, function(trip) {
    t.equal(tripcode(trip[0]), trip[1]);
  });
});

test('symbols that are ignored', function(t) {
  var SYMBOLS = [
    '©'
  ];

  t.plan(SYMBOLS.length);

  forEach(SYMBOLS, function(trip) {
    t.equal(tripcode(trip), '');
  });
});

test('collisions', function(t) {
  t.plan(1);

  // U+8A1B CJK UNIFIED IDEOGRAPH-8A1B
  // http://codepoints.net/U+8A1B
  //
  // !c8eDXvwFLQ
  t.equal(tripcode('fa'), tripcode(utf8.decode('\xE8\xA8\x9B')));
});

test('half width katakana', function(t) {
  t.plan(1);

  t.equal(tripcode('ﾐﾐ'), '8wihCLEUuc');
});
