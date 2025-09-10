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


module.exports = {
  parseArrayLiteral,
};