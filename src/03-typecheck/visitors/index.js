const { unify } = require("../unification");
const {
  pushScope,
  popScope,
  defineInCurrentScope,
  lookupInScopes,
} = require("../scope");
const {
  freshTypeId,
  createConcreteType,
  createObjectType,
  getConcreteTypeName,
} = require("../db");
const { typeFromAnnotation } = require("../type-utils");
const { reportError } = require("../errors");

function visitNode(node) {
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

function visitIdentifier(node) {
  const found = lookupInScopes(node.name);
  if (found !== undefined) {
    node.typeId = found;
    return node.typeId;
  }
  if (node.typeId === undefined) {
    node.typeId = freshTypeId();
  }
  return node.typeId;
}

function visitBinaryExpression(node) {
  const leftType = visitNode(node.left);
  const rightType = visitNode(node.right);
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

function visitArrowFunction(node) {
  pushScope();
  for (const param of node.params) {
    const paramType = param.typeAnnotation
      ? typeFromAnnotation(param.typeAnnotation)
      : freshTypeId();
    param.typeId = paramType;
    defineInCurrentScope(param.name, paramType);
  }
  const bodyType = visitNode(node.body);
  node.inferredReturnTypeId = bodyType;
  if (node.returnType) {
    const annotatedReturn = typeFromAnnotation(node.returnType);
    unify(bodyType, annotatedReturn, node);
  }
  popScope();
  return createConcreteType("Function");
}

function visitCallExpression(node) {
  visitNode(node.callee);
  const returnType = freshTypeId();
  if (node.arguments.length > 0) {
    const argTypes = node.arguments.map((arg) => visitNode(arg));
    node.argumentTypes = argTypes;
    if (node.callee.type === "Identifier" && lookupInScopes(node.callee.name)) {
      if (node.arguments.length === 1) {
        unify(returnType, argTypes[0], node);
      }
    }
  }
  return returnType;
}

function visitConstDeclaration(node) {
  const initType = visitNode(node.init);
  node.id.typeId = initType;
  defineInCurrentScope(node.id.name, initType);

  if (node.typeAnnotation) {
    if (
      node.typeAnnotation.type === "FunctionTypeAnnotation" &&
      node.init &&
      node.init.type === "ArrowFunctionExpression"
    ) {
      const annotatedReturn = typeFromAnnotation(
        node.typeAnnotation.returnType,
      );
      if (node.init.inferredReturnTypeId !== undefined) {
        unify(node.init.inferredReturnTypeId, annotatedReturn, node);
      }
      const annotatedParams = node.typeAnnotation.paramTypes || [];
      for (let i = 0; i < Math.min(annotatedParams.length, node.init.params.length); i++) {
        const paramAnnoType = typeFromAnnotation(annotatedParams[i].typeAnnotation);
        const actualParam = node.init.params[i];
        if (actualParam.typeId === undefined) {
          actualParam.typeId = freshTypeId();
        }
        unify(actualParam.typeId, paramAnnoType, node);
      }
      const annotatedFunc = createConcreteType("Function");
      unify(initType, annotatedFunc, node);
    } else if (
      node.typeAnnotation.type === "ObjectTypeAnnotation" &&
      node.init &&
      node.init.type === "ObjectLiteral"
    ) {
      const annotatedObjType = typeFromAnnotation(node.typeAnnotation);
      const initProps = Object.fromEntries(
        node.init.properties.map((p) => [p.key, p])
      );
      for (const field of node.typeAnnotation.fields) {
        const prop = initProps[field.name];
        if (!prop) {
          reportError(
            `Type mismatch: missing field '${field.name}' in object literal`,
            node,
          );
          continue;
        }
        const propType = visitNode(prop.value);
        const fieldAnnoType = typeFromAnnotation(field.typeAnnotation);
        unify(propType, fieldAnnoType, prop.value);
      }
      unify(initType, annotatedObjType, node);
    } else if (
      node.typeAnnotation.type === "UnionTypeAnnotation"
    ) {
      const options = node.typeAnnotation.types || [];
      const initConcrete = getConcreteTypeName(initType);
      let chosen = null;
      for (const opt of options) {
        const optType = typeFromAnnotation(opt);
        const optConcrete = getConcreteTypeName(optType);
        if (initConcrete && optConcrete && initConcrete !== optConcrete) {
          continue;
        }
        chosen = optType;
        break;
      }
      if (chosen) {
        unify(initType, chosen, node);
      } else {
        reportError(
          `Type mismatch: value does not match any type in the union`,
          node,
        );
      }
    } else if (
      node.typeAnnotation.type === "ArrayTypeAnnotation" &&
      node.init &&
      node.init.type === "ArrayLiteral"
    ) {
      const elementAnnoType = typeFromAnnotation(
        node.typeAnnotation.elementType,
      );
      for (const el of node.init.elements) {
        const elType = visitNode(el);
        unify(elType, elementAnnoType, el);
      }
      const annotated = typeFromAnnotation(node.typeAnnotation);
      unify(initType, annotated, node);
    } else {
      const annotated = typeFromAnnotation(node.typeAnnotation);
      unify(initType, annotated, node);
    }
  }
  return initType;
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

function visitReturnStatement(node) {
  if (node.argument) {
    return visitNode(node.argument);
  }
  return createConcreteType("Void");
}

function visitConditionalExpression(node) {
  const testType = visitNode(node.test);
  const consequentType = visitNode(node.consequent);
  const alternateType = visitNode(node.alternate);
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

function visitArrayLiteral(node) {
  if (node.elements.length === 0) {
    return createConcreteType("Array");
  }
  const firstElementType = visitNode(node.elements[0]);
  const firstElementConcrete = getConcreteTypeName(firstElementType);
  for (let i = 1; i < node.elements.length; i++) {
    const elementType = visitNode(node.elements[i]);
    const elementConcrete = getConcreteTypeName(elementType);
    if (
      firstElementConcrete &&
      elementConcrete &&
      firstElementConcrete !== elementConcrete
    ) {
      reportError(
        `Type mismatch in array literal: array elements must have consistent types, found ${firstElementConcrete} and ${elementConcrete}`,
        node.elements[i],
      );
      continue;
    }
    if (!unify(firstElementType, elementType, node.elements[i])) {
      reportError(
        `Type mismatch in array literal: array elements must have consistent types`,
        node.elements[i],
      );
    }
  }
  return createConcreteType("Array");
}

function visitObjectLiteral(node) {
  const fields = {};
  for (const prop of node.properties) {
    fields[prop.key] = visitNode(prop.value);
  }
  return createObjectType(fields);
}

module.exports = {
  visitNode,
  unify,
};


