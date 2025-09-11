const { test, assert, assertEqual, summarize } = require("./test");
const { compile } = require("../compile");
const { typeCheck } = require("../03-typecheck/types");

function runTypeCheck(source) {
  const ast = compile(source);
  const result = typeCheck(ast);
  return result;
}

test("const annotation matches initializer", () => {
  const res = runTypeCheck(`const x: number = 3; const y = x + "2";`);
  assertEqual(res.errors, [], "Expected no errors for valid numeric ops");
});

// test("const annotation mismatch reports error", () => {
//   const res = runTypeCheck(`const x: number = "hi";`);
//   assert(res.errors.length > 0, "Expected an error for number = string");
// });

// test("addition type mismatch number + string", () => {
//   const res = runTypeCheck(`const x = 1 + "a";`);
//   assert(res.errors.length > 0, "Expected an error for 1 + 'a'");
// });

// test("multiplication enforces numbers", () => {
//   const res = runTypeCheck(`const x = 2 * true; const y = "a" * 3;`);
//   assert(res.errors.length >= 2, "Expected errors for non-number operands of *");
// });

// test("ternary requires boolean condition", () => {
//   const res = runTypeCheck(`const x = 1 ? 2 : 3;`);
//   assert(res.errors.length > 0, "Expected error for non-boolean condition");
// });

// test("ternary branches must match types", () => {
//   const res = runTypeCheck(`const x = true ? 2 : "a";`);
//   assert(res.errors.length > 0, "Expected error for mismatched ternary branches");
// });

// test("array elements must be consistent", () => {
//   const ok = runTypeCheck(`const xs = [1, 2, 3];`);
//   assertEqual(ok.errors, [], "Expected no error for homogeneous array");
//   const bad = runTypeCheck(`const xs = [1, "a"];`);
//   assert(bad.errors.length > 0, "Expected error for mixed-type array");
// });

// test("function return annotation is enforced", () => {
//   const bad = runTypeCheck(`const f = (): number => { return "a"; };`);
//   assert(bad.errors.length > 0, "Expected error for wrong return type");
//   const ok = runTypeCheck(`const f = (): number => { return 1 + 2; };`);
//   assertEqual(ok.errors, [], "Expected no error for correct return type");
// });

// test("function type annotation on const enforces params and return", () => {
//   const bad = runTypeCheck(
//     `const f: (x: number) => number = (x) => { return x + "a"; };`,
//   );
//   assert(bad.errors.length > 0, "Expected error for annotated function");

//   const ok = runTypeCheck(
//     `const f: (x: number) => number = (x) => { return x + x; };`,
//   );
//   assertEqual(ok.errors, [], "Expected ok for matching function annotation");
// });

// test("Array<T> annotation enforces element types", () => {
//   const ok = runTypeCheck(`const xs: Array<number> = [1, 2, 3];`);
//   assertEqual(ok.errors, [], "Expected no errors for Array<number>");
//   const bad = runTypeCheck(`const xs: Array<number> = [1, "a"];`);
//   assert(bad.errors.length > 0, "Expected errors for Array<number> with string");
// });

// test("object literal with object type annotation", () => {
//   const ok = runTypeCheck(`const p: { a: number, b: string } = { a: 1, b: "x" };`);
//   assertEqual(ok.errors, [], "Expected no errors for matching object type");
//   const bad = runTypeCheck(`const p: { a: number, b: string } = { a: "x", b: 2 };`);
//   assert(bad.errors.length > 0, "Expected errors for wrong object fields");
// });

// env = runTypeCheck(`const v: number | string = 1; const w: number | string = "x";`);
// assertEqual(env.errors, [], "Expected unions to accept either side");

summarize();


