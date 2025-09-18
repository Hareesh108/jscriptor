const { freshTypeId, createConcreteType, getConcreteTypeName } = require("../db");
const { defineInCurrentScope } = require("../scope");
const { unify } = require("../unification");
const { typeFromAnnotation } = require("../type-utils");
const { reportError } = require("../errors");

function visitConstDeclaration(node) {
  const initType = node.__visit(node.init);
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
            "E_OBJECT_FIELD_MISSING",
          );
          continue;
        }
        const propType = node.__visit(prop.value);
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
          "E_UNION_NO_MATCH",
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
        const elType = node.__visit(el);
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

module.exports = {
  visitConstDeclaration,
};


