// JavaScript code with intentional type errors
const { add, multiply } = require('./utils');

// Type error: adding number and string
const badMath = add(5, "hello");

// Type error: multiplying boolean and number  
const badMultiply = multiply(true, 10);

// Type error: passing number to string function
const badString = "Hello" + 42;

// Type error: ternary with non-boolean condition
const badTernary = 5 ? "yes" : "no";

// Type error: function call with wrong argument types
const badCall = add("world", true);

// Type error: array access with string instead of number
const arr = [1, 2, 3];
const badAccess = arr["0"];

// Type error: object property access with number
const obj = { name: "John" };
const badProperty = obj[42];

console.log("This file contains multiple type errors!");
