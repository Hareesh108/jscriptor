// Simple JavaScript code with type errors
const add = (x, y) => { return x + y; };
const multiply = (x, y) => { return x * y; };

const num = 5;
const str = "hello";

// Type error: adding number and string
const badMath = add(num, str);

// Type error: multiplying boolean and number
const badMultiply = multiply(true, num);

// Type error: ternary with non-boolean condition
const badTernary = num ? "yes" : "no";

console.log("This file has type errors!");
