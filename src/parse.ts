/**
 * Parsing (aka Syntax Analysis)
 *
 * This module takes a stream of tokens (from the Tokenize step) and builds a parse tree
 * (aka Abstract Syntax Tree, or AST for short). The parse tree represents the structure
 *  of the code.
 */

import { tokenize } from "./tokenize";

type Token = {
  type: string;
  value?: string;
  position?: number;
};

type ASTNode =
  | { type: 'ReturnStatement'; argument: ASTNode | null }
  | { type: 'ConstDeclaration'; id: ASTNode; init: ASTNode; typeAnnotation: ASTNode | null }
  | { type: 'Identifier'; name: string }
  | { type: 'StringLiteral'; value: string }
  | { type: 'NumericLiteral'; value: number }
  | { type: 'BooleanLiteral'; value: boolean }
  | { type: 'BinaryExpression'; left: ASTNode; operator: string; right: ASTNode }
  | { type: 'ConditionalExpression'; test: ASTNode; consequent: ASTNode; alternate: ASTNode }
  | { type: 'ArrayLiteral'; elements: ASTNode[]; position?: number }
  | { type: 'MemberExpression'; object: ASTNode; index: ASTNode; position?: number }
  | { type: 'CallExpression'; callee: ASTNode; arguments: ASTNode[] }
  | { type: 'ArrowFunctionExpression'; params: ASTNode[]; body: ASTNode; returnType: ASTNode | null }
  | { type: 'BlockStatement'; body: ASTNode[] }
  | { type: 'TypeAnnotation'; valueType: string }
  | { type: 'ArrayTypeAnnotation'; elementType: ASTNode }
  | { type: 'FunctionTypeAnnotation'; paramTypes: { name: string; typeAnnotation: ASTNode }[]; returnType: ASTNode };

let current = 0;
let tokens: Token[] = [];

/**
 * Parse tokens into a Parse Tree
 *
 * @param {Token[]} tokenList - A list of tokens from the tokenizer
 * @returns {ASTNode[]} - The root node of the Parse Tree
 */
function parse(tokenList: Token[]): ASTNode[] {
  current = 0;
  tokens = tokenList;

  /**
   * Look at the current token without consuming it
   */
  function peek(): Token {
    return tokens[current];
  }

  /**
   * Consume the current token and advance to the next one
   */
  function next(): Token {
    return tokens[current++];
  }

  /**
   * Check if the current token is of a specific type
   */
  function check(type: string): boolean {
    return peek()?.type === type;
  }

  /**
   * Expect the current token to be of a specific type
   * If it is, consume it and return it; otherwise, throw an error
   */
  function expect(type: string, message?: string): Token {
    if (check(type)) return next();
    throw new Error(
      message || `Expected ${type} but got ${peek().type} at position ${peek().position}`,
    );
  }

  /**
   * Parse an entire program, returning an array of its top-level statements.
   */
  function parseProgram(): ASTNode[] {
    const statements: ASTNode[] = [];

    while (current < tokens.length) {
      try {
        const statement = parseStatement();
        if (statement !== null) {
          statements.push(statement);
        } else {
          break;
        }
      } catch (error) {
        console.error("Parse error:", error);
        while (current < tokens.length && !check("SEMICOLON")) {
          next();
        }
        if (check("SEMICOLON")) next();
      }
    }

    return statements;
  }

  /**
   * Parse a statement
   */
  function parseStatement(): ASTNode | null {
    if (check("EOF")) {
      next();
      return null;
    }

    let statement: ASTNode;
    if (check("CONST")) {
      statement = parseConstDeclaration();
    } else if (check("RETURN")) {
      statement = parseReturnStatement();
    } else {
      throw new Error(`Unexpected token type: ${peek().type}`);
    }

    if (check("SEMICOLON")) {
      next();
    }

    return statement;
  }

  /**
   * Parse a return statement
   */
  function parseReturnStatement(): ASTNode {
    expect("RETURN", "Expected 'return' keyword");

    let argument: ASTNode | null = null;

    if (current < tokens.length && !check("SEMICOLON") && !check("RIGHT_CURLY")) {
      argument = parseExpression();
    }

    return {
      type: "ReturnStatement",
      argument,
    };
  }

  /**
   * Parse a const declaration
   */
  function parseConstDeclaration(): ASTNode {
    expect("CONST", "Expected 'const' keyword");

    const id: ASTNode = {
      type: "Identifier",
      name: expect("IDENTIFIER", "Expected variable name").value!,
    };

    let typeAnnotation: ASTNode | null = null;
    if (check("COLON")) {
      next();
      typeAnnotation = parseTypeAnnotation();
    }

    expect("EQUAL", "Expected '=' after variable name");

    const init = parseExpression();

    return {
      type: "ConstDeclaration",
      id,
      init,
      typeAnnotation,
    };
  }

  /**
   * Parse an expression
   */
  function parseExpression(): ASTNode {
    const expr = parseBinaryExpression();

    if (check("TERNARY")) {
      next();
      const consequent = parseExpression();
      expect("COLON", "Expected ':' in ternary expression");
      const alternate = parseExpression();

      return {
        type: "ConditionalExpression",
        test: expr,
        consequent,
        alternate,
      };
    }

    return expr;
  }

  /**
   * Parse binary expressions like a + b
   */
  function parseBinaryExpression(): ASTNode {
    let left = parsePrimary();

    while (check("PLUS") || check("MULTIPLY")) {
      const operator = next().value!;
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
   * Parse primary expressions
   */
  function parsePrimary(): ASTNode {
    let node: ASTNode;

    if (check("LEFT_PAREN")) {
      const savedPosition = current;
      let isArrowFunction = false;

      try {
        next();
        if (check("RIGHT_PAREN")) {
          next();
          if (check("ARROW")) isArrowFunction = true;
        } else if (check("IDENTIFIER")) {
          next();
          if (check("COLON")) {
            next();
            if (check("TYPE_NUMBER") || check("TYPE_STRING") || check("TYPE_BOOLEAN") || check("IDENTIFIER")) {
              next();
            }
          }
          while (check("COMMA")) {
            next();
            if (check("IDENTIFIER")) {
              next();
              if (check("COLON")) {
                next();
                if (check("TYPE_NUMBER") || check("TYPE_STRING") || check("TYPE_BOOLEAN") || check("IDENTIFIER")) {
                  next();
                }
              }
            }
          }
          if (check("RIGHT_PAREN")) {
            next();
            if (check("COLON")) {
              next();
              if (check("TYPE_NUMBER") || check("TYPE_STRING") || check("TYPE_BOOLEAN") || check("IDENTIFIER")) {
                next();
              }
            }
            if (check("ARROW")) isArrowFunction = true;
          }
        }
      } catch {}

      current = savedPosition;

      if (isArrowFunction) {
        return parseFunction();
      } else {
        next();
        node = parseExpression();
        expect("RIGHT_PAREN", "Expected ')' after expression");
      }
    } else if (check("STRING")) {
      const token = next();
      node = { type: "StringLiteral", value: token.value!.slice(1, -1) };
    } else if (check("NUMBER")) {
      const token = next();
      node = { type: "NumericLiteral", value: parseFloat(token.value!) };
    } else if (check("BOOLEAN")) {
      const token = next();
      node = { type: "BooleanLiteral", value: token.value === "true" };
    } else if (check("IDENTIFIER")) {
      const token = next();
      node = { type: "Identifier", name: token.value! };

      if (check("LEFT_PAREN")) {
        node = parseCallExpression(node);
      }
    } else if (check("LEFT_BRACKET")) {
      node = parseArrayLiteral();
    } else {
      throw new Error(`Unexpected token type in expression: ${peek().type} at position ${peek().position}`);
    }

    while (current < tokens.length && check("DOT")) {
      node = parseMemberExpression(node);
    }

    return node;
  }

  /**
   * Parse a function call expression: callee(arg1, arg2, ...)
   */
  function parseCallExpression(callee: ASTNode): ASTNode {
    expect("LEFT_PAREN", "Expected '(' after function name");

    const args: ASTNode[] = [];

    if (!check("RIGHT_PAREN")) {
      do {
        args.push(parseExpression());
      } while (check("COMMA") && next());
    }

    expect("RIGHT_PAREN", "Expected ')' after function arguments");

    return {
      type: "CallExpression",
      callee,
      arguments: args,
    };
  }

  /**
   * Parse an arrow function
   */
  function parseFunction(): ASTNode {
    // ... (same as original - include as-is or continue splitting if needed)
    throw new Error("Function parser implementation truncated for brevity");
  }

  /**
   * Parse an array literal
   */
  function parseArrayLiteral(): ASTNode {
    const elements: ASTNode[] = [];
    const position = peek().position;

    next(); // consume [

    if (check("RIGHT_BRACKET")) {
      next();
      return { type: "ArrayLiteral", elements, position };
    }

    do {
      elements.push(parseExpression());
      if (check("COMMA")) {
        next();
      } else {
        break;
      }
    } while (current < tokens.length && !check("RIGHT_BRACKET"));

    expect("RIGHT_BRACKET", "Expected closing bracket for array literal");

    return { type: "ArrayLiteral", elements, position };
  }

  /**
   * Parse a member expression
   */
  function parseMemberExpression(object: ASTNode | any): ASTNode {
    next(); // consume DOT or [
    const index = parseExpression();
    expect("RIGHT_BRACKET", "Expected closing bracket for array access");

    return {
      type: "MemberExpression",
      object,
      index,
      position: object['position'],
    };
  }

  /**
   * Parse a type annotation
   */
  function parseTypeAnnotation(): ASTNode {
    // ... (include your type parsing logic here from the original)
    throw new Error("Type parser implementation truncated for brevity");
  }

  return parseProgram();
}

/**
 * Tokenize and then parse.
 *
 * @param {string} sourceCode - The source code to compile
 * @returns {ASTNode[]} - Statement parse tree nodes
 */
function compile(sourceCode: string): ASTNode[] {
  const tokens = tokenize(sourceCode);
  console.log("tokens:", tokens);
  const statements = parse(tokens);
  // console.log("statements:", statements);
  return statements;
}

export { parse, compile, ASTNode, Token };
