// Orchestrates type checking by delegating node visits to the visitors layer.
// The underlying visitor implementations currently live in `utils.js` and are
// re-exported through `./visitors/index.js` for a clearer structure.
const { visitNode } = require("./visitors");
const { resetTypes } = require("./db");
const { resetErrors, getErrors } = require("./errors");
const { resetScopes } = require("./scope");

/**
 * Type Checking (Hindley-Milner type inference)
 *
 * This module performs type inference on the parse tree, using a simplified
 * Hindley-Milner type system with unification and path compression. It:
 * - Infers types for expressions and declarations
 * - Ensures type consistency across variable usages
 * - Reports type errors when incompatible types are used
 */

/**
 * Perform type checking on a parse tree
 *
 * @param {object|Array} statements - The parse tree to analyze (may be an array of statements)
 * @returns {object} - The analyzed parse tree with type information and any errors
 */
function typeCheck(statements) {
  // Reset analyzer state
  resetTypes();
  resetErrors();
  resetScopes();

  // Visit each statement in the program
  for (const statement of statements) {
    visitNode(statement);
  }

  return { errors: getErrors() };
}

module.exports = {
  typeCheck
};
