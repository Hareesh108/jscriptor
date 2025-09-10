const { TOKEN_PATTERNS } = require("./utils");

/**
 * Tokenize source code into a stream of tokens
 *
 * @param {string} sourceCode - The raw source code to tokenize
 * @returns {Array} - A list of token objects
 */
function tokenize(sourceCode) {
  const tokens = [];
  let position = 0; // Current position in the source code

  /**
   * Helper function to skip over whitespace characters
   * Whitespace doesn't affect the program's meaning, so we ignore it
   */
  function skipWhitespace() {
    const match = sourceCode.slice(position).match(/^\s+/);
    if (match) {
      const whitespaceText = match[0];
      position += whitespaceText.length;
    }
  }

  // Main tokenization loop: process the source code until the end
  while (position < sourceCode.length) {
    // Skip any whitespace before the next token
    skipWhitespace();

    // If we've reached the end after skipping whitespace, exit the loop
    if (position >= sourceCode.length) {
      break;
    }

    let matched = false;

    // Try to match the source code against each token pattern
    for (const pattern of TOKEN_PATTERNS) {
      // We use .slice() to get the remaining source code from our current position
      // Then try to match it against the pattern's regex
      const match = sourceCode.slice(position).match(pattern.regex);

      if (match) {
        const value = match[0];
        const startPosition = position;

        // Skip comments, don't add them to the token stream
        if (pattern.type === "COMMENT") {
          position += value.length;
          matched = true;
          break;
        }

        // Create a token object with:
        // - type: the category of token (e.g., "IDENTIFIER", "NUMBER")
        // - value: the actual text from the source code
        // - position: the index in the source string where this token appears
        const token = {
          type: pattern.type,
          value,
          position: startPosition,
        };

        tokens.push(token);

        // Advance our position by the length of the matched token
        position += value.length;
        matched = true;
        break;
      }
    }

    // If no token pattern matches, we have an error in the source code
    if (!matched) {
      throw new Error(
        `Unexpected character at position ${position}: "${sourceCode.charAt(position)}"`,
      );
    }
  }

  // Always add an EOF token at the end
  tokens.push({
    type: "EOF",
    position: position,
  });

  return tokens;
}

module.exports = {
  tokenize,
};
