// This file contains intentional type errors for testing

const { add, multiply } = require('./utils/math');
const { capitalize } = require('./utils/string');

// Type error: adding number and string
const badMath = add(5, "hello");

// Type error: multiplying boolean and number  
const badMultiply = multiply(true, 10);

// Type error: passing number to string function
const badString = capitalize(42);

// Type error: ternary with non-boolean condition
const badTernary = 5 ? "yes" : "no";

// Type error: function call with wrong argument types
const badCall = add("world", true);

// Export for testing
module.exports = {
  badMath,
  badMultiply,
  badString,
  badTernary,
  badCall
};
