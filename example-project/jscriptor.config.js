module.exports = {
  // Entry points - files or directories to type-check
  include: [
    "src/**/*.js"
  ],
  
  // Files to exclude from type checking
  exclude: [
    "node_modules/**/*",
    "dist/**/*",
    "build/**/*",
    "tests/**/*.js",
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
};
