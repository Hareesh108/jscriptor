const { unify } = require("../unification");
const { freshTypeId, createConcreteType } = require("../db");
const { pushScope, popScope } = require("../scope");
const { reportError } = require("../errors");
const { visitIdentifier } = require("./identifiers");
const { visitBinaryExpression, visitCallExpression, visitConditionalExpression } = require("./expressions");
const { visitArrowFunction } = require("./functions");
const { visitConstDeclaration } = require("./declarations");
const { visitArrayLiteral, visitObjectLiteral } = require("./literals");

function visitNode(node) {
  // Allow submodules to recurse by exposing the dispatcher on the node
  node.__visit = visitNode;
  switch (node.type) {
    case "ConstDeclaration":
      return visitConstDeclaration(node);
    case "ArrowFunctionExpression":
      return visitArrowFunction(node);
    case "Identifier":
      return visitIdentifier(node);
    case "ReturnStatement":
      return visitReturnStatement(node);
    case "BinaryExpression":
      return visitBinaryExpression(node);
    case "ConditionalExpression":
      return visitConditionalExpression(node);
    case "CallExpression":
      return visitCallExpression(node);
    case "ArrayLiteral":
      return visitArrayLiteral(node);
    case "BlockStatement":
      return visitBlockStatement(node);
    case "ObjectLiteral":
      return visitObjectLiteral(node);
    case "StringLiteral":
      return createConcreteType("String");
    case "NumericLiteral":
      return createConcreteType("Number");
    case "BooleanLiteral":
      return createConcreteType("Boolean");
    default:
      reportError(`Unknown node type during type checking: ${node.type}`, node);
      return freshTypeId();
  }
}

// Inject a small helper so submodules can recursively visit children.
function attachVisitor(node) {
  node.__visit = visitNode;
  return node;
}

function visitReturnStatement(node) {
  if (node.argument) return visitNode(node.argument);
  return createConcreteType("Void");
}

function visitBlockStatement(node) {
  let lastType = createConcreteType("Void");
  pushScope();
  for (const statement of node.body) {
    lastType = visitNode(statement);
  }
  popScope();
  return lastType;
}

module.exports = {
  visitNode,
  unify,
};


