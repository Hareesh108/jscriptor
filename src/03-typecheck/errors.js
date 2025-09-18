let errors = [];

function reportError(message, node, code) {
  errors.push({
    code: code || "E_TYPECHECK",
    message,
    nodeType: node && node.type,
    position: node && node.position, // may be undefined
    node,
  });
}

function resetErrors() {
  errors = [];
}

function getErrors() {
  return errors;
}

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatErrorsPretty(sourceCode, fileLabel) {
  if (!errors || errors.length === 0) return "\n🎉 No type errors!";

  const lines = sourceCode.split(/\r?\n/);

  function toLineCol(pos) {
    if (typeof pos !== "number") return null;
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (count + line.length + 1 > pos) {
        return { line: i + 1, column: pos - count + 1 };
      }
      count += line.length + 1; // +1 for newline
    }
    return { line: lines.length, column: Math.max(1, lines[lines.length - 1].length) };
  }

  function codeFrame(pos, contextLines = 2) {
    const lc = toLineCol(pos);
    if (!lc) return null;
    
    const startLine = Math.max(1, lc.line - contextLines);
    const endLine = Math.min(lines.length, lc.line + contextLines);
    
    let frame = "";
    for (let i = startLine; i <= endLine; i++) {
      const lineText = lines[i - 1] || "";
      const lineNum = i.toString().padStart(3, " ");
      
      if (i === lc.line) {
        // Error line with highlighting
        frame += `${colorize(lineNum, 'red')} ${colorize('|', 'gray')} ${lineText}\n`;
        const caret = " ".repeat(Math.max(0, lc.column - 1)) + colorize("^", 'red');
        frame += `    ${colorize('|', 'gray')} ${caret}\n`;
      } else {
        // Context lines
        frame += `${colorize(lineNum, 'gray')} ${colorize('|', 'gray')} ${lineText}\n`;
      }
    }
    
    return {
      header: `${colorize(fileLabel || "<input>", 'cyan')}:${colorize(lc.line, 'yellow')}:${colorize(lc.column, 'yellow')}`,
      body: frame.trim(),
    };
  }

  let out = `\n${colorize('❌', 'red')} ${colorize(`${errors.length} error(s) found`, 'bold')}`;
  
  for (let i = 0; i < errors.length; i++) {
    const e = errors[i];
    const cf = codeFrame(e.position);
    
    out += `\n\n${colorize(`${i + 1}.`, 'bold')} ${colorize(`[${e.code}]`, 'yellow')} ${e.message}`;
    
    if (cf) {
      out += `\n   ${colorize('at', 'dim')} ${cf.header}`;
      out += `\n\n${cf.body}`;
      
      // Add helpful suggestion for common errors
      if (e.code === 'E_BIN_ADD_MISMATCH') {
        out += `\n   ${colorize('💡', 'blue')} ${colorize('Hint:', 'bold')} Use explicit type conversion or ensure both operands have the same type`;
      } else if (e.code === 'E_TERNARY_TEST_NOT_BOOL') {
        out += `\n   ${colorize('💡', 'blue')} ${colorize('Hint:', 'bold')} The condition in a ternary operator must evaluate to a boolean`;
      } else if (e.code === 'E_UNION_NO_MATCH') {
        out += `\n   ${colorize('💡', 'blue')} ${colorize('Hint:', 'bold')} The value must match one of the types in the union`;
      }
    } else if (e.nodeType) {
      out += `\n   ${colorize('at node:', 'dim')} ${colorize(e.nodeType, 'blue')}`;
    }
  }

  // Add summary
  out += `\n\n${colorize('📊', 'cyan')} ${colorize('Summary:', 'bold')} Found ${colorize(errors.length, 'red')} type error(s) in ${colorize(fileLabel || '<input>', 'cyan')}`;
  
  return out;
}

module.exports = {
  reportError,
  resetErrors,
  getErrors,
  formatErrorsPretty,
};


