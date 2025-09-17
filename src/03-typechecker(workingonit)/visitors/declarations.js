/**
 * Visit a const declaration
 *
 * @param {object} node - ConstDeclaration node to visit
 * @returns {number} - The type id of the declared variable
 */
function visitConstDeclaration(node) {
  const initType = visitNode(node.init);

  // Assign type to the declared identifier
  node.id.typeId = initType;

  // Add the variable to current scope
  defineInCurrentScope(node.id.name, initType);

  // If there's a type annotation, check it matches the initialization
  if (node.typeAnnotation) {
    // Special handling: if annotation is a function type and init is a function
    if (
      node.typeAnnotation.type === "FunctionTypeAnnotation" &&
      node.init &&
      node.init.type === "ArrowFunctionExpression"
    ) {
      // Unify return type
      const annotatedReturn = typeFromAnnotation(
        node.typeAnnotation.returnType,
      );
      if (node.init.inferredReturnTypeId !== undefined) {
        unify(node.init.inferredReturnTypeId, annotatedReturn, node);
      }

      // Unify parameter types positionally
      const annotatedParams = node.typeAnnotation.paramTypes || [];
      for (let i = 0; i < Math.min(annotatedParams.length, node.init.params.length); i++) {
        const paramAnnoType = typeFromAnnotation(annotatedParams[i].typeAnnotation);
        const actualParam = node.init.params[i];
        if (actualParam.typeId === undefined) {
          actualParam.typeId = freshTypeId();
        }
        unify(actualParam.typeId, paramAnnoType, node);
      }

      // Overall function type is represented minimally; still unify top-level
      const annotatedFunc = createConcreteType("Function");
      unify(initType, annotatedFunc, node);
    } else if (
      node.typeAnnotation.type === "ObjectTypeAnnotation" &&
      node.init &&
      node.init.type === "ObjectLiteral"
    ) {
      // Enforce object fields per annotation
      const annotatedObjType = typeFromAnnotation(node.typeAnnotation);
      // For each annotated field, find in init and unify
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
      // Unify overall object types
      unify(initType, annotatedObjType, node);
    } else if (
      node.typeAnnotation.type === "UnionTypeAnnotation"
    ) {
      // Match union by concrete type name, then unify without logging speculative errors
      const options = node.typeAnnotation.types || [];
      const initConcrete = getConcreteTypeName(initType);
      let chosen = null;
      for (const opt of options) {
        const optType = typeFromAnnotation(opt);
        const optConcrete = getConcreteTypeName(optType);
        if (initConcrete && optConcrete && initConcrete !== optConcrete) {
          continue; // incompatible concrete types
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
      // Enforce element type annotation on array literal elements
      const elementAnnoType = typeFromAnnotation(
        node.typeAnnotation.elementType,
      );
      for (const el of node.init.elements) {
        const elType = visitNode(el);
        unify(elType, elementAnnoType, el);
      }
      // Unify overall array type
      const annotated = typeFromAnnotation(node.typeAnnotation);
      unify(initType, annotated, node);
    } else {
      const annotated = typeFromAnnotation(node.typeAnnotation);
      unify(initType, annotated, node);
    }
  }

  return initType;
}


/**
 * Visit a block statement
 *
 * @param {object} node - BlockStatement node to visit
 * @returns {number} - The type id of the last statement, or void
 */
function visitBlockStatement(node) {
  let lastType = createConcreteType("Void");

  // Each block introduces a new scope
  scopes.push({});
  for (const statement of node.body) {
    lastType = visitNode(statement);
  }
  scopes.pop();

  return lastType;
}


