/**
 * Type Checking (Hindley-Milner type inference)
 *
 * This module performs type inference on the parse tree, using a simplified
 * Hindley-Milner type system with unification and path compression. It:
 * - Infers types for expressions and declarations
 * - Ensures type consistency across variable usages
 * - Reports type errors when incompatible types are used
 */

// The types database (unification table)
let db = [];
let errors = [];
let nextTypeId = 0;
let scope = {}; // Variable scope to track types

/**
 * Create a new type variable (type id)
 *
 * @returns {number} - A fresh type id
 */
function freshTypeId() {
  const id = nextTypeId++;
  db[id] = null;
  return id;
}

/**
 * Report a type error found during analysis
 *
 * @param {string} message - Error message
 * @param {object} node - Parse tree node where the error occurred
 */
function reportError(message, node) {
  errors.push({ message, node });
}

/**
 * Create a concrete type in the types database
 *
 * @param {string} typeName - Name of the concrete type (e.g., "String", "Number")
 * @returns {number} - The type id of the new concrete type
 */
function createConcreteType(typeName) {
  const id = nextTypeId++;
  db[id] = { concrete: typeName };
  return id;
}

/**
 * Find the ultimate type that a type id points to, with path compression
 *
 * @param {number} typeId - The type id to find
 * @returns {number} - The ultimate type id after following all symlinks
 */
function resolveSymlinksAndCompress(typeId) {
  const entry = db[typeId];

  // If it's null, it's a type variable that hasn't been unified yet
  if (entry === null) {
    return typeId;
  }

  // If it's a symlink, follow it (with path compression)
  if (entry && entry.symlink !== undefined) {
    const ultimateTypeId = resolveSymlinksAndCompress(entry.symlink);

    // Path compression: update the symlink to point directly to the ultimate type
    if (ultimateTypeId !== entry.symlink) {
      db[typeId] = { symlink: ultimateTypeId };
    }

    return ultimateTypeId;
  }

  // For concrete types
  return typeId;
}

/**
 * Get the concrete type name of a type id, if it has one
 *
 * @param {number} typeId - The type id to check
 * @returns {string|null} - The concrete type name, or null if it's a type variable
 */
function getConcreteTypeName(typeId) {
  const ultimateId = resolveSymlinksAndCompress(typeId);
  const entry = db[ultimateId];

  if (entry && entry.concrete !== undefined) {
    return entry.concrete;
  }

  return null;
}

/**
 * Report a type mismatch error
 *
 * @param {number} typeId1 - First type id involved in the mismatch
 * @param {number} typeId2 - Second type id involved in the mismatch
 * @param {object} [node] - Optional node where the error occurred
 * @returns {boolean} - Always returns false to indicate unification failed
 */
function reportTypeMismatch(typeId1, typeId2, node) {
  const type1Name = getConcreteTypeName(typeId1) || "unknown";
  const type2Name = getConcreteTypeName(typeId2) || "unknown";

  reportError(
    `Type mismatch: cannot unify ${type1Name} with ${type2Name}`,
    node,
  );
  return false;
}

/**
 * Unify two types, ensuring they are compatible
 * This is the core of the Hindley-Milner type system
 *
 * @param {number} typeId1 - First type id to unify
 * @param {number} typeId2 - Second type id to unify
 * @returns {boolean} - True if unification succeeded, false if failed
 */
const unify = (aTypeId, bTypeId, node) => {
  const aType = resolveSymlinksAndCompress(aTypeId);
  const bType = resolveSymlinksAndCompress(bTypeId);

  // If they're already the same, we're done
  if (aType === bType) return true;

  const aEntry = db[aType];
  const bEntry = db[bType];

  // If both have concrete types and they're different, report mismatch
  if (
    aEntry &&
    aEntry.concrete !== undefined &&
    bEntry &&
    bEntry.concrete !== undefined &&
    aEntry.concrete !== bEntry.concrete
  ) {
    return reportTypeMismatch(aType, bType, node);
  }

  if (aEntry === null) {
    // If aEntry is null (unassigned type variable)
    db[aType] =
      bEntry === null
        ? { symlink: bType }
        : bEntry.concrete !== undefined
          ? { concrete: bEntry.concrete }
          : { symlink: bType };
    return true;
  } else if (bEntry === null) {
    return unify(bTypeId, aTypeId, node); // Swap the args
  } else if (aEntry.concrete !== undefined) {
    // a is concrete, b is not null but must be a variable
    db[bType] = { symlink: aType };
  } else {
    // a is not concrete and not null, so must be a variable
    db[aType] = { symlink: bType };
  }

  return true;
};

/**
 * Visit and type-check a parse tree node and its children
 *
 * @param {object} node - Parse tree node to visit
 * @returns {number} - The type id of the node
 */
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

    case "StringLiteral":
      return createConcreteType("String");

    case "NumericLiteral":
      return createConcreteType("Number");

    case "BooleanLiteral":
      return createConcreteType("Boolean");

    default:
      reportError(`Unknown node type during type checking: ${node.type}`, node);
      return freshTypeId(); // Return a fresh type as a fallback
  }
}

/**
 * Visit an identifier (variable reference)
 *
 * @param {object} node - Identifier node to visit
 * @returns {number} - The type id of the identifier
 */
function visitIdentifier(node) {
  // Look up the variable in the scope
  if (scope[node.name] !== undefined) {
    node.typeId = scope[node.name];
    return node.typeId;
  }

  // If not found in scope, create a fresh type variable
  if (node.typeId === undefined) {
    node.typeId = freshTypeId();
  }
  return node.typeId;
}

/**
 * Visit a binary expression (e.g., a + b)
 *
 * @param {object} node - BinaryExpression node to visit
 * @returns {number} - The type id of the binary expression
 */
function visitBinaryExpression(node) {
  const leftType = visitNode(node.left);
  const rightType = visitNode(node.right);

  // Get concrete types for more precise error messages
  const leftConcrete = getConcreteTypeName(leftType);
  const rightConcrete = getConcreteTypeName(rightType);

  if (node.operator === "+") {
    // Check if we have concrete types and they don't match
    if (leftConcrete && rightConcrete && leftConcrete !== rightConcrete) {
      reportError(
        `Type mismatch in binary operation: cannot add ${leftConcrete} to ${rightConcrete}`,
        node,
      );
      return createConcreteType("Number"); // Return a placeholder type
    }

    // If not both concrete, try to unify
    const canUnify = unify(leftType, rightType, node);
    if (!canUnify) {
      reportError(
        `Type mismatch in binary operation: cannot add ${leftConcrete || "unknown"} to ${rightConcrete || "unknown"}`,
        node,
      );
      return createConcreteType("Number"); // Return a placeholder type
    }

    return leftType;
  } else if (node.operator === "*") {
    // Multiplication: both operands must be numbers
    const numberType = createConcreteType("Number");

    // Check if we have concrete types that aren't numbers
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

    // If we don't have concrete types, try to unify with Number
    if (!leftConcrete) {
      unify(leftType, numberType, node.left);
    }

    if (!rightConcrete) {
      unify(rightType, numberType, node.right);
    }

    return numberType;
  }

  // Default case: ensure both operands have the same type
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

/**
 * Visit an arrow function
 *
 * @param {object} node - ArrowFunctionExpression node to visit
 * @returns {number} - The type id of the function
 */
function visitArrowFunction(node) {
  // Type check function body
  const bodyType = visitNode(node.body);

  // If there's a return type annotation, check it matches the body
  if (node.returnType) {
    // In a real implementation, process the return type annotation
    // and unify it with bodyType
  }

  // For each parameter, create a type
  for (const param of node.params) {
    param.typeId = freshTypeId();

    // If there's a type annotation, use it
    if (param.typeAnnotation) {
      // In a real implementation, process the type annotation
      // and unify it with param.typeId
    }
  }

  // Create a function type - in a real implementation
  // this would capture parameter and return types
  const functionTypeId = freshTypeId();
  return functionTypeId;
}

/**
 * Visit a function call expression
 *
 * @param {object} node - CallExpression node to visit
 * @returns {number} - The type id of the call result
 */
function visitCallExpression(node) {
  const calleeType = visitNode(node.callee);

  // Create a return type for the function
  const returnType = freshTypeId();

  // If we have arguments, process them and establish the connection
  // between argument types and return type for polymorphic functions
  if (node.arguments.length > 0) {
    // Visit each argument to get its type
    const argTypes = node.arguments.map((arg) => visitNode(arg));

    // Store argument types on the node for use with polymorphic functions
    node.argumentTypes = argTypes;

    // For polymorphic functions, the return type is determined by the argument types
    // Here we're establishing that relationship in our type system
    if (node.callee.type === "Identifier" && scope[node.callee.name]) {
      // For known functions in scope, the return type should match the body's type
      // For simple polymorphic functions like (x) => x + x, the return type matches the input type
      if (node.arguments.length === 1) {
        unify(returnType, argTypes[0], node);
      }
    }
  }

  return returnType;
}

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

  // Add the variable to scope
  scope[node.id.name] = initType;

  // If there's a type annotation, check it matches the initialization
  if (node.typeAnnotation) {
    // In a real implementation, process the type annotation
    // and unify it with initType
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

  // Visit each statement in the block
  for (const statement of node.body) {
    lastType = visitNode(statement);
  }

  return lastType;
}

/**
 * Visit a return statement
 *
 * @param {object} node - ReturnStatement node to visit
 * @returns {number} - The type id of the returned expression
 */
function visitReturnStatement(node) {
  if (node.argument) {
    return visitNode(node.argument);
  }

  // Return void if no argument
  return createConcreteType("Void");
}

/**
 * Visit a conditional (ternary) expression
 *
 * @param {object} node - ConditionalExpression node to visit
 * @returns {number} - The type id of the conditional expression
 */
function visitConditionalExpression(node) {
  const testType = visitNode(node.test);
  const consequentType = visitNode(node.consequent);
  const alternateType = visitNode(node.alternate);

  // Test must be a boolean
  const booleanType = createConcreteType("Boolean");
  const testConcrete = getConcreteTypeName(testType);

  // Check if test is Boolean, directly compare concrete types
  if (testConcrete && testConcrete !== "Boolean") {
    reportError(
      `Type mismatch in ternary: condition must be Boolean, got ${testConcrete}`,
      node.test,
    );
  } else {
    // Try to unify if we don't have concrete type info
    unify(testType, booleanType, node.test);
  }

  // Get concrete types for branches
  const consequentConcrete = getConcreteTypeName(consequentType);
  const alternateConcrete = getConcreteTypeName(alternateType);

  // Check if branches have the same type, directly compare concrete types
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
    // Try to unify if we don't have concrete type info for both
    unify(consequentType, alternateType, node);
  }

  // The type of the expression is the type of either branch
  return consequentType;
}

/**
 * Visit an array literal
 *
 * @param {object} node - ArrayLiteral node to visit
 * @returns {number} - The type id of the array
 */
function visitArrayLiteral(node) {
  // If the array is empty, we can't infer the element type
  if (node.elements.length === 0) {
    // Create a generic array type
    return createConcreteType("Array");
  }

  // Visit each element and ensure they all have the same type
  const firstElementType = visitNode(node.elements[0]);
  const firstElementConcrete = getConcreteTypeName(firstElementType);

  for (let i = 1; i < node.elements.length; i++) {
    const elementType = visitNode(node.elements[i]);
    const elementConcrete = getConcreteTypeName(elementType);

    // If we have concrete types and they're different, report error
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

    // Otherwise try to unify the types
    if (!unify(firstElementType, elementType, node.elements[i])) {
      reportError(
        `Type mismatch in array literal: array elements must have consistent types`,
        node.elements[i],
      );
    }
  }

  // Create an array type (in a real implementation, this would be Array<T>)
  return createConcreteType("Array");
}

/**
 * Perform type checking on a parse tree
 *
 * @param {object|Array} statements - The parse tree to analyze (may be an array of statements)
 * @returns {object} - The analyzed parse tree with type information and any errors
 */
function typeCheck(statements) {
  // Reset globals
  db = [];
  errors = [];
  nextTypeId = 0;
  scope = {}; // Reset the scope

  // Visit each statement in the program
  for (const statement of statements) {
    visitNode(statement);
  }

  return { errors };
}

module.exports = {
  typeCheck,
  unify,
};
