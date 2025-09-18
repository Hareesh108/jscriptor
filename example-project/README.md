# JScriptor Example Project

This is an example project demonstrating JScriptor's configuration-based type checking system.

## Project Structure

```
example-project/
├── jscriptor.config.js    # JScriptor configuration
├── src/
│   ├── app.js            # Main application (no errors)
│   ├── errors.js         # File with intentional type errors
│   ├── utils/
│   │   ├── math.js       # Math utilities (no errors)
│   │   └── string.js     # String utilities (no errors)
│   └── components/
│       └── calculator.js # Calculator component (no errors)
└── tests/
    └── test.js           # Test file (excluded from type checking)
```

## Configuration

The `jscriptor.config.js` file configures:

- **Include**: `src/**/*.js` - Check all JS files in src directory
- **Exclude**: Test files and build directories
- **Type checking options**: Inference, return types, parameter types

## Usage

From the JScriptor root directory:

```bash
# Initialize a new config (already done)
node src/cli.js init

# Check a single file
node src/cli.js check example-project/src/app.js

# Check all files based on config
node src/cli.js check-all

# Show help
node src/cli.js help
```

## Expected Results

- **app.js, math.js, string.js, calculator.js**: Should pass type checking
- **errors.js**: Should show multiple type errors
- **tests/test.js**: Should be excluded from checking

## Type Errors in errors.js

The `errors.js` file contains intentional type errors:

1. Adding number and string
2. Multiplying boolean and number
3. Passing number to string function
4. Ternary with non-boolean condition
5. Function call with wrong argument types
