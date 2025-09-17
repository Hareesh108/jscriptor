const { visitNode } = require("./index");

/**
 * Perform type checking on a parse tree
 *
 * @param {object|Array} statements - The parse tree to analyze (may be an array of statements)
 * @returns {object} - The analyzed parse tree with type information and any errors
 */
function typeCheck(statements) {
  // Reset globals
  db = [];
  errors = [];
  nextTypeId = 0;
  scopes = [{}]; // Reset the scope stack

  // Visit each statement in the program
  for (const statement of statements) {
    visitNode(statement);
  }

  return { errors };
}

module.exports = {
  typeCheck
};
