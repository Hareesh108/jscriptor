# JScriptor NPM Example

This example demonstrates how to use JScriptor from the npm registry in a real project.

## Setup

1. Install JScriptor as a dev dependency:

```bash
npm install --save-dev jscriptor
```

2. Initialize JScriptor configuration:

```bash
npm run init
```

3. Run type checking:

```bash
npm run typecheck
```

## Project Structure

- `src/` - Source files to be type-checked
- `jscriptor.config.js` - JScriptor configuration (created by `npm run init`)
- `package.json` - Project dependencies and scripts

## Files

- `src/valid.js` - Valid JavaScript code (no type errors)
- `src/errors.js` - JavaScript code with intentional type errors
- `src/utils.js` - Utility functions

## Testing

Run the type checker to see JScriptor in action:

```bash
# Check all files
npm run typecheck

# Check a specific file
npm run typecheck:file src/errors.js
```
