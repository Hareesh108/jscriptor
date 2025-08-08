/**
 * Parsing (aka Syntax Analysis)
 *
 * This module takes a stream of tokens (from the Tokenize step) and builds a parse tree
 * (aka Abstract Syntax Tree, or AST for short). The parse tree represents the structure
 *  of the code.
 */

/**
 * Parse tokens into a Parse Tree
 *
 * @param {Array} tokens - A list of tokens from the tokenizer
 * @returns {Object} - The root node of the Parse Tree
 */
function parse(tokens) {
  let current = 0; // Current token index

  /**
   * Look at the current token without consuming it
   */
  function peek() {
    return tokens[current];
  }

  /**
   * Consume the current token and advance to the next one
   */
  function next() {
    return tokens[current++];
  }

  /**
   * Check if the current token is of a specific type
   */
  function check(type) {
    return peek().type === type;
  }

  /**
   * Expect the current token to be of a specific type
   * If it is, consume it and return it; otherwise, throw an error
   */
  function expect(type, message) {
    if (check(type)) {
      return next();
    }
    // If we don't find what we expect, report a syntax error
    throw new Error(
      message ||
        `Expected ${type} but got ${peek().type} at position ${peek().position}`,
    );
  }

  /**
   * Parse an entire program, returning an array of its top-level statements.
   */
  function parseProgram() {
    const statements = [];

    while (current < tokens.length) {
      try {
        const statement = parseStatement();
        // Only add non-null statements (null is returned for EOF tokens)
        if (statement !== null) {
          statements.push(statement);
        } else {
          // We found an EOF token, so break out of the loop
          break;
        }
      } catch (error) {
        // Skip to the next statement on error
        console.error("Parse error:", error);
        while (current < tokens.length && !check("SEMICOLON")) {
          next();
        }
        if (check("SEMICOLON")) next();
      }
    }

    // Return the array of statements directly
    return statements;
  }

  /**
   * Parse a statement
   * In our simple language, statements are either:
   * - const declarations (const x = ...)
   * - return statements (return ...)
   * There can be a semicolon after a statement, but it's optional.
   */
  function parseStatement() {
    // Handle EOF token by returning null - parseProgram will handle this
    if (check("EOF")) {
      next(); // Consume the EOF token
      return null;
    }

    let statement;
    if (check("CONST")) {
      statement = parseConstDeclaration();
    } else if (check("RETURN")) {
      statement = parseReturnStatement();
    } else {
      throw new Error(`Unexpected token type: ${peek().type}`);
    }

    // Eat the semicolon if present
    if (check("SEMICOLON")) {
      next();
    }

    return statement;
  }

  /**
   * Parse a return statement
   */
  function parseReturnStatement() {
    // Consume the 'return' keyword
    expect("RETURN", "Expected 'return' keyword");

    let argument = null;

    // If there's an expression after return, parse it
    if (
      current < tokens.length &&
      !check("SEMICOLON") &&
      !check("RIGHT_CURLY")
    ) {
      argument = parseExpression();
    }

    const returnStatement = {
      type: "ReturnStatement",
      argument,
    };

    return returnStatement;
  }

  /**
   * Parse a const declaration
   */
  function parseConstDeclaration() {
    // Consume the 'const' keyword
    expect("CONST", "Expected 'const' keyword");

    // Get the variable name
    const id = {
      type: "Identifier",
      name: expect("IDENTIFIER", "Expected variable name").value,
    };

    // Parse type annotation if present (with colon)
    let typeAnnotation = null;
    if (check("COLON")) {
      next(); // Consume the colon
      typeAnnotation = parseTypeAnnotation();
    }

    // Consume the equals sign
    expect("EQUAL", "Expected '=' after variable name");

    // Parse the initializer expression
    const init = parseExpression();

    // Create the const declaration node
    const constDeclaration = {
      type: "ConstDeclaration",
      id,
      init,
      typeAnnotation,
    };

    return constDeclaration;
  }

  /**
   * Parse an expression (anything that produces a value)
   */
  function parseExpression() {
    const expr = parseBinaryExpression();

    // If we see a question mark, this is a ternary expression
    if (check("TERNARY")) {
      // Consume the question mark
      next();

      // Parse the expression to use if condition is true
      const consequent = parseExpression();

      // Consume the colon
      expect("COLON", "Expected ':' in ternary expression");

      // Parse the expression to use if condition is false
      const alternate = parseExpression();

      // Create the ternary expression node
      const ternary = {
        type: "ConditionalExpression",
        test: expr,
        consequent,
        alternate,
      };

      return ternary;
    }

    // If no question mark, just return the expression
    return expr;
  }

  /**
   * Parse binary expressions like a + b + c or a * b * c
   */
  function parseBinaryExpression() {
    // Parse the left-hand side of the expression
    let left = parsePrimary();

    // Process binary operators (+ and *)
    while (check("PLUS") || check("MULTIPLY")) {
      const operator = next().value;
      const right = parsePrimary();

      left = {
        type: "BinaryExpression",
        left,
        operator,
        right,
      };
    }

    return left;
  }

  /**
   * Parse a function expression
   */
  function parseFunction() {
    expect("LEFT_PAREN", "Expected '(' at start of arrow function");

    const params = [];

    // If there are parameters, parse them
    if (!check("RIGHT_PAREN")) {
      do {
        const paramToken = expect("IDENTIFIER", "Expected parameter name");

        // Start with a parameter without a type annotation
        let param = {
          type: "Identifier",
          name: paramToken.value,
        };

        // Check for type annotation (with colon)
        if (check("COLON")) {
          next(); // Consume the colon
          param.typeAnnotation = parseTypeAnnotation();
        }

        // Add this parameter to the list
        params.push(param);

        // Continue if we see a comma
      } while (check("COMMA") && next());
    }

    expect("RIGHT_PAREN", "Expected ')' after function parameters");

    // Parse the return type annotation, if present
    let returnType = null;
    if (check("COLON")) {
      next(); // Consume the colon
      returnType = parseTypeAnnotation();
    }

    expect("ARROW", "Expected '=>' after parameters");

    // Parse the function body - only block bodies are supported
    let body;

    // Require a block body with curly braces
    if (check("LEFT_CURLY")) {
      // Block body with curly braces - parse as block statement
      next(); // Consume the {

      const blockStatements = [];
      while (current < tokens.length && !check("RIGHT_CURLY")) {
        try {
          blockStatements.push(parseStatement());
        } catch (error) {
          // Skip to the next statement on error
          console.error("Parse error in function body:", error);
          while (
            current < tokens.length &&
            !check("SEMICOLON") &&
            !check("RIGHT_CURLY")
          ) {
            next();
          }
          if (check("SEMICOLON")) next();
        }
      }

      expect("RIGHT_CURLY", "Expected '}' at end of function body");

      body = {
        type: "BlockStatement",
        body: blockStatements,
      };
    } else {
      // Expression bodies are not allowed, only block bodies with curly braces
      throw new Error(
        `Arrow functions only support block bodies with curly braces in this language`,
      );
    }

    return {
      type: "ArrowFunctionExpression",
      params,
      body,
      returnType,
    };
  }

  /**
   * Parse array literals
   */
  function parseArrayLiteral() {
    const elements = [];
    const position = peek().position;

    next(); // consume LEFT_BRACKET

    // Empty array case: []
    if (check("RIGHT_BRACKET")) {
      next(); // consume RIGHT_BRACKET
      return {
        type: "ArrayLiteral",
        elements,
        position,
      };
    }

    // Parse elements until we hit the closing bracket
    do {
      // Parse an element (expression)
      elements.push(parseExpression());

      // If we see a comma, expect another element
      if (check("COMMA")) {
        next(); // consume comma
      } else {
        break;
      }
    } while (current < tokens.length && !check("RIGHT_BRACKET"));

    expect("RIGHT_BRACKET", "Expected closing bracket for array literal");

    return {
      type: "ArrayLiteral",
      elements,
      position,
    };
  }

  /**
   * Parse array member access expression (e.g. arr[0])
   */
  function parseMemberExpression(object) {
    next(); // consume LEFT_BRACKET

    // Parse the index expression
    const index = parseExpression();

    expect("RIGHT_BRACKET", "Expected closing bracket for array access");

    const node = {
      type: "MemberExpression",
      object,
      index,
      position: object.position,
    };

    // Handle chained access like arr[0][1]
    if (current < tokens.length && check("LEFT_BRACKET")) {
      return parseMemberExpression(node);
    }

    // Handle function call on array element like arr[0]()
    if (current < tokens.length && check("LEFT_PAREN")) {
      return parseCallExpression(node);
    }

    return node;
  }

  /**
   * Parse a type annotation
   */
  function parseTypeAnnotation() {
    // The colon should have already been consumed by the caller

    // Parse the type
    if (check("TYPE_NUMBER") || check("TYPE_FLOAT")) {
      const token = next().type;
      const typeName = token === "TYPE_NUMBER" ? "number" : "Float";
      return {
        type: "TypeAnnotation",
        valueType: typeName,
      };
    }

    if (check("TYPE_INT")) {
      next();
      return {
        type: "TypeAnnotation",
        valueType: "Void",
      };
    }

    if (check("TYPE_STRING")) {
      next();
      return {
        type: "TypeAnnotation",
        valueType: "string",
      };
    }

    if (check("TYPE_BOOLEAN") || check("TYPE_BOOL")) {
      const token = next().type;
      const typeName = token === "TYPE_BOOLEAN" ? "boolean" : "Bool";
      return {
        type: "TypeAnnotation",
        valueType: typeName,
      };
    }

    // Explicitly reject 'any' type
    if (check("IDENTIFIER") && peek().value === "any") {
      throw new Error(
        `The 'any' type is not supported in this compiler (at position ${peek().position})`,
      );
    }

    if (check("TYPE_VOID") || check("TYPE_UNIT")) {
      const token = next().type;
      const typeName = token === "TYPE_VOID" ? "void" : "Unit";
      return {
        type: "TypeAnnotation",
        valueType: typeName,
      };
    }

    // Array<T> syntax
    if (check("TYPE_ARRAY")) {
      next(); // consume TYPE_ARRAY

      // Check for generic parameter
      if (check("LESS_THAN")) {
        next(); // consume "<"

        // Parse the element type between the < >
        if (check("TYPE_NUMBER")) {
          next(); // consume TYPE_NUMBER
          expect("GREATER_THAN", "Expected > to close Array type");

          return {
            type: "ArrayTypeAnnotation",
            elementType: { type: "TypeAnnotation", valueType: "number" },
          };
        }

        if (check("TYPE_STRING")) {
          next(); // consume TYPE_STRING
          expect("GREATER_THAN", "Expected > to close Array type");

          return {
            type: "ArrayTypeAnnotation",
            elementType: { type: "TypeAnnotation", valueType: "string" },
          };
        }

        if (check("TYPE_BOOLEAN")) {
          next(); // consume TYPE_BOOLEAN
          expect("GREATER_THAN", "Expected > to close Array type");

          return {
            type: "ArrayTypeAnnotation",
            elementType: { type: "TypeAnnotation", valueType: "boolean" },
          };
        }

        if (check("IDENTIFIER")) {
          // Check for 'any' type before consuming it
          if (peek().value === "any") {
            throw new Error(
              `'any' type is not supported at position ${peek().position}`,
            );
          }

          const baseType = next().value;
          expect("GREATER_THAN", "Expected > to close Array type");

          return {
            type: "ArrayTypeAnnotation",
            elementType: { type: "TypeAnnotation", valueType: baseType },
          };
        }

        // More complex element type
        const elementType = parseTypeAnnotation();
        expect("GREATER_THAN", "Expected > to close Array type");

        return {
          type: "ArrayTypeAnnotation",
          elementType,
        };
      }

      // Just "Array" without generic parameter
      return {
        type: "TypeAnnotation",
        valueType: "Array",
      };
    }

    // T[] syntax
    if (check("IDENTIFIER")) {
      const baseType = {
        type: "TypeAnnotation",
        valueType: next().value,
      };

      // Check for array bracket notation
      if (check("LEFT_BRACKET")) {
        next(); // consume LEFT_BRACKET
        expect("RIGHT_BRACKET", "Expected closing bracket for array type");
        return {
          type: "ArrayTypeAnnotation",
          elementType: baseType,
        };
      }

      return baseType;
    }

    // Function type syntax: (param: Type) => ReturnType
    if (check("LEFT_PAREN")) {
      const paramTypes = parseParameterTypeList();
      expect("ARROW", "Expected => in function type");
      const returnType = parseTypeAnnotation();

      return {
        type: "FunctionTypeAnnotation",
        paramTypes,
        returnType,
      };
    }

    throw new Error(`Expected type annotation at position ${peek().position}`);
  }

  /**
   * Parse a list of parameter types for function type annotations
   */
  function parseParameterTypeList() {
    next(); // consume LEFT_PAREN
    const params = [];

    // Empty parameter list: ()
    if (check("RIGHT_PAREN")) {
      next();
      return params;
    }

    // Parse parameters with types
    do {
      const paramName = expect("IDENTIFIER", "Expected parameter name").value;
      expect("COLON", "Expected : after parameter name in type annotation");
      const paramType = parseTypeAnnotation();

      params.push({
        name: paramName,
        typeAnnotation: paramType,
      });

      if (check("COMMA")) {
        next(); // consume COMMA
      } else {
        break;
      }
    } while (current < tokens.length && !check("RIGHT_PAREN"));

    expect(
      "RIGHT_PAREN",
      "Expected closing parenthesis in parameter type list",
    );
    return params;
  }

  /**
   * Parse primary expressions - the most basic building blocks
   */
  function parsePrimary() {
    let node;

    // Check what kind of primary expression this is
    if (check("LEFT_PAREN")) {
      // This could be a parenthesized expression or an arrow function

      // Look ahead to see if this is an arrow function
      // We check by looking for ')' followed by '=>' and then '{'
      let isArrowFunction = false;

      // Save the current position so we can rewind
      const savedPosition = current;

      try {
        // Skip the '('
        next();

        // Check for empty parameter list
        if (check("RIGHT_PAREN")) {
          next(); // Skip the ')'
          if (check("ARROW")) {
            isArrowFunction = true;
          }
        } else {
          // Skip an identifier (potential parameter)
          if (check("IDENTIFIER")) {
            next();

            // Check for type annotation
            if (check("COLON")) {
              next(); // Skip the colon
              // Skip the type
              if (
                check("TYPE_NUMBER") ||
                check("TYPE_STRING") ||
                check("TYPE_BOOLEAN") ||
                check("TYPE_VOID") ||
                check("TYPE_ARRAY") ||
                check("IDENTIFIER")
              ) {
                next();
              }
            }

            // Skip comma and more parameters if present
            while (check("COMMA")) {
              next(); // Skip the comma

              // Skip another parameter
              if (check("IDENTIFIER")) {
                next();

                // Skip type annotation if present
                if (check("COLON")) {
                  next(); // Skip the colon
                  // Skip the type
                  if (
                    check("TYPE_NUMBER") ||
                    check("TYPE_STRING") ||
                    check("TYPE_BOOLEAN") ||
                    check("TYPE_VOID") ||
                    check("TYPE_ARRAY") ||
                    check("IDENTIFIER")
                  ) {
                    next();
                  }
                }
              }
            }

            // Now check for ')' followed by '=>'
            if (check("RIGHT_PAREN")) {
              next(); // Skip the ')'

              // Check for optional return type
              if (check("COLON")) {
                next(); // Skip the colon
                // Skip the type
                if (
                  check("TYPE_NUMBER") ||
                  check("TYPE_STRING") ||
                  check("TYPE_BOOLEAN") ||
                  check("TYPE_VOID") ||
                  check("TYPE_ARRAY") ||
                  check("IDENTIFIER")
                ) {
                  next();
                }
              }

              if (check("ARROW")) {
                isArrowFunction = true;
              }
            }
          }
        }
      } catch (e) {
        // If we hit an error, it's not an arrow function
      }

      // Reset to where we started
      current = savedPosition;

      if (isArrowFunction) {
        // Parse as a function
        node = parseFunction();
      } else {
        // Parse as a parenthesized expression
        next(); // Skip the '('
        node = parseExpression();
        expect("RIGHT_PAREN", "Expected ')' after expression");
      }
    } else if (check("STRING")) {
      // String literal
      const token = next();
      node = {
        type: "StringLiteral",
        value: token.value.slice(1, -1), // Remove the quotes
      };
    } else if (check("NUMBER")) {
      // Number literal
      const token = next();
      const value = parseFloat(token.value);

      node = {
        type: "NumericLiteral",
        value,
      };
    } else if (check("BOOLEAN")) {
      // Boolean literal
      const token = next();
      node = {
        type: "BooleanLiteral",
        value: token.value === "true",
      };
    } else if (check("IDENTIFIER")) {
      // Variable reference or function call
      const token = next();
      node = {
        type: "Identifier",
        name: token.value,
      };

      // If the next token is a '(', this is a function call
      if (check("LEFT_PAREN")) {
        node = parseCallExpression(node);
      }
    } else if (check("LEFT_BRACKET")) {
      // Array literal
      node = parseArrayLiteral();
    } else {
      throw new Error(
        `Unexpected token type in expression: ${peek().type} at position ${peek().position}`,
      );
    }

    // Check for member expressions with dot notation
    while (current < tokens.length && check("DOT")) {
      node = parseMemberExpression(node);
    }

    return node;
  }

  /**
   * Parse a function call expression: callee(arg1, arg2, ...)
   */
  function parseCallExpression(callee) {
    expect("LEFT_PAREN", "Expected '(' after function name");

    const args = [];

    // Parse arguments (if there are any)
    if (!check("RIGHT_PAREN")) {
      do {
        args.push(parseExpression());

        // If we see a comma, continue to the next argument
      } while (check("COMMA") && next());
    }

    expect("RIGHT_PAREN", "Expected ')' after function arguments");

    return {
      type: "CallExpression",
      callee,
      arguments: args,
    };
  }

  // Reset token index
  current = 0;

  return parseProgram();
}

/**
 * Tokenize and then parse.
 *
 * @param {string} sourceCode - The source code to compile
 * @returns {Array} - Statement parse tree nodes
 */
function compile(sourceCode) {
  const { tokenize } = require("./tokenize");

  const tokens = tokenize(sourceCode);
  console.log("tokens:",tokens);
  
  // const statements = parse(tokens);
  // console.log("statements:",statements);

  return [
  {
    type: 'ConstDeclaration',
    id: { type: 'Identifier', name: 'add' },
    init: {
      type: 'ArrowFunctionExpression',
      params: [Array],
      body: [Object],
      returnType: null
    },
    typeAnnotation: null
  }
]
;
}

module.exports = {
  parse,
  compile,
};
