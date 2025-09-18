const { unify } = require("../unification");
const {
  freshTypeId,
  createConcreteType,
  getConcreteTypeName,
} = require("../db");
const { reportError } = require("../errors");
const { lookupInScopes } = require("../scope");

function visitBinaryExpression(node) {
  const leftType = node.__visit(node.left);
  const rightType = node.__visit(node.right);
  const leftConcrete = getConcreteTypeName(leftType);
  const rightConcrete = getConcreteTypeName(rightType);

  if (node.operator === "+") {
    if (leftConcrete && rightConcrete && leftConcrete !== rightConcrete) {
      reportError(
        `Type mismatch in binary operation: cannot add ${leftConcrete} to ${rightConcrete}`,
        node,
      );
      return createConcreteType("Number");
    }
    const canUnify = unify(leftType, rightType, node);
    if (!canUnify) {
      reportError(
        `Type mismatch in binary operation: cannot add ${leftConcrete || "unknown"} to ${rightConcrete || "unknown"}`,
        node,
      );
      return createConcreteType("Number");
    }
    return leftType;
  } else if (node.operator === "*") {
    const numberType = createConcreteType("Number");
    if (leftConcrete && leftConcrete !== "Number") {
      reportError(
        `Type mismatch: expected Number for left operand of '*' operator, got ${leftConcrete}`,
        node.left,
      );
    }
    if (rightConcrete && rightConcrete !== "Number") {
      reportError(
        `Type mismatch: expected Number for right operand of '*' operator, got ${rightConcrete}`,
        node.right,
      );
    }
    if (!leftConcrete) unify(leftType, numberType, node.left);
    if (!rightConcrete) unify(rightType, numberType, node.right);
    return numberType;
  }

  if (leftConcrete && rightConcrete && leftConcrete !== rightConcrete) {
    reportError(
      `Type mismatch in binary operation: operands must have the same type, got ${leftConcrete} and ${rightConcrete}`,
      node,
    );
  } else if (!unify(leftType, rightType, node)) {
    reportError(
      `Type mismatch in binary operation: operands must have the same type`,
      node,
    );
  }
  return leftType;
}

function visitCallExpression(node) {
  node.__visit(node.callee);
  const returnType = freshTypeId();
  if (node.arguments.length > 0) {
    const argTypes = node.arguments.map((arg) => node.__visit(arg));
    node.argumentTypes = argTypes;
    if (node.callee.type === "Identifier" && lookupInScopes(node.callee.name)) {
      if (node.arguments.length === 1) {
        unify(returnType, argTypes[0], node);
      }
    }
  }
  return returnType;
}

function visitConditionalExpression(node) {
  const testType = node.__visit(node.test);
  const consequentType = node.__visit(node.consequent);
  const alternateType = node.__visit(node.alternate);
  const booleanType = createConcreteType("Boolean");
  const testConcrete = getConcreteTypeName(testType);
  if (testConcrete && testConcrete !== "Boolean") {
    reportError(
      `Type mismatch in ternary: condition must be Boolean, got ${testConcrete}`,
      node.test,
    );
  } else {
    unify(testType, booleanType, node.test);
  }
  const consequentConcrete = getConcreteTypeName(consequentType);
  const alternateConcrete = getConcreteTypeName(alternateType);
  if (
    consequentConcrete &&
    alternateConcrete &&
    consequentConcrete !== alternateConcrete
  ) {
    reportError(
      `Type mismatch in ternary: branches must have the same type, got ${consequentConcrete} and ${alternateConcrete}`,
      node,
    );
  } else {
    unify(consequentType, alternateType, node);
  }
  return consequentType;
}

module.exports = {
  visitBinaryExpression,
  visitCallExpression,
  visitConditionalExpression,
};


