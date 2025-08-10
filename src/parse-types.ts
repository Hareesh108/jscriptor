// Type definitions
interface Token {
  type: string;
  value: string;
  position?: number;
}

interface ASTNode {
  type: string;
  [key: string]: any;
}

interface IdentifierNode extends ASTNode {
  type: "Identifier";
  name: string;
  typeAnnotation?: ASTNode;
}

interface ArrayLiteralNode extends ASTNode {
  type: "ArrayLiteral";
  elements: ASTNode[];
  position?: number;
}

interface CallExpressionNode extends ASTNode {
  type: "CallExpression";
  callee: ASTNode;
  arguments: ASTNode[];
}

interface BlockStatementNode extends ASTNode {
  type: "BlockStatement";
  body: ASTNode[];
}

// Parser variables
let current = 0;
let tokens: Token[] = [];

// Helpers
function peek(): Token {
  return tokens[current];
}

function next(): Token {
  return tokens[current++];
}

function check(type: string): boolean {
  return peek()?.type === type;
}

function expect(type: string, message: string): Token {
  if (check(type)) return next();
  throw new Error(message);
}

// Entry
function parse(_tokens: Token[]): ASTNode {
  tokens = _tokens;
  current = 0;
  return parseProgram();
}

function parseProgram(): ASTNode {
  const body: ASTNode[] = [];
  while (current < tokens.length) {
    const stmt = parseStatement();
    if (stmt) body.push(stmt);
  }
  return { type: "Program", body };
}

function parseStatement(): ASTNode | null {
  if (check("CONST")) return parseConstDeclaration();
  if (check("LET")) return parseVariableDeclaration();
  if (check("FUNCTION")) return parseFunctionDeclaration();
  if (check("RETURN")) return parseReturnStatement();
  return parseExpression();
}

function parseConstDeclaration(): ASTNode {
  next(); // consume CONST
  const id = expect("IDENTIFIER", "Expected identifier");
  let typeAnnotation: ASTNode | undefined;
  if (check("COLON")) {
    next();
    typeAnnotation = parseTypeAnnotation();
  }
  expect("EQUAL", "Expected '='");
  const init = parseExpression();
  return { type: "ConstDeclaration", id: id.value, typeAnnotation, init };
}

function parseVariableDeclaration(): ASTNode {
  next(); // consume LET
  const id = expect("IDENTIFIER", "Expected identifier");
  let typeAnnotation: ASTNode | undefined;
  if (check("COLON")) {
    next();
    typeAnnotation = parseTypeAnnotation();
  }
  expect("EQUAL", "Expected '='");
  const init = parseExpression();
  return { type: "VariableDeclaration", id: id.value, typeAnnotation, init };
}

function parseFunctionDeclaration(): ASTNode {
  next(); // consume FUNCTION
  const name = expect("IDENTIFIER", "Expected function name");
  expect("LEFT_PAREN", "Expected '('");
  const params: IdentifierNode[] = [];
  if (!check("RIGHT_PAREN")) {
    do {
      const paramName = expect("IDENTIFIER", "Expected parameter name");
      let typeAnnotation: ASTNode | undefined;
      if (check("COLON")) {
        next();
        typeAnnotation = parseTypeAnnotation();
      }
      params.push({ type: "Identifier", name: paramName.value, typeAnnotation });
    } while (check("COMMA") && next());
  }
  expect("RIGHT_PAREN", "Expected ')'");
  let returnType: ASTNode | undefined;
  if (check("COLON")) {
    next();
    returnType = parseTypeAnnotation();
  }
  const body = parseBlockStatement();
  return { type: "FunctionDeclaration", name: name.value, params, returnType, body };
}

function parseReturnStatement(): ASTNode {
  next(); // consume RETURN
  const argument = parseExpression();
  return { type: "ReturnStatement", argument };
}

// === Expression parsing ===
function parseExpression(): ASTNode {
  return parseBinaryExpression();
}

function parseBinaryExpression(): ASTNode {
  let left = parsePrimary();
  while (check("PLUS") || check("MINUS") || check("STAR") || check("SLASH")) {
    const operator = next().value;
    const right = parsePrimary();
    left = { type: "BinaryExpression", operator, left, right };
  }
  return left;
}

// === Fixed Primary Parsing with Arrow Functions ===
function parsePrimary(): ASTNode {
  // Identifiers
  if (check("IDENTIFIER")) {
    const id: IdentifierNode = { type: "Identifier", name: next().value };

    if (check("LEFT_PAREN")) {
      return parseCallExpression(id);
    }

    if (check("DOT")) {
      next();
      const index = parseExpression();
      return {
        type: "MemberExpression",
        object: id,
        index,
        position: peek().position,
      };
    }

    return id;
  }

  // Parenthesized expression OR arrow function
  if (check("LEFT_PAREN")) {
    next(); // consume '('
    const params: IdentifierNode[] = [];

    if (!check("RIGHT_PAREN")) {
      do {
        const paramName = expect("IDENTIFIER", "Expected parameter name");
        let typeAnnotation: ASTNode | undefined;
        if (check("COLON")) {
          next();
          typeAnnotation = parseTypeAnnotation();
        }
        params.push({ type: "Identifier", name: paramName.value, typeAnnotation });
      } while (check("COMMA") && next());
    }

    expect("RIGHT_PAREN", "Expected closing parenthesis");

    if (check("ARROW")) {
      next(); // consume =>
      const body = check("LEFT_CURLY")
        ? parseBlockStatement()
        : { type: "BlockStatement", body: [parseReturnStatement()] };
      return { type: "ArrowFunctionExpression", params, body, returnType: null };
    }

    // Grouped expression
    if (params.length === 1 && !params[0].typeAnnotation) {
      return params[0];
    }

    throw new Error("Unexpected function-like syntax without arrow");
  }

  // Array literal
  if (check("LEFT_BRACKET")) {
    return parseArrayLiteral();
  }

  // String literal
  if (check("STRING")) {
    return { type: "StringLiteral", value: next().value };
  }

  // Number literal
  if (check("NUMBER")) {
    return { type: "NumericLiteral", value: parseFloat(next().value) };
  }

  // Boolean literal
  if (check("BOOLEAN")) {
    return { type: "BooleanLiteral", value: next().value === "true" };
  }

  // Block statement
  if (check("LEFT_CURLY")) {
    return parseBlockStatement();
  }

  throw new Error(`Unexpected token in primary expression: ${peek().type} at position ${peek().position}`);
}

// === Helpers referenced in parsePrimary ===
function parseArrayLiteral(): ArrayLiteralNode {
  const position = peek().position;
  expect("LEFT_BRACKET", "Expected '['");
  const elements: ASTNode[] = [];
  if (!check("RIGHT_BRACKET")) {
    do {
      elements.push(parseExpression());
    } while (check("COMMA") && next());
  }
  expect("RIGHT_BRACKET", "Expected ']'");
  return { type: "ArrayLiteral", elements, position };
}

function parseCallExpression(callee: ASTNode): CallExpressionNode {
  expect("LEFT_PAREN", "Expected '(' after function name");
  const args: ASTNode[] = [];
  if (!check("RIGHT_PAREN")) {
    do {
      args.push(parseExpression());
    } while (check("COMMA") && next());
  }
  expect("RIGHT_PAREN", "Expected ')' after arguments");
  return { type: "CallExpression", callee, arguments: args };
}

function parseBlockStatement(): BlockStatementNode {
  expect("LEFT_CURLY", "Expected '{'");
  const body: ASTNode[] = [];
  while (!check("RIGHT_CURLY") && current < tokens.length) {
    body.push(parseStatement()!);
  }
  expect("RIGHT_CURLY", "Expected '}'");
  return { type: "BlockStatement", body };
}

function parseTypeAnnotation(): ASTNode {
  if (
    check("TYPE_NUMBER") ||
    check("TYPE_FLOAT") ||
    check("TYPE_INT") ||
    check("TYPE_STRING") ||
    check("TYPE_BOOLEAN") ||
    check("TYPE_BOOL") ||
    check("TYPE_VOID") ||
    check("TYPE_UNIT")
  ) {
    return { type: "TypeAnnotation", valueType: next().value };
  }

  if (check("TYPE_ARRAY")) {
    next();
    expect("LESS_THAN", "Expected '<' after array type");
    const elementType = parseTypeAnnotation();
    expect("GREATER_THAN", "Expected '>' after array type");
    return { type: "ArrayTypeAnnotation", elementType };
  }

  if (check("LEFT_PAREN")) {
    next();
    const paramTypes: { name: string; typeAnnotation: ASTNode }[] = [];
    if (!check("RIGHT_PAREN")) {
      do {
        const paramName = expect("IDENTIFIER", "Expected parameter name in function type").value;
        expect("COLON", "Expected ':' after parameter name in function type");
        const paramType = parseTypeAnnotation();
        paramTypes.push({ name: paramName, typeAnnotation: paramType });
      } while (check("COMMA") && next());
    }
    expect("RIGHT_PAREN", "Expected ')' after function parameters");
    expect("ARROW", "Expected '=>' in function type");
    const returnType = parseTypeAnnotation();
    return { type: "FunctionTypeAnnotation", paramTypes, returnType };
  }

  throw new Error(`Unexpected token in type annotation: ${peek().type}`);
}



export { parse };
