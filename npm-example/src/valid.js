// Valid JavaScript code - no type errors
const { add, multiply } = require('./utils');

// Valid function calls
const sum = add(5, 10);
const product = multiply(3, 4);

// Valid string operations
const message = "Hello" + " " + "World";
const greeting = "Hi there!";

// Valid conditional expressions
const isEven = (num) => num === 8;
const result = isEven(8) ? "even" : "odd";

// Valid array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2);

// Valid object operations
const person = {
  name: "John",
  age: 30,
  greet: () => "Hello!"
};

console.log("All operations are type-safe!");
