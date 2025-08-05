const { tokenize } = require("./tokenize");
const { parse, compile } = require("./parse");
const { format, formatSourceCode } = require("./formatter");
const {
  test,
  assert,
  assertEqual,
  summarize: reportTestFailures,
} = require("../test/test");

// test("Format const declaration", () => {
//   const code = "const x = 5;";
//   const tree = compile(code);
//   const formatted = format(tree);

//   console.log("formatted:",formatted);
  

//   assertEqual(
//     formatted,
//     "const x = 5;",
//     "Should format const declaration correctly",
//   );
// });

// test("Format const declaration with type annotation", () => {
//   const code = "const x: number = 5;";
//   const tree = compile(code);
//   const formatted = format(tree);

//   assertEqual(
//     formatted,
//     "const x: number = 5;",
//     "Should preserve type annotations",
//   );
// });

// test("Format string literal", () => {
//   const code = 'const message = "hello world";';
//   const tree = compile(code);
//   const formatted = format(tree);

//   assertEqual(
//     formatted,
//     'const message = "hello world";',
//     "Should format string literals correctly",
//   );
// });

// test("Format binary expression", () => {
//   const code = "const sum = 1 + 2;";
//   const tree = compile(code);
//   const formatted = format(tree);

//   assertEqual(
//     formatted,
//     "const sum = 1 + 2;",
//     "Should format binary expressions correctly",
//   );
// });

// test("Format array literal", () => {
//   const code = "const numbers = [1, 2, 3];";
//   const tree = compile(code);
//   const formatted = format(tree);

//   assertEqual(
//     formatted,
//     "const numbers = [1, 2, 3];",
//     "Should format array literals correctly",
//   );
// });

// test("Format empty array literal", () => {
//   const code = "const emptyArray = [];";
//   const tree = compile(code);
//   const formatted = format(tree);

//   assertEqual(
//     formatted,
//     "const emptyArray = [];",
//     "Should format empty array literals correctly",
//   );
// });

test("Format arrow function", () => {
  const code = "const add = (a, b) => { return a + b; };";
  const tree = compile(code);
  const formatted = format(tree);

  console.log("formatted:",formatted);
  

  assertEqual(
    formatted,
    "const add = (a, b) => {\n  return a + b;\n};",
    "Should format arrow functions with proper indentation",
  );
});

// test("Format arrow function with type annotations", () => {
//   const code =
//     "const add = (a: number, b: number): number => { return a + b; };";
//   const tree = compile(code);
//   const formatted = format(tree);

//   assertEqual(
//     formatted,
//     "const add = (a: number, b: number): number => {\n  return a + b;\n};",
//     "Should preserve type annotations in arrow functions",
//   );
// });

// test("Format function call", () => {
//   const code = "const result = add(1, 2);";
//   const tree = compile(code);
//   const formatted = format(tree);

//   assertEqual(
//     formatted,
//     "const result = add(1, 2);",
//     "Should format function calls correctly",
//   );
// });

// test("Format ternary expression", () => {
//   const code = 'const result = true ? "yes" : "no";';
//   const tree = compile(code);
//   const formatted = format(tree);

//   assertEqual(
//     formatted,
//     'const result = true ? "yes" : "no";',
//     "Should format ternary expressions correctly",
//   );
// });

// test("Format multiple statements", () => {
//   const code = 'const x = 5;\nconst y = "hello";\nconst z = x;';
//   const tree = compile(code);
//   const formatted = format(tree);

//   assertEqual(
//     formatted,
//     'const x = 5;\nconst y = "hello";\nconst z = x;',
//     "Should format multiple statements with line breaks",
//   );
// });

// test("Format nested structures", () => {
//   const code = "const complex = (a) => { return [1, a ? 2 : 3, 4]; };";
//   const tree = compile(code);
//   const formatted = format(tree);

//   assertEqual(
//     formatted,
//     "const complex = (a) => {\n  return [1, a ? 2 : 3, 4];\n};",
//     "Should format nested structures correctly",
//   );
// });

// // Formatting roundtrip tests
// test("Formatting roundtrip for simple code", () => {
//   const originalCode = "const    x=5;";
//   const firstPass = formatSourceCode(originalCode);
//   const secondPass = formatSourceCode(firstPass);

//   assertEqual(
//     firstPass,
//     secondPass,
//     "Second formatting should not change anything",
//   );
// });

// test("Formatting roundtrip for arrow function", () => {
//   const originalCode = "const add=(a,b)=>{return a+b;}";
//   const firstPass = formatSourceCode(originalCode);
//   const secondPass = formatSourceCode(firstPass);

//   assertEqual(
//     firstPass,
//     secondPass,
//     "Second formatting should not change anything",
//   );
// });

// test("Formatting roundtrip with messy indentation", () => {
//   const originalCode = "const fn = () => {\n    return 42;\n         };";
//   const firstPass = formatSourceCode(originalCode);
//   const secondPass = formatSourceCode(firstPass);

//   assertEqual(
//     firstPass,
//     secondPass,
//     "Second formatting should not change anything",
//   );
// });

// test("Formatting roundtrip with type annotations", () => {
//   const originalCode = "const add=(a:number,b:number):number=>{return a+b;}";
//   const firstPass = formatSourceCode(originalCode);
//   const secondPass = formatSourceCode(firstPass);

//   assertEqual(
//     firstPass,
//     secondPass,
//     "Second formatting should not change anything",
//   );
// });

// test("Formatting roundtrip for complex nested structure", () => {
//   const originalCode =
//     "const complex=(a)=>{return[1,a?2:3,(b)=>{return b+1;}];}";
//   const firstPass = formatSourceCode(originalCode);
//   const secondPass = formatSourceCode(firstPass);

//   assertEqual(
//     firstPass,
//     secondPass,
//     "Second formatting should not change anything",
//   );
// });

reportTestFailures();
