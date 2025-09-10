
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


module.exports = {
  parseFunction,
};
