const { createConcreteType } = require("../db");

function visitStringLiteral() {
  return createConcreteType("String");
}

function visitNumericLiteral() {
  return createConcreteType("Number");
}

function visitBooleanLiteral() {
  return createConcreteType("Boolean");
}

module.exports = { visitStringLiteral, visitNumericLiteral, visitBooleanLiteral };
