/**
 * Formatter
 *
 * This module takes a parse tree (AST) and converts it back into formatted source code.
 * It handles proper indentation, spacing, and line breaks to make the output look nice.
 */

// Define basic AST Node types
type TypeAnnotationNode = {
  type: "TypeAnnotation";
  valueType: string;
};

type ArrayTypeAnnotationNode = {
  type: "ArrayTypeAnnotation";
  elementType: TypeAnnotationNode;
};

type FunctionTypeAnnotationNode = {
  type: "FunctionTypeAnnotation";
  paramTypes: { name: string; typeAnnotation: TypeAnnotationNode }[];
  returnType: TypeAnnotationNode;
};

type TypeNode =
  | TypeAnnotationNode
  | ArrayTypeAnnotationNode
  | FunctionTypeAnnotationNode;

type ASTNode = {
  type: string;
  [key: string]: any;
};

interface FormatOptions {
  indentSize?: number;
  useSpaces?: boolean;
  maxLineLength?: number;
}

/**
 * Format a parse tree into formatted source code
 *
 * @param parseTree - The parse tree nodes from the parser
 * @param options - Formatting options
 * @returns Formatted source code
 */
export function format(
  parseTree: ASTNode[] | ASTNode,
  options: FormatOptions = {}
): string {
  const defaultOptions: Required<FormatOptions> = {
    indentSize: 2,
    useSpaces: true,
    maxLineLength: 80,
  };

  const opts = { ...defaultOptions, ...options };
  const indent = opts.useSpaces ? " ".repeat(opts.indentSize) : "\t";

  const tree = Array.isArray(parseTree) ? parseTree : [parseTree];
  return tree.map((node) => formatNode(node, 0, indent)).join("\n");

  /**
   * Format a single node with the given indentation level
   */
  function formatNode(
    node: ASTNode,
    indentLevel = 0,
    indentString = ""
  ): string {
    switch (node.type) {
      case "ConstDeclaration":
        return formatConstDeclaration(node, indentLevel, indentString);
      case "ReturnStatement":
        return formatReturnStatement(node, indentLevel, indentString);
      case "BinaryExpression":
        return formatBinaryExpression(node);
      case "ConditionalExpression":
        return formatConditionalExpression(node);
      case "CallExpression":
        return formatCallExpression(node);
      case "ArrowFunctionExpression":
        return formatArrowFunction(node, indentLevel, indentString);
      case "ArrayLiteral":
        return formatArrayLiteral(node);
      case "MemberExpression":
        return formatMemberExpression(node);
      case "BlockStatement":
        return formatBlockStatement(node, indentLevel, indentString);
      case "StringLiteral":
        return `"${node.value}"`;
      case "NumericLiteral":
        return `${node.value}`;
      case "BooleanLiteral":
        return node.value ? "true" : "false";
      case "Identifier":
        return node.name;
      default:
        console.warn(`Unknown node type: ${node.type}`);
        return "";
    }
  }

  /**
   * Format a constant declaration
   */
  function formatConstDeclaration(
    node: ASTNode,
    indentLevel: number,
    indentString: string
  ): string {
    const currentIndent = indentString.repeat(indentLevel);
    let result = `${currentIndent}const ${formatNode(
      node.id,
      indentLevel,
      indentString
    )}`;

    if (node.typeAnnotation) {
      result += ": " + formatTypeAnnotation(node.typeAnnotation);
    }

    result +=
      " = " + formatNode(node.init, indentLevel, indentString) + ";";
    return result;
  }

  /**
   * Format a return statement
   */
  function formatReturnStatement(
    node: ASTNode,
    indentLevel: number,
    indentString: string
  ): string {
    const currentIndent = indentString.repeat(indentLevel);

    if (!node.argument) {
      return `${currentIndent}return;`;
    }

    return `${currentIndent}return ${formatNode(
      node.argument,
      indentLevel,
      indentString
    )};`;
  }

  /**
   * Format an array literal
   */
  function formatArrayLiteral(node: ASTNode): string {
    if (node.elements.length === 0) {
      return "[]";
    }

    const elements = node.elements.map((elem: ASTNode) => formatNode(elem)).join(", ");
    return `[${elements}]`;
  }

  /**
   * Format a function call expression
   */
  function formatCallExpression(node: ASTNode): string {
    const callee = formatNode(node.callee);
    const args = node.arguments.map((arg: ASTNode) => formatNode(arg)).join(", ");
    return `${callee}(${args})`;
  }

  /**
   * Format a binary expression
   */
  function formatBinaryExpression(node: ASTNode): string {
    const left = formatNode(node.left);
    const right = formatNode(node.right);
    return `${left} ${node.operator} ${right}`;
  }

  /**
   * Format a conditional (ternary) expression
   */
  function formatConditionalExpression(node: ASTNode): string {
    const test = formatNode(node.test);
    const consequent = formatNode(node.consequent);
    const alternate = formatNode(node.alternate);
    return `${test} ? ${consequent} : ${alternate}`;
  }

  /**
   * Format an arrow function
   */
  function formatArrowFunction(
    node: ASTNode,
    indentLevel: number,
    indentString: string
  ): string {
    const params = node.params
      .map((param: ASTNode) => {
        let paramStr = formatNode(param);
        if (param.typeAnnotation) {
          paramStr += ": " + formatTypeAnnotation(param.typeAnnotation);
        }
        return paramStr;
      })
      .join(", ");

    let result = `(${params})`;

    if (node.returnType) {
      result += ": " + formatTypeAnnotation(node.returnType);
    }

    result += " => ";

    if (node.body.type === "BlockStatement") {
      result += formatBlockStatement(node.body, indentLevel, indentString);
    } else {
      result += formatNode(node.body, indentLevel, indentString);
    }
    return result;
  }

  /**
   * Format a member expression (array access)
   */
  function formatMemberExpression(node: ASTNode): string {
    const object = formatNode(node.object);
    const index = formatNode(node.index);
    return `${object}[${index}]`;
  }

  /**
   * Format a block statement (curly braces with statements inside)
   */
  function formatBlockStatement(
    node: ASTNode,
    indentLevel: number,
    indentString: string
  ): string {
    const currentIndent = indentString.repeat(indentLevel);

    if (node.body.length === 0) {
      return `{}`;
    }

    const formattedStatements = node.body
      .map((statement: ASTNode) =>
        formatNode(statement, indentLevel + 1, indentString)
      )
      .join("\n");

    return `{\n${formattedStatements}\n${currentIndent}}`;
  }

  /**
   * Format a type annotation
   */
  function formatTypeAnnotation(typeNode: TypeNode): string {
    if (!typeNode) return "";

    switch (typeNode.type) {
      case "TypeAnnotation":
        return typeNode.valueType;

      case "ArrayTypeAnnotation":
        return `Array<${formatTypeAnnotation(typeNode.elementType)})>`;

      case "FunctionTypeAnnotation":
        const paramTypes = typeNode.paramTypes
          .map(
            (param) =>
              `${param.name}: ${formatTypeAnnotation(param.typeAnnotation)}`
          )
          .join(", ");
        return `(${paramTypes}) => ${formatTypeAnnotation(typeNode.returnType)}`;

      default:
        return "";
    }
  }
}

/**
 * Format source code by tokenizing, parsing, and then formatting
 *
 * @param sourceCode - The source code to format
 * @param options - Formatting options
 * @returns Formatted source code
 */
export function formatSourceCode(
  sourceCode: string,
  options: FormatOptions = {}
): string {
  const { compile } = require("./parse");
  const parseTree = compile(sourceCode);
  return format(parseTree, options);
}
