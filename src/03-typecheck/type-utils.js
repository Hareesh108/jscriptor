const { freshTypeId, createConcreteType, createObjectType } = require("./db");

function typeFromAnnotation(annotationNode) {
  if (!annotationNode) return freshTypeId();

  if (annotationNode.type === "TypeAnnotation") {
    const value = annotationNode.valueType;
    switch (value) {
      case "number":
        return createConcreteType("Number");
      case "string":
        return createConcreteType("String");
      case "boolean":
        return createConcreteType("Boolean");
      case "void":
      case "Void":
        return createConcreteType("Void");
      case "Array":
        return createConcreteType("Array");
      default: {
        const normalized =
          typeof value === "string" && value.length > 0
            ? value[0].toUpperCase() + value.slice(1)
            : "Unknown";
        return createConcreteType(normalized);
      }
    }
  }

  if (annotationNode.type === "ArrayTypeAnnotation") {
    return createConcreteType("Array");
  }

  if (annotationNode.type === "FunctionTypeAnnotation") {
    return createConcreteType("Function");
  }

  if (annotationNode.type === "ObjectTypeAnnotation") {
    const fields = {};
    for (const f of annotationNode.fields) {
      fields[f.name] = typeFromAnnotation(f.typeAnnotation);
    }
    return createObjectType(fields);
  }

  if (annotationNode.type === "UnionTypeAnnotation") {
    return freshTypeId();
  }

  return freshTypeId();
}

module.exports = {
  typeFromAnnotation,
};


