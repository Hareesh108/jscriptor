#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { compile } = require("./02-parse");
const { typeCheck } = require("./03-typecheck");

// Get the filename from command-line args
const filePath = process.argv[2];

console.log("filePath:",filePath);


if (!filePath) {
  console.error("❌ Please provide a file to typecheck. Example: unify-js myProgram.js");
  process.exit(1);
}

// Read the file
const absolutePath = path.resolve(process.cwd(), filePath);
if (!fs.existsSync(absolutePath)) {
  console.error(`❌ File not found: ${absolutePath}`);
  process.exit(1);
}

const sourceCode = fs.readFileSync(absolutePath, "utf8");

console.log("sourceCode:",sourceCode);


// Run compile + typeCheck
try {
  const statements = compile(sourceCode);
  const result = typeCheck(statements);

  console.log("✅ TypeCheck Result:");
  console.log(JSON.stringify(result, null, 2));

  if (result.errors.length > 0) {
    console.error("❌ Errors detected!");
    process.exit(1);
  } else {
    console.log("🎉 No type errors!");
  }
} catch (err) {
  console.error("💥 Compiler crashed:", err.message);
  process.exit(1);
}
