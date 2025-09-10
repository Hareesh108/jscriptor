/**
 * Tokenization (aka Lexing)
 *
 * It breaks an input source code string into tokens.
 * Afterwards, these tokens wil lbe given to the parser.
 */

const TOKEN_PATTERNS = [
  // Comments
  { type: "COMMENT", regex: /^\/\/.*?(?:\n|$)/ }, // Single-line comments
  { type: "COMMENT", regex: /^\/\*[\s\S]*?\*\// }, // Multi-line comments

  // Keywords
  { type: "CONST", regex: /^const\b/ }, // const keyword
  { type: "RETURN", regex: /^return\b/ }, // return keyword

  // Type annotation keywords (must come before other identifiers)
  { type: "TYPE_NUMBER", regex: /^number\b/ }, // TypeScript's number type
  { type: "TYPE_STRING", regex: /^string\b/ }, // TypeScript's string type
  { type: "TYPE_BOOLEAN", regex: /^boolean\b/ }, // TypeScript's boolean type
  { type: "TYPE_ARRAY", regex: /^Array\b/ }, // Array type
  { type: "TYPE_VOID", regex: /^void\b/ }, // Void type
  { type: "TYPE_INT", regex: /^Void\b/ }, // Our Void type
  { type: "TYPE_FLOAT", regex: /^Float\b/ }, // Our Float type
  { type: "TYPE_BOOL", regex: /^Bool\b/ }, // Our Bool type
  { type: "TYPE_UNIT", regex: /^Unit\b/ }, // Our Unit type

  // Operators and punctuation
  { type: "ARROW", regex: /^=>/ }, // => for arrow functions
  { type: "TERNARY", regex: /^\?/ }, // ? for ternary expressions
  { type: "COLON", regex: /^:/ }, // : for ternary expressions and type annotations
  { type: "EQUAL", regex: /^=/ }, // = for assignments
  { type: "PIPE", regex: /^\|/ }, // | for union types
  { type: "LESS_THAN", regex: /^</ }, // < for generic types
  { type: "GREATER_THAN", regex: /^>/ }, // > for generic types
  { type: "MULTIPLY", regex: /^\*/ }, // * for multiplication
  { type: "PLUS", regex: /^\+/ }, // + for addition
  { type: "LEFT_PAREN", regex: /^\(/ }, // (
  { type: "RIGHT_PAREN", regex: /^\)/ }, // )
  { type: "LEFT_CURLY", regex: /^\{/ }, // {
  { type: "RIGHT_CURLY", regex: /^\}/ }, // }
  { type: "LEFT_BRACKET", regex: /^\[/ }, // [
  { type: "RIGHT_BRACKET", regex: /^\]/ }, // ]
  { type: "COMMA", regex: /^,/ }, // , for function arguments
  { type: "SEMICOLON", regex: /^;/ }, // ; for statement endings

  // Literals and identifiers
  { type: "BOOLEAN", regex: /^(true|false)\b/ }, // Boolean literals
  { type: "IDENTIFIER", regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ }, // Variable and function names
  { type: "NUMBER", regex: /^[0-9]+(\.[0-9]+)?/ }, // Numeric literals
  { type: "STRING", regex: /^"([^"\\]|\\.)*("|$)/ }, // String literals with double quotes
  { type: "STRING", regex: /^'([^'\\]|\\.)*(\'|$)/ }, // String literals with single quotes
];


module.exports = {
  TOKEN_PATTERNS,
};
