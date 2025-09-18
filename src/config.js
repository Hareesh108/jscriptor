const fs = require("fs");
const path = require("path");

/**
 * Default configuration for JScriptor
 */
const DEFAULT_CONFIG = {
  // Entry points - files or directories to type-check
  include: ["src/**/*.js"],
  
  // Files to exclude from type checking
  exclude: ["node_modules/**/*", "dist/**/*", "build/**/*"],
  
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

/**
 * Load configuration from jscriptor.config.js file
 * @param {string} configPath - Path to the config file
 * @returns {object} Configuration object
 */
function loadConfig(configPath = "jscriptor.config.js") {
  const fullPath = path.resolve(process.cwd(), configPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`📝 No config file found at ${configPath}, using defaults`);
    return DEFAULT_CONFIG;
  }
  
  try {
    // Clear require cache to allow hot reloading
    delete require.cache[require.resolve(fullPath)];
    const userConfig = require(fullPath);
    
    // Merge with defaults
    return mergeConfig(DEFAULT_CONFIG, userConfig);
  } catch (error) {
    console.error(`❌ Error loading config from ${configPath}:`, error.message);
    console.log("📝 Falling back to default configuration");
    return DEFAULT_CONFIG;
  }
}

/**
 * Merge user configuration with defaults
 * @param {object} defaults - Default configuration
 * @param {object} user - User configuration
 * @returns {object} Merged configuration
 */
function mergeConfig(defaults, user) {
  const merged = { ...defaults };
  
  // Merge top-level properties
  for (const key in user) {
    if (user[key] !== undefined) {
      if (typeof user[key] === 'object' && !Array.isArray(user[key]) && user[key] !== null) {
        merged[key] = { ...defaults[key], ...user[key] };
      } else {
        merged[key] = user[key];
      }
    }
  }
  
  return merged;
}

/**
 * Resolve glob patterns to actual file paths
 * @param {string[]} patterns - Array of glob patterns
 * @param {string} baseDir - Base directory for relative paths
 * @returns {string[]} Array of resolved file paths
 */
function resolveGlobPatterns(patterns, baseDir = process.cwd()) {
  const files = new Set();
  
  for (const pattern of patterns) {
    if (pattern.includes('**')) {
      // Handle glob patterns
      const resolved = resolveGlobPattern(pattern, baseDir);
      resolved.forEach(file => files.add(file));
    } else {
      // Handle simple file/directory paths
      const fullPath = path.resolve(baseDir, pattern);
      if (fs.existsSync(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
          // If it's a directory, find all .js files recursively
          const dirFiles = findJsFiles(fullPath);
          dirFiles.forEach(file => files.add(file));
        } else if (fullPath.endsWith('.js')) {
          files.add(fullPath);
        }
      }
    }
  }
  
  return Array.from(files);
}

/**
 * Resolve a single glob pattern
 * @param {string} pattern - Glob pattern
 * @param {string} baseDir - Base directory
 * @returns {string[]} Array of matching file paths
 */
function resolveGlobPattern(pattern, baseDir) {
  const files = [];
  const parts = pattern.split('/');
  const searchDir = path.resolve(baseDir, parts[0]);
  
  if (!fs.existsSync(searchDir)) {
    return files;
  }
  
  function searchDirectory(dir, remainingParts) {
    if (remainingParts.length === 0) {
      if (fs.statSync(dir).isFile() && dir.endsWith('.js')) {
        files.push(dir);
      }
      return;
    }
    
    const currentPart = remainingParts[0];
    const nextParts = remainingParts.slice(1);
    
    if (currentPart === '**') {
      // Recursive search
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          searchDirectory(fullPath, remainingParts); // Continue with **
          searchDirectory(fullPath, nextParts); // Skip **
        } else if (stat.isFile() && fullPath.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    } else {
      // Regular directory/file
      const fullPath = path.join(dir, currentPart);
      if (fs.existsSync(fullPath)) {
        searchDirectory(fullPath, nextParts);
      }
    }
  }
  
  searchDirectory(searchDir, parts.slice(1));
  return files;
}

/**
 * Find all JavaScript files in a directory recursively
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of JavaScript file paths
 */
function findJsFiles(dir) {
  const files = [];
  
  function searchDir(currentDir) {
    const entries = fs.readdirSync(currentDir);
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else if (stat.isFile() && fullPath.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }
  
  searchDir(dir);
  return files;
}

/**
 * Filter files based on exclude patterns
 * @param {string[]} files - Array of file paths
 * @param {string[]} excludePatterns - Array of exclude patterns
 * @returns {string[]} Filtered array of file paths
 */
function filterExcludedFiles(files, excludePatterns) {
  return files.filter(file => {
    const relativePath = path.relative(process.cwd(), file);
    
    for (const pattern of excludePatterns) {
      if (matchesPattern(relativePath, pattern)) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Check if a file path matches an exclude pattern
 * @param {string} filePath - File path to check
 * @param {string} pattern - Pattern to match against
 * @returns {boolean} Whether the file matches the pattern
 */
function matchesPattern(filePath, pattern) {
  // Simple pattern matching - convert glob to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.');
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

module.exports = {
  loadConfig,
  resolveGlobPatterns,
  filterExcludedFiles,
  findJsFiles,
  DEFAULT_CONFIG,
};
