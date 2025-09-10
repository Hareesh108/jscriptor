const { tokenize } = require("./01-tokenize/tokenize");
const { parse } = require("./02-parse/parse");


/**
 * Tokenize and then parse.
 *
 * @param {string} sourceCode - The source code to compile
 * @returns {Array} - Statement parse tree nodes
 */
function compile(sourceCode) {
  const tokens = tokenize(sourceCode);
  const statements = parse(tokens);

  return statements;
}

module.exports = {
  compile
};