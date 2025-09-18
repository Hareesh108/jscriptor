const { pushScope, popScope, defineInCurrentScope } = require("../scope");
const { freshTypeId, createConcreteType } = require("../db");
const { unify } = require("../unification");
const { typeFromAnnotation } = require("../type-utils");

function visitArrowFunction(node) {
  pushScope();
  for (const param of node.params) {
    const paramType = param.typeAnnotation
      ? typeFromAnnotation(param.typeAnnotation)
      : freshTypeId();
    param.typeId = paramType;
    defineInCurrentScope(param.name, paramType);
  }
  const bodyType = node.__visit(node.body);
  node.inferredReturnTypeId = bodyType;
  if (node.returnType) {
    const annotatedReturn = typeFromAnnotation(node.returnType);
    unify(bodyType, annotatedReturn, node);
  }
  popScope();
  return createConcreteType("Function");
}

module.exports = {
  visitArrowFunction,
};


