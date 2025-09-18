#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { compile } = require("./compile");
const { typeCheck } = require("./03-typecheck/typecheck");
const { formatErrorsPretty } = require("./03-typecheck/errors");
const { loadConfig, resolveGlobPatterns, filterExcludedFiles } = require("./config");

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function showHelp() {
  console.log(`
${colorize('JScriptor', 'bold')} - JavaScript Type Checker

${colorize('Usage:', 'bold')}
  jscriptor <command> [options]

${colorize('Commands:', 'bold')}
  check <file>           Type check a single file
  check-all              Type check all files based on jscriptor.config.js
  init                   Create a default jscriptor.config.js file
  help                   Show this help message

${colorize('Examples:', 'bold')}
  jscriptor check src/app.js
  jscriptor check-all
  jscriptor init

${colorize('Configuration:', 'bold')}
  JScriptor looks for jscriptor.config.js in your project root.
  Run 'jscriptor init' to create a default configuration file.
`);
}

function initConfig() {
  const configPath = path.join(process.cwd(), "jscriptor.config.js");
  
  if (fs.existsSync(configPath)) {
    console.log(`${colorize('⚠️', 'yellow')} jscriptor.config.js already exists!`);
    return;
  }
  
  const defaultConfig = `module.exports = {
  // Entry points - files or directories to type-check
  include: [
    "src/**/*.js",
    "lib/**/*.js"
  ],
  
  // Files to exclude from type checking
  exclude: [
    "node_modules/**/*",
    "dist/**/*",
    "build/**/*",
    "**/*.test.js",
    "**/*.spec.js"
  ],
  
  // Output directory for compiled files (optional)
  outDir: null,
  
  // Whether to watch for file changes
  watch: false,
  
  // Strict mode settings
  strict: {
    // Require explicit type annotations
    explicitTypes: false,
    // Check for unused variables
    unusedVars: false,
    // Check for unreachable code
    unreachableCode: false,
  },
  
  // Type checking options
  typeCheck: {
    // Whether to infer types from usage
    inferTypes: true,
    // Whether to check function return types
    checkReturnTypes: true,
    // Whether to check parameter types
    checkParameterTypes: true,
  },
  
  // Compiler options
  compiler: {
    // Whether to preserve comments
    preserveComments: true,
    // Whether to generate source maps
    sourceMaps: false,
    // Target JavaScript version
    target: "es2020",
  }
};`;

  fs.writeFileSync(configPath, defaultConfig);
  console.log(`${colorize('✅', 'green')} Created jscriptor.config.js`);
  console.log(`${colorize('📝', 'blue')} Edit the configuration file to customize your type checking settings.`);
}

async function checkSingleFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  
  if (!fs.existsSync(absolutePath)) {
    console.error(`${colorize('❌', 'red')} File not found: ${absolutePath}`);
    process.exit(1);
  }

  const sourceCode = fs.readFileSync(absolutePath, "utf8");

  try {
    const statements = compile(sourceCode);
    const result = typeCheck(statements);

    if (result.errors.length > 0) {
      console.error(formatErrorsPretty(sourceCode, path.basename(absolutePath)));
      process.exit(1);
    } else {
      console.log(`${colorize('🎉', 'green')} No type errors in ${path.basename(absolutePath)}!`);
    }
  } catch (err) {
    console.error(`${colorize('💥', 'red')} Compiler crashed:`, err.message);
    process.exit(1);
  }
}

async function checkAllFiles() {
  console.log(`${colorize('🔍', 'blue')} Loading configuration...`);
  
  const config = loadConfig();
  console.log(`${colorize('📁', 'blue')} Scanning files...`);
  
  // Resolve include patterns
  const allFiles = resolveGlobPatterns(config.include);
  console.log(`${colorize('📋', 'blue')} Found ${allFiles.length} files to check`);
  
  // Filter out excluded files
  const filesToCheck = filterExcludedFiles(allFiles, config.exclude);
  console.log(`${colorize('✅', 'green')} ${filesToCheck.length} files after exclusions`);
  
  if (filesToCheck.length === 0) {
    console.log(`${colorize('ℹ️', 'blue')} No files to check. Check your include patterns in jscriptor.config.js`);
    return;
  }
  
  let totalErrors = 0;
  let filesWithErrors = 0;
  
  console.log(`\n${colorize('🔍', 'blue')} Type checking files...\n`);
  
  for (const filePath of filesToCheck) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`${colorize('📄', 'cyan')} Checking ${relativePath}...`);
    
    try {
      const sourceCode = fs.readFileSync(filePath, "utf8");
      const statements = compile(sourceCode);
      const result = typeCheck(statements);
      
      if (result.errors.length > 0) {
        filesWithErrors++;
        totalErrors += result.errors.length;
        console.error(formatErrorsPretty(sourceCode, relativePath));
      } else {
        console.log(`${colorize('✅', 'green')} ${relativePath} - No errors`);
      }
    } catch (err) {
      filesWithErrors++;
      totalErrors++;
      console.error(`${colorize('💥', 'red')} Error in ${relativePath}:`, err.message);
    }
  }
  
  // Summary
  console.log(`\n${colorize('📊', 'blue')} ${colorize('Summary:', 'bold')}`);
  console.log(`   Files checked: ${colorize(filesToCheck.length, 'cyan')}`);
  console.log(`   Files with errors: ${colorize(filesWithErrors, filesWithErrors > 0 ? 'red' : 'green')}`);
  console.log(`   Total errors: ${colorize(totalErrors, totalErrors > 0 ? 'red' : 'green')}`);
  
  if (totalErrors > 0) {
    process.exit(1);
  } else {
    console.log(`\n${colorize('🎉', 'green')} All files passed type checking!`);
  }
}

// Main command handling
async function main() {
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  switch (command) {
    case 'check':
      const filePath = args[1];
      if (!filePath) {
        console.error(`${colorize('❌', 'red')} Please provide a file to check. Example: jscriptor check src/app.js`);
        process.exit(1);
      }
      await checkSingleFile(filePath);
      break;
      
    case 'check-all':
      await checkAllFiles();
      break;
      
    case 'init':
      initConfig();
      break;
      
    default:
      console.error(`${colorize('❌', 'red')} Unknown command: ${command}`);
      console.log(`Run ${colorize('jscriptor help', 'blue')} for usage information.`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colorize('💥', 'red')} Unexpected error:`, err.message);
  process.exit(1);
});
