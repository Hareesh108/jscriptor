// import fs from "fs";
// import path from "path";

// import { format } from "./formatter";
const { compile } =  require("./02-parse")
import { assertEqual, summarize, test } from "./test"
const { typeCheck } = require("./03-typecheck");

// test("Format const declaration", () => {
//   const code = "const x = 5;";
//   const tree = compile(code);
//   const formatted = format(tree);  

//   assertEqual(
//     formatted,  
//     "const x = 5;",
//     "Should format const declaration correctly",
//   );
// });

// test("Format arrow function", () => {
//   const filePath = path.join(__dirname, "example.ts");

//   const code = fs.readFileSync(filePath, "utf-8");  
  
//   const tree = compile(code);

//   console.log("tree:",tree);

//   const formatted = format(tree);

//   console.log("formatted:",formatted);
  

//   assertEqual(
//     formatted,
//     "const add = (a, b) => {\n  return a + b;\n};",
//     "Should format arrow functions with proper indentation",
//   );
// });

test("Type error in polymorphic function", () => {
  const statements = compile(`
    const double = (x) => { return x + x; };
    const num = 5;
    const str = "hello";

    const doubledNum = double(num);
    const mixed = double(num) + double(str);
  `);
  const result = typeCheck(statements);

  console.log("result:",result);
  

  assert(
    result.errors.length === 1 &&
      result.errors[0].message.includes("Type mismatch"),
    "Should detect type mismatch in expression using polymorphic functions",
  );
});

summarize();
