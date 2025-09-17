const { visitStringLiteral, visitNumericLiteral, visitBooleanLiteral } = require("./literals");
const { visitIdentifier } = require("./identifiers");
const { visitBinaryExpression, visitConditionalExpression, visitCallExpression } = require("./expressions");
const { visitArrowFunction } = require("./functions");
const { visitConstDeclaration, visitBlockStatement, visitReturnStatement } = require("./declarations");
const { visitArrayLiteral, visitObjectLiteral } = require("./literals");

function visitNode(node) {
  switch (node.type) {
    case "ConstDeclaration": return visitConstDeclaration(node);
    case "ArrowFunctionExpression": return visitArrowFunction(node);
    case "Identifier": return visitIdentifier(node);
    case "ReturnStatement": return visitReturnStatement(node);
    case "BinaryExpression": return visitBinaryExpression(node);
    case "ConditionalExpression": return visitConditionalExpression(node);
    case "CallExpression": return visitCallExpression(node);
    case "ArrayLiteral": return visitArrayLiteral(node);
    case "BlockStatement": return visitBlockStatement(node);
    case "ObjectLiteral": return visitObjectLiteral(node);
    case "StringLiteral": return visitStringLiteral();
    case "NumericLiteral": return visitNumericLiteral();
    case "BooleanLiteral": return visitBooleanLiteral();
    default: return null;
  }
}

module.exports = { visitNode };
