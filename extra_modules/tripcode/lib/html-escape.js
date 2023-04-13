// HTML escape utility, but **without** the escaping of the single quote
// character.
//
// Oddly enough, 4chan does not escape the single quote character in tripcodes.
// This means we need to use a custom HTML escape function instead of an
// existing HTML escape module like `he` (since all existing modules escape the
// single quote character).
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '"': '&quot;',
  // '\'': '&#x27;',
  '>': '&gt;'
};

module.exports = function(str) {
  return str.replace(/[&<>"]/g, function(c) {
    return escapeMap[c];
  });
};
