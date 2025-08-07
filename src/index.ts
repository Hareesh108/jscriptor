import { format } from "./formatter";
import { compile } from "./parse";
import { assertEqual, summarize, test } from "./test";

test("Format const declaration", () => {
  const code = "const x = 5;";
  const tree = compile(code);
  const formatted = format(tree);  

  assertEqual(
    formatted,
    "const x = 5;",
    "Should format const declaration correctly",
  );
});

// test("Format arrow function", () => {
//   const code = "const add = (a, b) => { return a + b; };";
//   const tree = compile(code);
//   const formatted = format(tree);

//   console.log("formatted:",formatted);
  

//   assertEqual(
//     formatted,
//     "const add = (a, b) => {\n  return a + b;\n};",
//     "Should format arrow functions with proper indentation",
//   );
// });

summarize();
