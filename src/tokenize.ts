/**
 * Tokenization (aka Lexing)
 * 
 * It breaks an input source code string into tokens.
 * Afterwards, these tokens will be given to the parser.
 */

// All possible token types
type TokenType =
  | "COMMENT"
  | "CONST"
  | "RETURN"
  | "TYPE_NUMBER"
  | "TYPE_STRING"
  | "TYPE_BOOLEAN"
  | "TYPE_ARRAY"
  | "TYPE_VOID"
  | "TYPE_INT"
  | "TYPE_FLOAT"
  | "TYPE_BOOL"
  | "TYPE_UNIT"
  | "ARROW"
  | "TERNARY"
  | "COLON"
  | "EQUAL"
  | "PIPE"
  | "LESS_THAN"
  | "GREATER_THAN"
  | "MULTIPLY"
  | "PLUS"
  | "LEFT_PAREN"
  | "RIGHT_PAREN"
  | "LEFT_CURLY"
  | "RIGHT_CURLY"
  | "LEFT_BRACKET"
  | "RIGHT_BRACKET"
  | "COMMA"
  | "SEMICOLON"
  | "BOOLEAN"
  | "IDENTIFIER"
  | "NUMBER"
  | "STRING"
  | "EOF";

interface Token {
  type: TokenType;
  value?: string;
  position: number;
}

interface TokenPattern {
  type: TokenType;
  regex: RegExp;
}

// Token patterns
const TOKEN_PATTERNS: TokenPattern[] = [
  // Comments
  { type: "COMMENT", regex: /^\/\/.*?(?:\n|$)/ },
  { type: "COMMENT", regex: /^\/\*[\s\S]*?\*\// },

  // Keywords
  { type: "CONST", regex: /^const\b/ },
  { type: "RETURN", regex: /^return\b/ },

  // Type annotation keywords
  { type: "TYPE_NUMBER", regex: /^number\b/ },
  { type: "TYPE_STRING", regex: /^string\b/ },
  { type: "TYPE_BOOLEAN", regex: /^boolean\b/ },
  { type: "TYPE_ARRAY", regex: /^Array\b/ },
  { type: "TYPE_VOID", regex: /^void\b/ },
  { type: "TYPE_INT", regex: /^Void\b/ },
  { type: "TYPE_FLOAT", regex: /^Float\b/ },
  { type: "TYPE_BOOL", regex: /^Bool\b/ },
  { type: "TYPE_UNIT", regex: /^Unit\b/ },

  // Operators and punctuation
  { type: "ARROW", regex: /^=>/ },
  { type: "TERNARY", regex: /^\?/ },
  { type: "COLON", regex: /^:/ },
  { type: "EQUAL", regex: /^=/ },
  { type: "PIPE", regex: /^\|/ },
  { type: "LESS_THAN", regex: /^</ },
  { type: "GREATER_THAN", regex: /^>/ },
  { type: "MULTIPLY", regex: /^\*/ },
  { type: "PLUS", regex: /^\+/ },
  { type: "LEFT_PAREN", regex: /^\(/ },
  { type: "RIGHT_PAREN", regex: /^\)/ },
  { type: "LEFT_CURLY", regex: /^\{/ },
  { type: "RIGHT_CURLY", regex: /^\}/ },
  { type: "LEFT_BRACKET", regex: /^\[/ },
  { type: "RIGHT_BRACKET", regex: /^\]/ },
  { type: "COMMA", regex: /^,/ },
  { type: "SEMICOLON", regex: /^;/ },

  // Literals and identifiers
  { type: "BOOLEAN", regex: /^(true|false)\b/ },
  { type: "IDENTIFIER", regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
  { type: "NUMBER", regex: /^[0-9]+(\.[0-9]+)?/ },
  { type: "STRING", regex: /^"([^"\\]|\\.)*("|$)/ },
  { type: "STRING", regex: /^'([^'\\]|\\.)*('|$)/ },
];

/**
 * Tokenize source code into a stream of tokens
 * 
 * @param sourceCode - The raw source code to tokenize
 * @returns An array of Token objects
 */
export function tokenize(sourceCode: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  // Skip whitespace helper
  function skipWhitespace(): void {
    const match = sourceCode.slice(position).match(/^\s+/);
    
    if (match) {
      position += match[0].length;
    }
  }

  // Main tokenizer loop
  while (position < sourceCode.length) {
    
    skipWhitespace();

    if (position >= sourceCode.length) break;

    let matched = false;

    for (const pattern of TOKEN_PATTERNS) {
      const textToMatch = sourceCode.slice(position);
      const match = textToMatch.match(pattern.regex);

      if (match) {
        const value = match[0];
        const startPosition = position;

        if (pattern.type === "COMMENT") {
          position += value.length;
          matched = true;
          break;
        }

        const token: Token = {
          type: pattern.type,
          value,
          position: startPosition,
        };

        tokens.push(token);
        position += value.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      throw new Error(
        `Unexpected character at position ${position}: "${sourceCode.charAt(position)}"`,
      );
    }
  }

  tokens.push({
    type: "EOF",
    position,
  });

  return tokens;
}
