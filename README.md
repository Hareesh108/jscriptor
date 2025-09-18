# 🛠️ JS Scriptor — Lightweight Typed Superset for JavaScript

**JS Scriptor** is a lightweight, **typed superset 🚀** of JavaScript that catches type errors early and keeps your codebase clean and maintainable—without any heavy setup.

---

## ✨ Features

* 🔍 Detects type mismatches in variables, function calls, and expressions
* 🧠 Supports polymorphic functions (adaptable to multiple types)
* 📦 Zero configuration — install and run
* 💡 Clear CLI output for faster debugging

---

## 📦 Installation

```bash
npm install --save-dev jscriptor
````

---

## ⚡ Quick Start

1. Create your program:

```js
// myProgram.js
const double = (x) => { return x + x; };
const num = 5;
const str = "hello";

const doubledNum = double(num);
const mixed = double(num) + double(str); // ❌ Type error
```

2. Add to `package.json` scripts:

```json
{
  "scripts": {
    "typecheck": "jscriptor myProgram.js"
  }
}
```

3. Run type checking:

```bash
npm run typecheck
```

---

## 🖥 Example Output

```plaintext
❌ Type mismatch in binary operation: cannot add Number to String
```

---

## 🧪 More Examples

✅ No type errors:

```js
const identity = (x) => { return x; };
const result = identity(42);
```

❌ Type mismatch:

```js
const add1 = (x) => { return x + 1; };
const res = add1("hello"); // ❌ Error
```

---

## 🛠 How It Works

![Compiler Design](https://raw.githubusercontent.com/Hareesh108/jscriptor/main/docs/design.png)

* **compile** → Parses JavaScript into an AST
* **typeCheck** → Infers and validates types
* **nameCheck** → Checks naming and scope rules

---

```bash
# Initialize a new project
jscriptor init

# Check a single file
jscriptor check src/app.js

# Check entire project based on config
jscriptor check-all

# Show help
jscriptor help
```

## 📋 Roadmap

* 🌐 Enhanced CLI output with code highlighting
* 🧩 Plugin system for custom rules
* 🖍 VS Code integration

---

## 🔧 Local Development Setup

If you want to contribute or test **JS Scriptor** locally instead of installing from npm:

1. **Clone the repo**

   ```bash
   git clone https://github.com/Hareesh108/jscriptor.git
   cd jscriptor
    ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Link the CLI locally**
   This makes the `jscriptor` command available on your system:

   ```bash
   npm link
   ```

4. **Test it on an example file**

   ```bash
   echo 'const x = 5; const y = "hi"; const z = x + y;' > examples/test.js
   jscriptor examples/test.js
   ```

   ✅ You should see a type error reported for mixing `Number` and `String`.

5. **Unlink when done**
   If you no longer want the global link:

   ```bash
   npm unlink -g jscriptor
   ```

---

### 🛠 Development Workflow

* **Source code** lives in `src/`
* **CLI entrypoint** → `src/cli.js`
* **Parser** → `src/02-parse/`
* **Type checker** → `src/03-typecheck/`
* **Compiler** → `src/compile.js`

You can run your local changes directly with:

```bash
jscriptor check ./src/test/check.js 
```

## 📜 License

MIT © 2025 [Hareesh Bhittam](https://github.com/Hareesh108/jscriptor)
