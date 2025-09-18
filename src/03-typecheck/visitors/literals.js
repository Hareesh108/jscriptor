const { createConcreteType, createObjectType } = require("../db");

function visitObjectLiteral(node) {
  const fields = {};
  for (const prop of node.properties) {
    fields[prop.key] = node.__visit(prop.value);
  }
  return createObjectType(fields);
}

function visitArrayLiteral(node) {
  if (node.elements.length === 0) {
    return createConcreteType("Array");
  }
  // Fallback: array type without element paramization in this minimal system
  for (const el of node.elements) node.__visit(el);
  return createConcreteType("Array");
}

module.exports = {
  visitObjectLiteral,
  visitArrayLiteral,
};


