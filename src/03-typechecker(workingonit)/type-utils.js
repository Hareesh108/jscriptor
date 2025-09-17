// typeUtils.js
const { createConcreteType, createObjectType } = require("./db.js");
const { reportError } = require("./errors.js");

/**
 * Convert AST annotation into a typeId
 */
export function typeFromAnnotation(annotation) {
  if (!annotation) return null;

  switch (annotation.type) {
    case "StringKeyword":
      return createConcreteType("string");

    case "NumberKeyword":
      return createConcreteType("number");

    case "BooleanKeyword":
      return createConcreteType("boolean");

    case "ArrayType":
      // Example: number[]
      if (!annotation.elementType) {
        reportError("Array type missing element type", annotation.loc);
        return createConcreteType("any");
      }
      return {
        kind: "array",
        elementType: typeFromAnnotation(annotation.elementType),
      };

    case "UnionType":
      // Example: string | number
      return {
        kind: "union",
        types: annotation.types.map(typeFromAnnotation),
      };

    case "ObjectType":
      // Example: { x: number, y: string }
      const props = {};
      for (const prop of annotation.properties || []) {
        props[prop.key.name] = typeFromAnnotation(prop.value);
      }
      return createObjectType(props);

    default:
      reportError(`Unsupported annotation type: ${annotation.type}`, annotation.loc);
      return createConcreteType("any");
  }
}
