#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var split = require('split');
var forEach = require('lodash.foreach');

var tripcode = require('../');

function tripify(value) {
  process.stdout.write('#' + value + ' => !' + tripcode(value) + '\n');
}

// Something is being piped in.
if (!process.stdin.isTTY) {
  // The stdin stream is paused by default.
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.pipe(split())
    .on('data', tripify);
}

// Password(s) passed as argument(s).
else {
  forEach(argv._, tripify);
}
