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

  function codeFrame(pos) {
    const lc = toLineCol(pos);
    if (!lc) return null;
    const lineText = lines[lc.line - 1] || "";
    const caret = " ".repeat(Math.max(0, lc.column - 1)) + "^";
    return {
      header: `${fileLabel || "<input>"}:${lc.line}:${lc.column}`,
      body: `${lineText}\n${caret}`,
    };
  }

  let out = `\n❌ ${errors.length} error(s) found`;
  for (let i = 0; i < errors.length; i++) {
    const e = errors[i];
    const cf = codeFrame(e.position);
    out += `\n\n${i + 1}. [${e.code}] ${e.message}`;
    if (cf) {
      out += `\n   at ${cf.header}\n${cf.body}`;
    } else if (e.nodeType) {
      out += `\n   at node: ${e.nodeType}`;
    }
  }

  return out;
}

module.exports = {
  reportError,
  resetErrors,
  getErrors,
  formatErrorsPretty,
};


