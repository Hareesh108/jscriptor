const { compile } = require("./02-parse");
// const { nameCheck } = require("./naming");
const { typeCheck } = require("./03-typecheck");
const {
  test,
  assert,
  assertEqual,
  summarize: reportTestFailures,
} = require("./test");

// // Basic tests to ensure the type system works
// test("Type-check empty program", () => {
//   const statements = compile("");
//   const result = typeCheck(statements);

//   assertEqual(result.errors, [], "Empty program should have no type errors");
// });

// // Polymorphic Functions Tests

// test("Identity function with numeric type", () => {
//   const statements = compile(`
//     const identity = (x) => { return x; };
//     const result = identity(5);
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for identity function with number",
//   );
// });

// test("Identity function with string type", () => {
//   const statements = compile(`
//     const identity = (x) => { return x; };
//     const result = identity("hello");
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for identity function with string",
//   );
// });

// test("Identity function with boolean type", () => {
//   const statements = compile(`
//     const identity = (x) => { return x; };
//     const result = identity(true);
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for identity function with boolean",
//   );
// });

// test("Higher-order function with function parameter", () => {
//   const statements = compile(`
//     const applyToFive = (fn) => { return fn(5); };
//     const add1 = (x) => { return x + 1; };
//     const result = applyToFive(add1);
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for higher-order function",
//   );
// });

// test("Higher-order function with different function types", () => {
//   const statements = compile(`
//     const applyFn = (fn, x) => { return fn(x); };
//     const add1 = (x) => { return x + 1; };
//     const numResult = applyFn(add1, 5);

//     const concat = (s) => { return s + "!"; };
//     const strResult = applyFn(concat, "hello");
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for polymorphic higher-order function",
//   );
// });

// test("Type-preserving function chain", () => {
//   const statements = compile(`
//     const double = (x) => { return x + x; };
//     const addExclamation = (x) => { return x + "!"; };

//     const num = 5;
//     const doubledNum = double(num);

//     const str = "hello";
//     const exclaimed = addExclamation(str);
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for type-preserving function chain",
//   );
// });

// test("Type error in polymorphic function", () => {
//   const statements = compile(`
//     const double = (x) => { return x + x; };
//     const num = 5;
//     const str = "hello";

//     const doubledNum = double(num);
//     const mixed = double(num) + double(str);
//   `);
//   const result = typeCheck(statements);

//   console.log("result:",result);
  

//   assert(
//     result.errors.length === 1 &&
//       result.errors[0].message.includes("Type mismatch"),
//     "Should detect type mismatch in expression using polymorphic functions",
//   );
// });

// // Array Tests

// test("Homogeneous number array", () => {
//   const statements = compile(`
//     const numbers = [1, 2, 3, 4, 5];
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for homogeneous number array",
//   );
// });

// test("Homogeneous string array", () => {
//   const statements = compile(`
//     const strings = ["a", "b", "c", "d"];
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for homogeneous string array",
//   );
// });

// test("Homogeneous boolean array", () => {
//   const statements = compile(`
//     const booleans = [true, false, true, true];
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for homogeneous boolean array",
//   );
// });

// test("Detect heterogeneous array type mismatch", () => {
//   const statements = compile(`
//     const mixed = [1, "hello", true];
//   `);
//   const result = typeCheck(statements);

//   assert(
//     result.errors.length > 0 && result.errors[0].message.includes("array"),
//     "Should detect type mismatch in heterogeneous array",
//   );
// });

// test("Nested arrays with consistent types", () => {
//   const statements = compile(`
//     const matrix = [[1, 2], [3, 4], [5, 6]];
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for nested arrays with consistent types",
//   );
// });

// test("Array-returning function", () => {
//   const statements = compile(`
//     const makeArray = (x, y, z) => { return [x, y, z]; };
//     const numbers = makeArray(1, 2, 3);
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for array-returning function",
//   );
// });

// test("Function creating different array types", () => {
//   const statements = compile(`
//     const repeat = (x) => { return [x, x, x]; };
//     const numbers = repeat(42);
//     const strings = repeat("hello");
//   `);
//   const result = typeCheck(statements);

//   assertEqual(
//     result.errors,
//     [],
//     "No type errors expected for polymorphic array-creating function",
//   );
// });

// Report test results
reportTestFailures();
